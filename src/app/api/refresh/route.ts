import { NextRequest, NextResponse } from "next/server";
import { refreshAllData } from "@/lib/aggregator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.REFRESH_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const data = await refreshAllData();
  return NextResponse.json({
    ok: true,
    lastUpdated: data.lastUpdated,
    stats: data.stats,
  });
}