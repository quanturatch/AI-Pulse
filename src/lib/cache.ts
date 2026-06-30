import { promises as fs } from "fs";
import path from "path";
import type { AggregatedData } from "./types";
import { isYouTubeConfigured } from "./youtube";

const CACHE_DIR = path.join(process.cwd(), "data");
const CACHE_FILE = path.join(CACHE_DIR, "cache.json");
export const CACHE_VERSION = 4;

const LEGACY_TAVILY_ID = /^tavily-aHR0cHM6Ly93d3cu-\d+$/;

export function getCacheTtl(): number {
  const ttl = parseInt(process.env.CACHE_TTL_SECONDS || "14400", 10);
  return isNaN(ttl) ? 14400 : ttl;
}

function isEmptyVideoCache(data: AggregatedData): boolean {
  const topicVideos = data.topics.reduce((s, t) => s + t.videos.length, 0);
  const vendorVideos = data.vendors.reduce((s, v) => s + v.videos.length, 0);
  return topicVideos + vendorVideos === 0;
}

function hasStaleTavilyIds(data: AggregatedData): boolean {
  const ids = data.tavilyArticles.map((a) => a.id);
  const hasLegacy = data.tavilyArticles.some((a) => LEGACY_TAVILY_ID.test(a.id));
  const hasDupes = ids.length !== new Set(ids).size;
  return hasLegacy || hasDupes;
}

function isMissingQuantumTab(data: AggregatedData): boolean {
  return !data.quantum || data.quantum.length === 0;
}

function isMissingAiSecurityTopic(data: AggregatedData): boolean {
  return !data.topics.some((t) => t.id === "ai-security");
}

function isMissingDurationMetadata(data: AggregatedData): boolean {
  const allVideos = [
    ...data.topics.flatMap((t) => t.videos),
    ...(data.quantum?.flatMap((t) => t.videos) ?? []),
    ...data.vendors.flatMap((v) => v.videos),
  ];
  return (
    allVideos.length > 0 &&
    allVideos.some((v) => v.durationSeconds === undefined)
  );
}

export async function readCache(): Promise<AggregatedData | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    const data = JSON.parse(raw) as AggregatedData;
    const age = (Date.now() - new Date(data.lastUpdated).getTime()) / 1000;

    if (age > getCacheTtl()) return null;

    // Re-fetch if cache was built without a YouTube key but key is now set
    if (isEmptyVideoCache(data) && isYouTubeConfigured()) return null;

    // Invalidate legacy Tavily IDs or outdated topic list
    if (hasStaleTavilyIds(data)) return null;
    if (isMissingQuantumTab(data)) return null;
    if (isMissingDurationMetadata(data)) return null;
    if (isMissingAiSecurityTopic(data)) return null;
    if (!data.githubRepos) return null;
    if (data.cacheVersion !== CACHE_VERSION) return null;

    return data;
  } catch {
    return null;
  }
}

export async function clearCache(): Promise<void> {
  try {
    await fs.unlink(CACHE_FILE);
  } catch {
    // cache file may not exist
  }
}

export async function writeCache(data: AggregatedData): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function readStaleCache(): Promise<AggregatedData | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(raw) as AggregatedData;
  } catch {
    return null;
  }
}