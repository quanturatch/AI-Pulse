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

export async function refreshAllData(): Promise<AggregatedData> {
  const [topicVideos, quantumVideos, vendorVideos, rssArticles, tavilyArticles, githubRepos] =
    await Promise.all([
      fetchAllTopicVideos(),
      fetchAllQuantumVideos(),
      fetchAllVendorVideos(),
      fetchAllRssArticles(),
      fetchTavilyArticles(),
      fetchTopAiSecurityRepos(),
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

  const totalVideos =
    topics.reduce((s, t) => s + t.videos.length, 0) +
    quantum.reduce((s, t) => s + t.videos.length, 0) +
    vendors.reduce((s, v) => s + v.videos.length, 0);

  const data: AggregatedData = {
    topics,
    quantum,
    vendors,
    articles: dedupeArticlesByUrl(rssArticles),
    tavilyArticles: dedupeArticlesByUrl(tavilyArticles),
    githubRepos,
    lastUpdated: new Date().toISOString(),
    stats: {
      totalVideos,
      totalArticles: rssArticles.length + tavilyArticles.length,
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
}