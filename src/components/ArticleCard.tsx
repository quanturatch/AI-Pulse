"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import type { ArticleItem } from "@/lib/types";

interface ArticleCardProps {
  article: ArticleItem;
  index: number;
  variant?: "rss" | "tavily";
}

export function ArticleCard({ article, index, variant = "rss" }: ArticleCardProps) {
  const date = new Date(article.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const borderColor =
    variant === "tavily"
      ? "hover:border-cyan-500/30"
      : "hover:border-violet-500/30";

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      className={`glow-border group flex gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.06] ${borderColor}`}
    >
      {article.image && (
        <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display =
                "none";
            }}
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
              variant === "tavily"
                ? "bg-cyan-500/15 text-cyan-300"
                : "bg-violet-500/15 text-violet-300"
            }`}
          >
            {article.source}
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-white/60" />
        </div>

        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-white group-hover:text-violet-200 transition-colors">
          {article.title}
        </h3>

        {article.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-white/40">
            {article.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-1 text-[11px] text-white/30">
          <Clock className="h-3 w-3" />
          {date}
        </div>
      </div>
    </motion.a>
  );
}