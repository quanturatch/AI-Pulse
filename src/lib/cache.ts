import { promises as fs } from "fs";
import path from "path";
import type { AggregatedData } from "./types";
import { isYouTubeConfigured } from "./youtube";
import {
  readMemoryCache,
  writeMemoryCache,
  readStaleMemoryCache,
} from "./memory-cache";

export const CACHE_VERSION = 4;

const LEGACY_TAVILY_ID = /^tavily-aHR0cHM6Ly93d3cu-\d+$/;

function getCacheDir(): string {
  // Vercel serverless: only /tmp is writable
  if (process.env.VERCEL) {
    return path.join("/tmp", "ai-pulse");
  }
  return path.join(process.cwd(), "data");
}

function getCacheFile(): string {
  return path.join(getCacheDir(), "cache.json");
}

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

function validateCache(data: AggregatedData): boolean {
  const age = (Date.now() - new Date(data.lastUpdated).getTime()) / 1000;
  if (age > getCacheTtl()) return false;
  if (isEmptyVideoCache(data) && isYouTubeConfigured()) return false;
  if (hasStaleTavilyIds(data)) return false;
  if (isMissingQuantumTab(data)) return false;
  if (isMissingDurationMetadata(data)) return false;
  if (isMissingAiSecurityTopic(data)) return false;
  if (!data.githubRepos) return false;
  if (data.cacheVersion !== CACHE_VERSION) return false;
  return true;
}

async function readFileCache(): Promise<AggregatedData | null> {
  try {
    const raw = await fs.readFile(getCacheFile(), "utf-8");
    const data = JSON.parse(raw) as AggregatedData;
    return validateCache(data) ? data : null;
  } catch {
    return null;
  }
}

export async function readCache(): Promise<AggregatedData | null> {
  const mem = readMemoryCache();
  if (mem && validateCache(mem)) return mem;

  const file = await readFileCache();
  if (file) {
    writeMemoryCache(file);
    return file;
  }
  return null;
}

export async function clearCache(): Promise<void> {
  try {
    await fs.unlink(getCacheFile());
  } catch {
    // ignore
  }
}

export async function writeCache(data: AggregatedData): Promise<void> {
  writeMemoryCache(data);
  try {
    const dir = getCacheDir();
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(getCacheFile(), JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Non-fatal on Vercel — memory cache still holds data
    console.warn("File cache write skipped:", err instanceof Error ? err.message : err);
  }
}

export async function readStaleCache(): Promise<AggregatedData | null> {
  const mem = readStaleMemoryCache();
  if (mem) return mem;
  try {
    const raw = await fs.readFile(getCacheFile(), "utf-8");
    return JSON.parse(raw) as AggregatedData;
  } catch {
    return null;
  }
}