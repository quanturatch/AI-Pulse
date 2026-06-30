import { NextRequest, NextResponse } from "next/server";
import { refreshAllData } from "@/lib/aggregator";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handleRefresh() {
  const data = await refreshAllData();
  return NextResponse.json({
    ok: true,
    lastUpdated: data.lastUpdated,
    stats: data.stats,
  });
}

// Public — powers the "Refresh Now" button
export async function POST() {
  return handleRefresh();
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
  return handleRefresh();
}