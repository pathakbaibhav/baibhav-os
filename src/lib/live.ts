"use client";

import type { Alert } from "./subway/alerts";
import type { GitHubSummary } from "./github";

// The browser side of the live data: cached fetchers for the site's own API, and a
// session log of every request and route, which the Lab shows as its request log.

export type LogEntry = { at: number; text: string; kind: "ok" | "err" | "info" };
export type Probe<T> = { ok: boolean; ms: number; at: number; data?: T; error?: string };

const MAX_LOG = 40;
let log: LogEntry[] = [];
const listeners = new Set<() => void>();

export const activity = {
  push(text: string, kind: LogEntry["kind"] = "info") {
    log = [{ at: Date.now(), text, kind }, ...log].slice(0, MAX_LOG);
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  get: () => log,
};

/** GET one of the site's API routes, timed and logged; results are reused for `ttl` ms. */
function cached<T>(path: string, ttl: number) {
  let last: { at: number; promise: Promise<Probe<T>> } | null = null;
  return (force = false): Promise<Probe<T>> => {
    if (!force && last && Date.now() - last.at < ttl) return last.promise;
    const at = Date.now();
    const promise = (async (): Promise<Probe<T>> => {
      const t0 = performance.now();
      try {
        const res = await fetch(path);
        const body = (await res.json()) as T & { ok?: boolean; error?: string };
        const ms = Math.round(performance.now() - t0);
        const ok = res.ok && body.ok !== false;
        activity.push(`GET ${path}  ${res.status}  ${ms}ms`, ok ? "ok" : "err");
        return ok ? { ok, ms, at, data: body } : { ok, ms, at, error: body.error ?? `HTTP ${res.status}` };
      } catch (e) {
        const ms = Math.round(performance.now() - t0);
        activity.push(`GET ${path}  failed  ${ms}ms`, "err");
        return { ok: false, ms, at, error: (e as Error).message };
      }
    })();
    last = { at, promise };
    return promise;
  };
}

export type Bench = { pairs: number; totalMs: number; p50us: number; edges: number };
let bench: Promise<Bench> | null = null;

/** Route all 7,750 station pairs on this device, once per visit (or again with `force`). */
export function getBenchmark(force = false): Promise<Bench> {
  if (!bench || force) {
    bench = import("./subway").then(({ benchmark, stats }) => {
      const b = benchmark();
      activity.push(`benchmark ${b.pairs} routes  ${Math.round(b.totalMs)}ms  p50 ${b.p50us.toFixed(1)}µs`, "ok");
      return { ...b, edges: stats.edges };
    });
  }
  return bench;
}

export const getAlerts = cached<{ alerts: Alert[]; upstreamMs: number; fetchedAt: string }>("/api/mbta/alerts", 120_000);
export const getGitHub = cached<GitHubSummary>("/api/github", 600_000);
