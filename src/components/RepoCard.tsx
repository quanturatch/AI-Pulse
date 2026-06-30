"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import type { RepoItem } from "@/lib/types";

interface RepoCardProps {
  repo: RepoItem;
  index: number;
}

const langColors: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Java: "#B07219",
  "Jupyter Notebook": "#DA5B0B",
};

export function RepoCard({ repo, index }: RepoCardProps) {
  const updated = new Date(repo.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const langColor = repo.language ? langColors[repo.language] || "#a78bfa" : undefined;

  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      className="glow-border group flex flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-rose-500/30 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {repo.rank && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600/30 to-pink-600/30 text-sm font-bold text-rose-200">
              #{repo.rank}
            </span>
          )}
          <div>
            <h3 className="font-semibold text-white group-hover:text-rose-200 transition-colors">
              {repo.name}
            </h3>
            {repo.language && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: langColor }}
                />
                {repo.language}
              </div>
            )}
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/20 group-hover:text-white/60" />
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm text-white/50">
        {repo.description}
      </p>

      {repo.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {repo.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-300/80"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-white/5 pt-3 text-xs text-white/40">
        <span className="flex items-center gap-1 text-amber-300/90">
          <Star className="h-3.5 w-3.5 fill-amber-400/30" />
          {repo.starsLabel} stars
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="h-3.5 w-3.5" />
          {repo.forksLabel} forks
        </span>
        <span className="ml-auto text-white/30">Updated {updated}</span>
      </div>
    </motion.a>
  );
}