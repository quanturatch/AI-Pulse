import type { AggregatedData } from "./types";
import { getCacheTtl } from "./cache";

let memoryCache: AggregatedData | null = null;
let memoryCacheAt = 0;

export function readMemoryCache(): AggregatedData | null {
  if (!memoryCache) return null;
  const age = (Date.now() - memoryCacheAt) / 1000;
  if (age > getCacheTtl()) {
    memoryCache = null;
    return null;
  }
  return memoryCache;
}

export function writeMemoryCache(data: AggregatedData): void {
  memoryCache = data;
  memoryCacheAt = Date.now();
}

export function readStaleMemoryCache(): AggregatedData | null {
  return memoryCache;
}