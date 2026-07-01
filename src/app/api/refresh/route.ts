import { NextRequest, NextResponse } from "next/server";
import { refreshAllData } from "@/lib/aggregator";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handleRefresh(req: NextRequest) {
  const forceYoutube =
    req.nextUrl.searchParams.get("forceYoutube") === "true";
  const data = await refreshAllData({ forceYoutube });
  return NextResponse.json({
    ok: true,
    lastUpdated: data.lastUpdated,
    youtubeCachedAt: data.youtubeCachedAt,
    youtubeSkipped: !forceYoutube && !!data.youtubeCachedAt,
    stats: data.stats,
  });
}

// Public — powers the "Refresh Now" button
export async function POST(req: NextRequest) {
  return handleRefresh(req);
}

// Vercel Cron invokes GET — protected when CRON_SECRET is set
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  return handleRefresh(req);
}