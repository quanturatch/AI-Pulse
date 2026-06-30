import { getAggregatedData } from "@/lib/aggregator";
import { dedupeArticlesByUrl } from "@/lib/dedupe";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { YouTubeStatusBanner } from "@/components/YouTubeStatusBanner";
import { SiteTabs } from "@/components/SiteTabs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function HomePage() {
  const raw = await getAggregatedData();
  const data = {
    ...raw,
    tavilyArticles: dedupeArticlesByUrl(raw.tavilyArticles),
    articles: dedupeArticlesByUrl(raw.articles),
    quantum: raw.quantum ?? [],
    githubRepos: raw.githubRepos ?? [],
  };

  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main>
        <YouTubeStatusBanner
          youtubeConfigured={!!data.youtubeConfigured}
          totalVideos={data.stats.totalVideos}
        />
        <Hero lastUpdated={data.lastUpdated} stats={data.stats} />
        <SiteTabs data={data} />
      </main>
      <Footer />
    </>
  );
}