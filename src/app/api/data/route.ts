import { NextResponse } from "next/server";
import { getAggregatedData } from "@/lib/aggregator";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAggregatedData();
  return NextResponse.json(data);
}