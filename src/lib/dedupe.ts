import type { ArticleItem } from "./types";

export function dedupeArticlesByUrl(articles: ArticleItem[]): ArticleItem[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    if (seen.has(article.url)) return false;
    seen.add(article.url);
    return true;
  });
}