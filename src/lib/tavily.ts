import { createHash } from "crypto";
import { TAVILY_QUERIES, TAVILY_RESULTS_PER_QUERY } from "./config";
import type { ArticleItem } from "./types";

function tavilyArticleId(url: string): string {
  return `tavily-${createHash("sha256").update(url).digest("base64url")}`;
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  published_date?: string;
  score: number;
}

interface TavilyResponse {
  results: TavilyResult[];
}

function getApiKeys(): string[] {
  return [process.env.TAVILY_API_KEY, process.env.TAVILY_API_KEY_2].filter(
    (k): k is string => !!k && k.length > 0
  );
}

async function tavilySearch(
  apiKey: string,
  query: string,
  maxResults: number
): Promise<TavilyResult[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: maxResults,
      include_answer: false,
      include_raw_content: false,
      topic: "news",
    }),
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tavily API error: ${res.status} — ${err}`);
  }

  const json = (await res.json()) as TavilyResponse;
  return json.results || [];
}

async function searchWithFallback(
  query: string,
  maxResults: number
): Promise<TavilyResult[]> {
  const keys = getApiKeys();
  if (keys.length === 0) return [];

  for (let i = 0; i < keys.length; i++) {
    try {
      return await tavilySearch(keys[i], query, maxResults);
    } catch (err) {
      console.error(
        `Tavily key ${i + 1} failed for "${query}":`,
        err instanceof Error ? err.message : err
      );
      if (i === keys.length - 1) return [];
    }
  }
  return [];
}

function mapTavilyResult(result: TavilyResult): ArticleItem {
  const hostname = (() => {
    try {
      return new URL(result.url).hostname.replace("www.", "");
    } catch {
      return "web";
    }
  })();

  return {
    id: tavilyArticleId(result.url),
    title: result.title,
    description: result.content?.slice(0, 280) || "",
    url: result.url,
    source: `Tavily · ${hostname}`,
    publishedAt: result.published_date || new Date().toISOString(),
  };
}

export async function fetchTavilyArticles(): Promise<ArticleItem[]> {
  const allResults: ArticleItem[] = [];
  const seen = new Set<string>();

  for (const query of TAVILY_QUERIES) {
    const results = await searchWithFallback(query, TAVILY_RESULTS_PER_QUERY);
    for (const r of results) {
      if (seen.has(r.url)) continue;
      seen.add(r.url);
      allResults.push(mapTavilyResult(r));
    }
  }

  return allResults.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}