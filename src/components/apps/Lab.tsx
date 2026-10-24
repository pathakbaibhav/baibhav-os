"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { activity, getAlerts, getBenchmark, getGitHub, type Bench } from "@/lib/live";
import { isActive, type Alert } from "@/lib/subway/alerts";

// The Lab: things I run, measured live in this browser. Nothing here is sample
// data: the route engine is benchmarked on the visitor's device, the MBTA and
// GitHub numbers come from the site's own API, and the log is this session's.

const PROBE_EVERY = 60_000;
const HISTORY = 20;

const card = "rounded-2xl border border-line bg-card p-5";
const dot = (ok: boolean | null) => (
  <span
    aria-hidden="true"
    className="h-[9px] w-[9px] flex-none rounded-full"
    style={ok === null ? { background: "var(--line)" } : ok ? { background: "#6EE7B7", boxShadow: "0 0 10px #6EE7B7" } : { background: "#F87171", boxShadow: "0 0 10px #F87171" }}
  />
);

type Sample = { mbta: number | null; github: number | null };

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <div className="text-xl font-extrabold tabular-nums">{v}</div>
      <div className="mt-0.5 font-mono text-[11px] text-muted">{l}</div>
    </div>
  );
}

/** Round-trip history as two lines on one small chart. */
function Chart({ samples }: { samples: Sample[] }) {
  const max = Math.max(50, ...samples.flatMap((s) => [s.mbta ?? 0, s.github ?? 0]));
  const line = (key: keyof Sample) =>
    samples
      .map((s, i) => (s[key] === null ? null : `${(i / Math.max(1, HISTORY - 1)) * 300},${68 - ((s[key] as number) / max) * 60}`))
      .filter(Boolean)
      .join(" ");
  return (
    <svg role="img" aria-label="Round-trip time to the site's MBTA and GitHub APIs over this session" width="100%" height="72" viewBox="0 0 300 72" preserveAspectRatio="none">
      <polyline points={line("mbta")} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <polyline points={line("github")} fill="none" stroke="var(--warm)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <line x1="0" y1="69" x2="300" y2="69" stroke="var(--line)" />
    </svg>
  );
}

export function Lab() {
  const [bench, setBench] = useState<Bench | null>(null);
  const [alerts, setAlerts] = useState<{ ok: boolean; ms: number; list: Alert[] } | null>(null);
  const [gh, setGh] = useState<{ ok: boolean; ms: number; total: number | null; lastPush: string | null } | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [at, setAt] = useState<number | null>(null);
  const log = useSyncExternalStore(activity.subscribe, activity.get, activity.get);

  useEffect(() => {
    let alive = true;
    // Let the window open before the CPU-heavy benchmark runs.
    const t = setTimeout(() => getBenchmark().then((b) => alive && setBench(b)), 300);
    const probe = async (force: boolean) => {
      const [a, g] = await Promise.all([getAlerts(force), getGitHub(force)]);
      if (!alive) return;
      setAlerts({ ok: a.ok, ms: a.ms, list: a.data?.alerts ?? [] });
      setGh({
        ok: g.ok,
        ms: g.ms,
        total: g.data?.contributions?.total ?? null,
        lastPush: g.data?.repos[0]?.pushedAt ?? null,
      });
      setSamples((s) => [...s, { mbta: a.ok ? a.ms : null, github: g.ok ? g.ms : null }].slice(-HISTORY));
      setAt(Date.now());
    };
    probe(false);
    const every = setInterval(() => probe(true), PROBE_EVERY);
    return () => {
      alive = false;
      clearTimeout(t);
      clearInterval(every);
    };
  }, []);

  const now = new Date();
  const active = (alerts?.list ?? []).filter((a) => isActive(a, now));
  const since = (iso: string | null) => {
    if (!iso) return "—";
    const h = Math.round((Date.now() - Date.parse(iso)) / 3_600_000);
    return h < 1 ? "<1h ago" : h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto px-6 py-6 @3xl:px-[30px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Lab</div>
          <h1 className="mt-1.5 text-[28px] font-extrabold">Things I run, measured live.</h1>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 font-mono text-[11px] text-fg2">
          {dot(at === null ? null : true)}
          {at === null ? "connecting…" : `LIVE · updated ${new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
        </span>
      </div>

      <div className="grid gap-3.5 @3xl:grid-cols-3">
        <section aria-label="Route engine" className={`${card} flex flex-col gap-3.5`}>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2.5 font-semibold">{dot(bench ? true : null)}Route engine</span>
            <span className="font-mono text-[11px] text-muted">your device</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Stat v={bench ? `${bench.p50us.toFixed(1)} µs` : "…"} l="p50 per route" />
            <Stat v={bench ? `${Math.round(bench.totalMs)} ms` : "…"} l={`all ${bench?.pairs.toLocaleString() ?? "7,750"} pairs`} />
          </div>
          <p className="text-xs leading-relaxed text-muted">Dijkstra on the MBTA network, ported from my subway project, run here in your browser.</p>
          <button
            type="button"
            onClick={() => {
              setBench(null);
              setTimeout(() => getBenchmark(true).then(setBench), 50);
            }}
            className="self-start cursor-pointer text-sm text-accent"
          >
            Run it again →
          </button>
        </section>

        <section aria-label="MBTA alerts feed" className={`${card} flex flex-col gap-3.5`}>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2.5 font-semibold">{dot(alerts ? alerts.ok : null)}MBTA alerts</span>
            <span className="font-mono text-[11px] text-muted">/api/mbta/alerts</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Stat v={alerts ? (alerts.ok ? `${alerts.ms} ms` : "down") : "…"} l="round trip" />
            <Stat v={alerts?.ok ? String(active.length) : "…"} l="active alerts" />
          </div>
          <p className="text-xs leading-relaxed text-muted">Live subway alerts (data: MBTA V3 API), cached for 2 minutes and fed into the route engine as closures.</p>
        </section>

        <section aria-label="GitHub API" className={`${card} flex flex-col gap-3.5`}>
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2.5 font-semibold">{dot(gh ? gh.ok : null)}GitHub</span>
            <span className="font-mono text-[11px] text-muted">/api/github</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Stat v={gh ? (gh.ok ? `${gh.ms} ms` : "down") : "…"} l="round trip" />
            <Stat v={gh?.total != null ? String(gh.total) : "…"} l="contributions, 1 yr" />
          </div>
          <p className="text-xs leading-relaxed text-muted">Last push {since(gh?.lastPush ?? null)}. Cached for an hour.</p>
        </section>
      </div>

      <section aria-label="Response times" className={`${card} flex flex-col gap-2`}>
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-muted">
          <span className="tracking-[0.14em]">ROUND TRIP, THIS SESSION</span>
          <span className="flex gap-4">
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-accent" />MBTA</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 bg-warm" />GitHub</span>
          </span>
        </div>
        {samples.length > 1 ? <Chart samples={samples} /> : <p className="py-5 text-center text-xs text-muted">Collecting samples (one a minute)…</p>}
      </section>

      <div className="grid gap-3.5 @3xl:grid-cols-2">
        <section aria-label="Subway closures today" className={`${card} flex flex-col gap-1`}>
          <div className="mb-2 font-mono text-[11px] tracking-[0.14em] text-muted">SUBWAY ALERTS NOW</div>
          {alerts === null && <p className="text-sm text-muted">Loading…</p>}
          {alerts && !alerts.ok && <p className="text-sm text-warm">The MBTA feed isn&apos;t reachable right now.</p>}
          {alerts?.ok && active.length === 0 && <p className="text-sm text-fg2">No active subway alerts. Every route is open.</p>}
          {active.slice(0, 6).map((a) => (
            <div key={a.id} className="flex flex-col gap-0.5 border-t border-hair py-2.5 text-sm">
              <span className="font-mono text-[11px] uppercase text-warm">{a.effect.replace(/_/g, " ")}</span>
              <span className="leading-snug text-fg2">{a.header}</span>
            </div>
          ))}
        </section>
        <section aria-label="Request log" className="rounded-2xl border border-line bg-[#05070B] p-5 font-mono text-xs leading-[1.8]">
          <div className="mb-2 text-[11px] tracking-[0.14em] text-[#9AA3B5]">REQUEST LOG · THIS SESSION</div>
          {log.length === 0 && <div className="text-[#9AA3B5]">waiting for the first request…</div>}
          {log.slice(0, 12).map((l) => (
            <div key={l.at + l.text} className="truncate" style={{ color: l.kind === "err" ? "#F4B786" : l.kind === "ok" ? "#C3C9D6" : "#9AA3B5" }}>
              {new Date(l.at).toLocaleTimeString([], { hour12: false })}  {l.text}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
