import { GITHUB_REPO_SEARCHES, GITHUB_REPOS_LIMIT } from "./config";
import type { RepoItem } from "./types";

interface GitHubSearchRepo {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
  open_issues_count: number;
}

interface GitHubSearchResponse {
  items: GitHubSearchRepo[];
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function mapRepo(repo: GitHubSearchRepo): RepoItem {
  return {
    id: `github-${repo.id}`,
    name: repo.full_name,
    url: repo.html_url,
    description: repo.description || "No description provided.",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    starsLabel: formatCount(repo.stargazers_count),
    forksLabel: formatCount(repo.forks_count),
    language: repo.language || undefined,
    topics: repo.topics?.slice(0, 5) || [],
    updatedAt: repo.updated_at,
    openIssues: repo.open_issues_count,
  };
}

export function isGitHubConfigured(): boolean {
  return !!process.env.GITHUB_TOKEN?.trim();
}

export async function fetchTopAiSecurityRepos(
  limit = GITHUB_REPOS_LIMIT
): Promise<RepoItem[]> {
  const token = process.env.GITHUB_TOKEN?.trim();
  const seen = new Map<string, RepoItem>();

  for (const query of GITHUB_REPO_SEARCHES) {
    const url = new URL("https://api.github.com/search/repositories");
    url.searchParams.set("q", query);
    url.searchParams.set("sort", "stars");
    url.searchParams.set("order", "desc");
    url.searchParams.set("per_page", "10");

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "AI-Pulse/1.0 (+https://quanturatech.com)",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(url.toString(), {
        headers,
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`GitHub API error (${query}):`, err);
        continue;
      }

      const json = (await res.json()) as GitHubSearchResponse;
      for (const repo of json.items || []) {
        if (!seen.has(repo.full_name)) {
          seen.set(repo.full_name, mapRepo(repo));
        }
      }
    } catch (err) {
      console.error(`GitHub fetch failed (${query}):`, err);
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => b.stars - a.stars)
    .slice(0, limit)
    .map((repo, index) => ({ ...repo, rank: index + 1 }));
}