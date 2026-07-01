"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { SITE } from "@/lib/config";

export function Suggestions() {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`${SITE.name} — Suggestion`);
    const body = encodeURIComponent(
      [
        name ? `From: ${name}` : "",
        "",
        message || "I'd like to suggest the following for AI-Pulse:",
        "",
      ]
        .filter(Boolean)
        .join("\n")
    );
    window.location.href = `mailto:${SITE.suggestionsEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <section
      id="suggestions"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass glow-border overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 p-8 sm:p-10"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h2
              className="text-2xl font-bold sm:text-3xl"
              style={{ fontFamily: "var(--font-space)" }}
            >
              Send Us Your Suggestions
            </h2>
            <p className="mt-3 text-sm text-white/50 sm:text-base">
              Have ideas for new topics, sources, or features? We&apos;d love to
              hear from you. Your feedback helps improve {SITE.name}.
            </p>
            <a
              href={`mailto:${SITE.suggestionsEmail}?subject=${encodeURIComponent(`${SITE.name} — Suggestion`)}`}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
            >
              <Mail className="h-4 w-4" />
              {SITE.suggestionsEmail}
            </a>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg space-y-4"
          >
            <div>
              <label
                htmlFor="suggestion-name"
                className="mb-1.5 block text-xs font-medium text-white/50"
              >
                Your name (optional)
              </label>
              <input
                id="suggestion-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex from Quantura"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-violet-500/40 focus:bg-white/[0.07]"
              />
            </div>
            <div>
              <label
                htmlFor="suggestion-message"
                className="mb-1.5 block text-xs font-medium text-white/50"
              >
                Your suggestion
              </label>
              <textarea
                id="suggestion-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                placeholder="e.g. Add a section for AI robotics, or include papers from arXiv cs.LG..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-violet-500/40 focus:bg-white/[0.07]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02] sm:w-auto"
            >
              <Send className="h-4 w-4" />
              Send via Email
            </button>
            <p className="text-xs text-white/35">
              Opens your email app addressed to{" "}
              <span className="text-white/50">{SITE.suggestionsEmail}</span>
            </p>
          </form>
        </div>
      </motion.div>
    </section>
  );
}