import {
  TOPIC_QUERIES,
  QUANTUM_QUERIES,
  VENDOR_CHANNELS,
  RSS_FEEDS,
} from "./config";
import type { AggregatedData } from "./types";
import { readCache, writeCache, readStaleCache, CACHE_VERSION } from "./cache";
import {
  fetchAllTopicVideos,
  fetchAllQuantumVideos,
  fetchAllVendorVideos,
  isYouTubeConfigured,
  resetYouTubeKeyState,
} from "./youtube";
import { fetchAllRssArticles } from "./rss";
import { fetchTavilyArticles } from "./tavily";
import { fetchTopAiSecurityRepos } from "./github";
import { dedupeArticlesByUrl } from "./dedupe";

let refreshPromise: Promise<AggregatedData> | null = null;

function buildTopicSections(
  queries: typeof TOPIC_QUERIES | typeof QUANTUM_QUERIES,
  videoMap: Record<string, import("./types").VideoItem[]>
) {
  return queries.map((topic) => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    icon: topic.icon,
    gradient: topic.gradient,
    videos: videoMap[topic.id] || [],
  }));
}

async function settle<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`Failed to fetch ${label}:`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function refreshAllData(): Promise<AggregatedData> {
  resetYouTubeKeyState();

  // Phase 1: fast sources (RSS, Tavily, GitHub) — always finish first
  const [rssArticles, tavilyArticles, githubRepos] = await Promise.all([
    settle("RSS articles", fetchAllRssArticles, []),
    settle("Tavily articles", fetchTavilyArticles, []),
    settle("GitHub repos", fetchTopAiSecurityRepos, []),
  ]);

  // Phase 2: YouTube (slow) — use stale videos if timeout (Vercel 10s limit)
  const stale = await readStaleCache();
  const youtubeTimeout = process.env.VERCEL ? 20_000 : 120_000;

  const [topicVideos, quantumVideos, vendorVideos] = await Promise.all([
    withTimeout(
      settle("topic videos", fetchAllTopicVideos, {}),
      youtubeTimeout,
      stale
        ? Object.fromEntries(stale.topics.map((t) => [t.id, t.videos]))
        : {}
    ),
    withTimeout(
      settle("quantum videos", fetchAllQuantumVideos, {}),
      youtubeTimeout,
      stale
        ? Object.fromEntries(stale.quantum.map((t) => [t.id, t.videos]))
        : {}
    ),
    withTimeout(
      settle("vendor videos", fetchAllVendorVideos, {}),
      youtubeTimeout,
      stale
        ? Object.fromEntries(stale.vendors.map((v) => [v.id, v.videos]))
        : {}
    ),
  ]);

  const topics = buildTopicSections(TOPIC_QUERIES, topicVideos);
  const quantum = buildTopicSections(QUANTUM_QUERIES, quantumVideos);

  const vendors = VENDOR_CHANNELS.map((vendor) => ({
    id: vendor.id,
    name: vendor.name,
    logo: vendor.logo,
    accent: vendor.accent,
    channelUrl: vendor.channelUrl,
    videos: vendorVideos[vendor.id] || [],
  }));

  const articles = dedupeArticlesByUrl(rssArticles);
  const tavily = dedupeArticlesByUrl(tavilyArticles);

  const totalVideos =
    topics.reduce((s, t) => s + t.videos.length, 0) +
    quantum.reduce((s, t) => s + t.videos.length, 0) +
    vendors.reduce((s, v) => s + v.videos.length, 0);

  const data: AggregatedData = {
    topics,
    quantum,
    vendors,
    articles,
    tavilyArticles: tavily,
    githubRepos,
    lastUpdated: new Date().toISOString(),
    stats: {
      totalVideos,
      totalArticles: articles.length + tavily.length,
      totalRepos: githubRepos.length,
      sources:
        RSS_FEEDS.length +
        TOPIC_QUERIES.length +
        QUANTUM_QUERIES.length +
        VENDOR_CHANNELS.length +
        1,
    },
    youtubeConfigured: isYouTubeConfigured(),
    cacheVersion: CACHE_VERSION,
  };

  await writeCache(data);
  return data;
}

async function refreshWithLock(): Promise<AggregatedData> {
  if (!refreshPromise) {
    refreshPromise = refreshAllData().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function emptyFallback(): AggregatedData {
  return {
    topics: buildTopicSections(TOPIC_QUERIES, {}),
    quantum: buildTopicSections(QUANTUM_QUERIES, {}),
    vendors: VENDOR_CHANNELS.map((v) => ({
      id: v.id,
      name: v.name,
      logo: v.logo,
      accent: v.accent,
      channelUrl: v.channelUrl,
      videos: [],
    })),
    articles: [],
    tavilyArticles: [],
    githubRepos: [],
    lastUpdated: new Date().toISOString(),
    stats: { totalVideos: 0, totalArticles: 0, totalRepos: 0, sources: 0 },
    youtubeConfigured: isYouTubeConfigured(),
  };
}

export async function getAggregatedData(
  force = false
): Promise<AggregatedData> {
  if (!force) {
    const cached = await readCache();
    if (cached) return cached;
  }

  try {
    return await refreshWithLock();
  } catch (err) {
    console.error("Failed to refresh data:", err);
    const stale = await readStaleCache();
    if (stale) return stale;
    return emptyFallback();
  }
}