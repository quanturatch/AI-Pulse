"use client";

import { motion } from "framer-motion";
import { Activity, Heart } from "lucide-react";
import { SITE } from "@/lib/config";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/5">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-space)" }}
            >
              {SITE.name}
            </span>
          </div>

          <p className="max-w-md text-sm text-white/40">
            Aggregating the latest AI videos, documentation, and breakthroughs
            from YouTube, RSS feeds, and Tavily search — refreshed automatically.
          </p>

          <div className="flex items-center gap-1.5 text-sm text-white/60">
            <Heart className="h-3.5 w-3.5 text-rose-400" />
            <span>
              Designed and Maintained by{" "}
              <a
                href="https://www.quanturatech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-violet-300 underline decoration-violet-500/30 underline-offset-4 transition-colors hover:text-cyan-300 hover:decoration-cyan-500/50"
              >
                Quantura Technologies
              </a>
            </span>
          </div>

          <p className="text-sm text-white/40">
            Suggestions?{" "}
            <a
              href={`mailto:${SITE.suggestionsEmail}?subject=${encodeURIComponent(`${SITE.name} — Suggestion`)}`}
              className="text-violet-300 underline decoration-violet-500/30 underline-offset-4 transition-colors hover:text-cyan-300"
            >
              {SITE.suggestionsEmail}
            </a>
          </p>

          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Quantura Technologies. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}