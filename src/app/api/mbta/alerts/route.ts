import { NextResponse } from "next/server";
import data from "@/data/subway-network.json";
import { MBTA_ALERTS_URL, alertFromRaw } from "@/lib/subway/alerts";
import type { Network } from "@/lib/subway/graph";

// Live MBTA subway alerts, normalised for the route engine. Cached for two minutes
// so every visitor shares one upstream request (the MBTA's free tier is rate-limited).

export const dynamic = "force-dynamic";

const network = data as Network;
const stationIds = new Set(network.stations.map((s) => s.id));

export async function GET() {
  const t0 = Date.now();
  try {
    const res = await fetch(MBTA_ALERTS_URL, {
      headers: process.env.MBTA_API_KEY ? { "x-api-key": process.env.MBTA_API_KEY } : undefined,
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`MBTA API returned ${res.status}`);
    const body = (await res.json()) as { data: Parameters<typeof alertFromRaw>[0][] };
    const alerts = body.data.map((raw) => alertFromRaw(raw, network, stationIds));
    return NextResponse.json({ ok: true, alerts, upstreamMs: Date.now() - t0, fetchedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message, alerts: [] }, { status: 502 });
  }
}
