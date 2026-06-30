import Parser from "rss-parser";
import { RSS_FEEDS, ARTICLES_PER_FEED } from "./config";
import type { ArticleItem } from "./types";

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "AI-Pulse/1.0 (+https://quanturatech.com)" },
});

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

async function fetchFeed(
  name: string,
  url: string
): Promise<ArticleItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).slice(0, ARTICLES_PER_FEED).map((item, i) => {
      const description =
        stripHtml(item.contentSnippet || item.content || item.summary || "");
      const image =
        (item as { enclosure?: { url?: string } }).enclosure?.url ||
        extractImageFromContent(item.content || "");

      return {
        id: `rss-${name}-${i}-${item.link || i}`,
        title: item.title || "Untitled",
        description: description.slice(0, 280),
        url: item.link || "#",
        source: name,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        image,
      };
    });
  } catch (err) {
    console.error(`RSS feed error (${name}):`, err instanceof Error ? err.message : err);
    return [];
  }
}

function extractImageFromContent(content: string): string | undefined {
  const match = content.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1];
}

export async function fetchAllRssArticles(): Promise<ArticleItem[]> {
  const results = await Promise.all(
    RSS_FEEDS.map((feed) => fetchFeed(feed.name, feed.url))
  );

  const seen = new Set<string>();
  const merged: ArticleItem[] = [];

  for (const batch of results) {
    for (const article of batch) {
      if (seen.has(article.url)) continue;
      seen.add(article.url);
      merged.push(article);
    }
  }

  return merged.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}