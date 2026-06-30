"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Radio } from "lucide-react";
import { SITE } from "@/lib/config";

interface HeroProps {
  lastUpdated: string;
  stats: { totalVideos: number; totalArticles: number; totalRepos: number; sources: number };
}

export function Hero({ lastUpdated, stats }: HeroProps) {
  const updatedLabel = new Date(lastUpdated).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-200"
          >
            <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            Live AI intelligence · Auto-refreshed
          </motion.div>

          <h1
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            The Pulse of{" "}
            <span className="gradient-text">Artificial Intelligence</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
            {SITE.tagline}. Curated videos, vendor channels, RSS feeds &amp;
            Tavily-powered discovery — all in one dynamic hub.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#topics"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-violet-500/25 transition-transform hover:scale-105"
            >
              <Zap className="h-4 w-4" />
              Explore Topics
            </a>
            <a
              href="#articles"
              className="glass glass-hover inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white/80"
            >
              <Sparkles className="h-4 w-4 text-fuchsia-400" />
              Latest Articles
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {[
            { label: "Videos", value: stats.totalVideos, color: "text-cyan-400" },
            { label: "Articles", value: stats.totalArticles, color: "text-violet-400" },
            { label: "GitHub Repos", value: stats.totalRepos, color: "text-rose-400" },
            { label: "Sources", value: stats.sources, color: "text-fuchsia-400" },
            { label: "Updated", value: updatedLabel.split(",")[0], color: "text-amber-400", small: true },
          ].map((stat, i) => (
            <div key={stat.label} className="glass glow-border rounded-2xl p-5 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                className={`text-2xl font-bold sm:text-3xl ${stat.color}`}
                style={{ fontFamily: "var(--font-space)" }}
              >
                {stat.small ? (
                  <span className="text-base sm:text-lg">{stat.value}</span>
                ) : (
                  stat.value
                )}
              </motion.div>
              <div className="mt-1 text-xs text-white/50 sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}