import {
  VIDEOS_PER_SECTION,
  MIN_VIDEO_DURATION_SECONDS,
  VIDEO_SEARCH_POOL_SIZE,
  TOPIC_QUERIES,
  QUANTUM_QUERIES,
  VENDOR_CHANNELS,
} from "./config";
import type { VideoItem } from "./types";

interface YouTubeSearchItem {
  id: { videoId?: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { high?: { url: string }; medium?: { url: string } };
    channelTitle: string;
    publishedAt: string;
  };
}

interface PlaylistItem {
  snippet: {
    title: string;
    description: string;
    thumbnails: { high?: { url: string }; medium?: { url: string } };
    channelTitle: string;
    publishedAt: string;
    resourceId: { videoId: string };
  };
}

interface YouTubeListResponse<T> {
  items: T[];
  nextPageToken?: string;
}

const exhaustedKeys = new Set<string>();

function getAllApiKeys(): string[] {
  return [process.env.YOUTUBE_API_KEY, process.env.YOUTUBE_API_KEY_2]
    .filter((k): k is string => !!k?.trim())
    .map((k) => k.trim());
}

function getActiveApiKeys(): string[] {
  return getAllApiKeys().filter((k) => !exhaustedKeys.has(k));
}

export function isYouTubeConfigured(): boolean {
  return getAllApiKeys().length > 0;
}

/** Reset at the start of each data refresh so keys are retried */
export function resetYouTubeKeyState(): void {
  exhaustedKeys.clear();
}

function shouldTryFallback(status: number, body: string): boolean {
  if (status === 429) return true;
  if (status === 403) {
    return (
      body.includes("quotaExceeded") ||
      body.includes("RESOURCE_EXHAUSTED") ||
      body.includes("rateLimitExceeded") ||
      body.includes("dailyLimitExceeded")
    );
  }
  return false;
}

function parseIsoDuration(duration: string | undefined): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function mapVideoFields(
  videoId: string,
  title: string,
  description: string,
  thumbnails: { high?: { url: string }; medium?: { url: string } },
  channelTitle: string,
  publishedAt: string,
  durationSeconds?: number
): VideoItem {
  const thumb =
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  return {
    id: videoId,
    title,
    description,
    thumbnail: thumb,
    channelTitle,
    publishedAt,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    durationSeconds,
    durationLabel:
      durationSeconds !== undefined
        ? formatDuration(durationSeconds)
        : undefined,
  };
}

function mapSearchVideo(item: YouTubeSearchItem): VideoItem | null {
  const videoId = item.id.videoId;
  if (!videoId) return null;
  return mapVideoFields(
    videoId,
    item.snippet.title,
    item.snippet.description,
    item.snippet.thumbnails,
    item.snippet.channelTitle,
    item.snippet.publishedAt
  );
}

function mapPlaylistVideo(item: PlaylistItem): VideoItem | null {
  const videoId = item.snippet.resourceId?.videoId;
  if (!videoId) return null;
  return mapVideoFields(
    videoId,
    item.snippet.title,
    item.snippet.description,
    item.snippet.thumbnails,
    item.snippet.channelTitle,
    item.snippet.publishedAt
  );
}

async function youtubeFetchWithKey<T>(
  apiKey: string,
  endpoint: string,
  params: Record<string, string>
): Promise<{ ok: true; data: YouTubeListResponse<T> } | { ok: false; status: number; body: string }> {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  url.searchParams.set("key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    return { ok: false, status: res.status, body: await res.text() };
  }
  const json = await res.json();
  return {
    ok: true,
    data: { items: json.items || [], nextPageToken: json.nextPageToken },
  };
}

async function youtubeGet<T = unknown>(
  endpoint: string,
  params: Record<string, string>
): Promise<YouTubeListResponse<T>> {
  const keys = getActiveApiKeys();
  if (keys.length === 0) return { items: [] };

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    const result = await youtubeFetchWithKey<T>(apiKey, endpoint, params);

    if (result.ok) return result.data;

    const { status, body } = result;
    if (shouldTryFallback(status, body)) {
      exhaustedKeys.add(apiKey);
      console.warn(
        `YouTube key ${i + 1} limit hit (${endpoint}), trying fallback key...`
      );
      continue;
    }

    console.error(`YouTube API error (${endpoint}):`, body);
    return { items: [] };
  }

  console.error(`YouTube API: all keys exhausted for ${endpoint}`);
  return { items: [] };
}

async function fetchVideoDurations(
  videoIds: string[]
): Promise<Record<string, number>> {
  const durations: Record<string, number> = {};
  if (videoIds.length === 0) return durations;

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const { items } = await youtubeGet<{
      id: string;
      contentDetails: { duration: string };
    }>("videos", {
      part: "contentDetails",
      id: batch.join(","),
    });

    for (const item of items) {
      durations[item.id] = parseIsoDuration(item.contentDetails.duration);
    }
  }

  return durations;
}

async function filterByMinDuration(
  videos: VideoItem[],
  targetCount: number,
  minSeconds = MIN_VIDEO_DURATION_SECONDS
): Promise<VideoItem[]> {
  if (videos.length === 0) return [];

  const durations = await fetchVideoDurations(videos.map((v) => v.id));

  return videos
    .filter((v) => (durations[v.id] ?? 0) >= minSeconds)
    .slice(0, targetCount)
    .map((v) =>
      mapVideoFields(
        v.id,
        v.title,
        v.description,
        { high: { url: v.thumbnail } },
        v.channelTitle,
        v.publishedAt,
        durations[v.id]
      )
    );
}

export async function searchTopicVideos(
  query: string,
  maxResults = VIDEOS_PER_SECTION
): Promise<VideoItem[]> {
  const { items } = await youtubeGet<YouTubeSearchItem>("search", {
    part: "snippet",
    q: query,
    type: "video",
    order: "date",
    maxResults: String(VIDEO_SEARCH_POOL_SIZE),
    relevanceLanguage: "en",
    safeSearch: "moderate",
  });

  const candidates = items
    .map(mapSearchVideo)
    .filter((v): v is VideoItem => v !== null);

  return filterByMinDuration(candidates, maxResults);
}

async function resolveChannelId(handle: string): Promise<string | null> {
  const { items } = await youtubeGet<{ id: string }>("channels", {
    part: "id",
    forHandle: handle,
  });
  return items[0]?.id || null;
}

async function getUploadsPlaylistId(channelId: string): Promise<string | null> {
  const { items } = await youtubeGet<{
    contentDetails: { relatedPlaylists: { uploads: string } };
  }>("channels", {
    part: "contentDetails",
    id: channelId,
  });
  return items[0]?.contentDetails?.relatedPlaylists?.uploads || null;
}

async function getPlaylistVideos(
  playlistId: string,
  maxCandidates: number
): Promise<VideoItem[]> {
  const collected: VideoItem[] = [];
  let pageToken = "";

  while (collected.length < maxCandidates) {
    const params: Record<string, string> = {
      part: "snippet",
      playlistId,
      maxResults: String(Math.min(50, maxCandidates - collected.length)),
    };
    if (pageToken) params.pageToken = pageToken;

    const { items, nextPageToken } = await youtubeGet<PlaylistItem>(
      "playlistItems",
      params
    );

    const batch = items
      .map(mapPlaylistVideo)
      .filter((v): v is VideoItem => v !== null);

    collected.push(...batch);

    if (!nextPageToken || collected.length >= maxCandidates) break;
    pageToken = nextPageToken;
  }

  return collected.slice(0, maxCandidates);
}

export async function getChannelVideos(
  channelId: string,
  maxResults = VIDEOS_PER_SECTION,
  fallbackQuery?: string,
  handle?: string
): Promise<VideoItem[]> {
  let resolvedId = "";
  if (handle) {
    resolvedId = (await resolveChannelId(handle)) || "";
  }
  if (!resolvedId) {
    resolvedId = channelId;
  }

  if (resolvedId) {
    const playlistId = await getUploadsPlaylistId(resolvedId);
    if (playlistId) {
      const candidates = await getPlaylistVideos(
        playlistId,
        VIDEO_SEARCH_POOL_SIZE
      );
      const filtered = await filterByMinDuration(candidates, maxResults);
      if (filtered.length > 0) return filtered;
    }

    const { items } = await youtubeGet<YouTubeSearchItem>("search", {
      part: "snippet",
      channelId: resolvedId,
      type: "video",
      order: "date",
      maxResults: String(VIDEO_SEARCH_POOL_SIZE),
    });
    const fromSearch = items
      .map(mapSearchVideo)
      .filter((v): v is VideoItem => v !== null);
    const filtered = await filterByMinDuration(fromSearch, maxResults);
    if (filtered.length > 0) return filtered;
  }

  if (fallbackQuery) {
    return searchTopicVideos(fallbackQuery, maxResults);
  }

  return [];
}

export async function fetchVideosForQueries(
  queries: readonly { id: string; query: string }[]
): Promise<Record<string, VideoItem[]>> {
  const results: Record<string, VideoItem[]> = {};
  await Promise.all(
    queries.map(async (item) => {
      results[item.id] = await searchTopicVideos(item.query);
    })
  );
  return results;
}

export async function fetchAllTopicVideos(): Promise<
  Record<string, VideoItem[]>
> {
  return fetchVideosForQueries(TOPIC_QUERIES);
}

export async function fetchAllQuantumVideos(): Promise<
  Record<string, VideoItem[]>
> {
  return fetchVideosForQueries(QUANTUM_QUERIES);
}

export async function fetchAllVendorVideos(): Promise<
  Record<string, VideoItem[]>
> {
  const results: Record<string, VideoItem[]> = {};
  await Promise.all(
    VENDOR_CHANNELS.map(async (vendor) => {
      results[vendor.id] = await getChannelVideos(
        vendor.channelId,
        VIDEOS_PER_SECTION,
        vendor.fallbackQuery,
        vendor.handle
      );
    })
  );
  return results;
}