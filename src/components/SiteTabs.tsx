"use client";

import { motion } from "framer-motion";
import { Atom, Brain, Cloud, Code2, Rss, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AggregatedData } from "@/lib/types";
import {
  NAV_EVENT,
  QUANTUM_HASH,
  isAiSectionHash,
  navigateToHash,
  scrollToSection,
} from "@/lib/navigation";
import { SectionHeader } from "./SectionHeader";
import { VideoGrid } from "./VideoGrid";
import { ArticleCard } from "./ArticleCard";
import { RefreshButton } from "./RefreshButton";
import { RepoGrid } from "./RepoGrid";

type MainTab = "ai" | "quantum";

interface SiteTabsProps {
  data: AggregatedData;
}

const mainTabs: { id: MainTab; label: string; icon: typeof Brain }[] = [
  { id: "ai", label: "AI Hub", icon: Brain },
  { id: "quantum", label: "Quantum Computing", icon: Atom },
];

export function SiteTabs({ data }: SiteTabsProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("ai");

  const handleNavigation = useCallback((hash: string) => {
    if (hash === QUANTUM_HASH) {
      setActiveTab("quantum");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (isAiSectionHash(hash)) {
      setActiveTab("ai");
      if (hash === "ai" || hash === "topics") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        scrollToSection(hash, 120);
      }
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      handleNavigation(window.location.hash.replace("#", ""));
    };
    const onNavEvent = (e: Event) => {
      const hash = (e as CustomEvent<{ hash: string }>).detail.hash;
      handleNavigation(hash);
    };

    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener(NAV_EVENT, onNavEvent);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener(NAV_EVENT, onNavEvent);
    };
  }, [handleNavigation]);

  function selectTab(tab: MainTab) {
    navigateToHash(tab === "quantum" ? "#quantum" : "#ai");
  }

  return (
    <>
      {/* Main tab bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => selectTab(tab.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="main-tab-pill"
                      className={`absolute inset-0 rounded-xl ${
                        tab.id === "quantum"
                          ? "bg-gradient-to-r from-sky-600/40 to-violet-600/40 shadow-lg shadow-violet-500/10"
                          : "bg-gradient-to-r from-violet-600/40 to-cyan-600/40 shadow-lg shadow-violet-500/10"
                      }`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <Icon className="relative h-4 w-4" />
                  <span className="relative">{tab.label}</span>
                </button>
              );
            })}
          </div>
          <RefreshButton />
        </div>
        <p className="mt-3 text-xs text-white/40">
          All videos are filtered to <span className="text-cyan-300/80">8 minutes minimum</span>
          <span className="mx-2">·</span>
          YouTube &amp; Tavily use <span className="text-cyan-300/80">dual-key fallback</span>
        </p>
      </div>

      {/* AI Hub */}
      {activeTab === "ai" && (
        <motion.div
          key="ai-tab"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <section id="topics" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeader
              title="AI Topic Streams"
              description="Latest long-form YouTube videos across the hottest AI domains"
              icon="Brain"
              gradient="from-violet-500 to-fuchsia-500"
            />
            <div className="mt-10 space-y-16">
              {data.topics.map((topic) => (
                <div key={topic.id}>
                  <SectionHeader
                    title={topic.title}
                    description={topic.description}
                    icon={topic.icon}
                    gradient={topic.gradient}
                  />
                  <VideoGrid videos={topic.videos} />
                </div>
              ))}
            </div>
          </section>

          <section id="vendors" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2
                  className="text-2xl font-bold sm:text-3xl"
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  Cloud &amp; AI Labs
                </h2>
                <p className="text-sm text-white/50">
                  Latest videos from Azure, AWS, Google Cloud, OpenAI &amp; Anthropic
                </p>
              </div>
            </div>
            <div className="space-y-14">
              {data.vendors.map((vendor) => (
                <div key={vendor.id}>
                  <div className="mb-6 flex items-center justify-between">
                    <SectionHeader
                      title={vendor.name}
                      description={`${vendor.videos.length} videos ≥ 8 min`}
                      icon={vendor.logo}
                      accent={vendor.accent}
                    />
                    <a
                      href={vendor.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden text-xs text-white/40 transition-colors hover:text-white/70 sm:block"
                    >
                      View Channel →
                    </a>
                  </div>
                  <VideoGrid videos={vendor.videos} accent={vendor.accent} />
                </div>
              ))}
            </div>
          </section>

          <section id="github" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-pink-600">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2
                  className="text-2xl font-bold sm:text-3xl"
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  Top AI Security Repos
                </h2>
                <p className="text-sm text-white/50">
                  Top 10 GitHub repositories ranked by stars — LLM security, red teaming &amp; adversarial ML
                </p>
              </div>
            </div>
            <RepoGrid repos={data.githubRepos} />
          </section>

          <section id="articles" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                <Rss className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2
                  className="text-2xl font-bold sm:text-3xl"
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  Latest Articles &amp; Docs
                </h2>
                <p className="text-sm text-white/50">
                  Curated from Google AI, OpenAI, AWS, Azure, Hugging Face &amp; more
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.articles.length > 0 ? (
                data.articles.slice(0, 20).map((article, i) => (
                  <ArticleCard key={article.id} article={article} index={i} variant="rss" />
                ))
              ) : (
                <div className="glass col-span-full rounded-2xl p-8 text-center text-sm text-white/40">
                  No RSS articles yet — feeds will populate on first refresh.
                </div>
              )}
            </div>
          </section>

          <section id="discover" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2
                  className="text-2xl font-bold sm:text-3xl"
                  style={{ fontFamily: "var(--font-space)" }}
                >
                  AI Discovery
                </h2>
                <p className="text-sm text-white/50">
                  Tavily-powered web search for the latest AI posts, docs &amp; tools
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {data.tavilyArticles.length > 0 ? (
                data.tavilyArticles.map((article, i) => (
                  <ArticleCard
                    key={`${article.id}-${article.url}`}
                    article={article}
                    index={i}
                    variant="tavily"
                  />
                ))
              ) : (
                <div className="glass col-span-full rounded-2xl p-8 text-center text-sm text-white/40">
                  Add TAVILY_API_KEY and TAVILY_API_KEY_2 to .env to enable AI discovery.
                </div>
              )}
            </div>
          </section>
        </motion.div>
      )}

      {/* Quantum tab */}
      {activeTab === "quantum" && (
        <motion.div
          key="quantum-tab"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <section id="quantum" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionHeader
              title="Quantum Computing Hub"
              description="Dedicated streams for quantum hardware, cryptography & learning — all videos 8 min+"
              icon="Atom"
              gradient="from-sky-500 via-indigo-500 to-violet-600"
            />

            <div className="mt-10 space-y-16">
              {data.quantum.map((section) => (
                <div key={section.id} id={section.id}>
                  <SectionHeader
                    title={section.title}
                    description={section.description}
                    icon={section.icon}
                    gradient={section.gradient}
                  />
                  <VideoGrid videos={section.videos} />
                </div>
              ))}
            </div>
          </section>
        </motion.div>
      )}
    </>
  );
}