import type { RepoItem } from "@/lib/types";
import { RepoCard } from "./RepoCard";

interface RepoGridProps {
  repos: RepoItem[];
}

export function RepoGrid({ repos }: RepoGridProps) {
  if (repos.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-sm text-white/40">
        No GitHub repos loaded — add an optional GITHUB_TOKEN to .env and refresh.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {repos.map((repo, i) => (
        <RepoCard key={repo.id} repo={repo} index={i} />
      ))}
    </div>
  );
}