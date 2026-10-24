import type { AppId } from "./apps";
import { APPS } from "./apps";
import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { JOBS } from "@/data/experience";
import { SKILLS } from "@/data/skills";
import { activity, getAlerts } from "./live";

export type LineKind = "cmd" | "out" | "err" | "dim" | "ok";
export type Line = { text: string; kind: LineKind };

export type CommandResult = {
  lines: Line[];
  clear?: boolean;
  open?: AppId;
  href?: string;
  /** More lines that arrive later (routing loads the engine and live alerts on first use). */
  pending?: Promise<Line[]>;
};

export const PROMPT = "baibhav@os ❯";

const out = (...texts: string[]): Line[] => texts.map((text) => ({ text, kind: "out" }));

/** "Sep 2025 – Jul 2026" → "2025–26"; "Mar 2026 – Present" → "2026–now". */
export const yearSpan = (dates: string): string => {
  const [a, b] = dates.match(/\d{4}/g) ?? [];
  if (/present/i.test(dates)) return a ? `${a}–now` : "now";
  return b && b !== a ? `${a}–${b.slice(2)}` : (a ?? dates);
};

const COMMANDS: Record<string, () => CommandResult> = {
  help: () => ({
    lines: out(
      "whoami · projects · experience · stack · contact · resume · sudo hire-me · clear",
      "route <from> <to>   fastest MBTA subway route, live closures included (e.g. route park-street harvard)",
      "stations <name>     find station names · alerts   today's subway closures",
      "open <app> · github · writing · play",
    ),
  }),
  whoami: () => ({ lines: out(`${PROFILE.name}, backend engineer.`, "Python · Go · Node.js · AWS · automation · IoT") }),
  projects: () => ({
    lines: PROJECTS.map((p) => ({
      text: `${p.num} ${p.title.padEnd(30)} ${p.metrics.map((m) => m.v).join(" · ")}`,
      kind: "out" as const,
    })),
  }),
  experience: () => ({
    lines: out(...JOBS.map((j) => `${yearSpan(j.dates)}  ${j.role} · ${j.company}`)),
  }),
  stack: () => ({ lines: out(...SKILLS.map((g) => `${g.name.padEnd(16)} ${g.items.join(", ")}`)) }),
  contact: () => ({
    lines: out(`email     ${PROFILE.email}`, "github    /pathakbaibhav", "linkedin  /baibhavkp"),
  }),
  resume: () => ({ lines: out("opening Resume …"), open: "resume" }),
  github: () => ({ lines: out("opening GitHub …"), open: "github" }),
  writing: () => ({ lines: out("opening Writing …"), open: "writing" }),
  play: () => ({ lines: out("opening Arcade …"), open: "arcade" }),
  "sudo hire-me": () => ({
    lines: out("[sudo] password for recruiter: ********", `access granted. opening mail to ${PROFILE.email} …`),
    href: `mailto:${PROFILE.email}`,
  }),
  clear: () => ({ lines: [], clear: true }),
};

export function runCommand(raw: string): CommandResult {
  const c = raw.trim().toLowerCase().replace(/\s+/g, " ");
  const echo: Line = { text: `${PROMPT} ${raw}`, kind: "cmd" };
  if (!c) return { lines: [echo] };

  const known = COMMANDS[c];
  if (known) {
    const res = known();
    return res.clear ? res : { ...res, lines: [echo, ...res.lines] };
  }

  if (c === "route" || c.startsWith("route ")) {
    const stops = parseRoute(c.slice(5));
    if (!stops) return { lines: [echo, { text: "usage: route <from> <to>   e.g. route park-street harvard, or route kendall to airport", kind: "err" }] };
    return { lines: [echo], pending: routeLines(...stops) };
  }

  if (c.startsWith("stations")) {
    const q = c.slice(8).trim();
    return {
      lines: [echo],
      pending: import("./subway").then(({ searchStations, stats }) => {
        const hits = q ? searchStations(q) : [];
        if (!q) return out(`${stats.stations} stations · try: stations park`);
        return hits.length ? out(hits.join(" · ")) : [{ text: `no station matches "${q}"`, kind: "err" }];
      }),
    };
  }

  if (c === "alerts") return { lines: [echo], pending: alertLines() };

  if (c.startsWith("open ")) {
    const name = c.slice(5);
    const app = Object.values(APPS).find((a) => a.id === name || a.label.toLowerCase() === name);
    if (app) return { lines: [echo, { text: `opening ${app.title} …`, kind: "ok" }], open: app.id };
    return { lines: [echo, { text: `open: no app named ${name}`, kind: "err" }] };
  }

  return { lines: [echo, { text: `command not found: ${c} (try help)`, kind: "err" }] };
}

export const TERMINAL_INTRO: Line[] = [
  { text: "baibhavOS v1.0 · type help for commands", kind: "dim" },
];

/** "park-street harvard" or "kendall to airport" → the two stops; anything else → null. */
export function parseRoute(args: string): [string, string] | null {
  const a = args.trim();
  const parts = a.includes(" to ") ? a.split(" to ") : a.split(/\s+/);
  return parts.length === 2 && parts[0] && parts[1] ? [parts[0].trim(), parts[1].trim()] : null;
}

async function routeLines(from: string, to: string): Promise<Line[]> {
  const [engine, live] = await Promise.all([import("./subway"), getAlerts()]);
  let note: Line = { text: "live alerts unavailable; routing on the full network", kind: "dim" };
  if (live.ok && live.data) {
    const closed = engine.applyAlerts(live.data.alerts);
    const n = closed.stations.length + closed.segments;
    note = { text: n ? `live: ${n} MBTA closure${n === 1 ? "" : "s"} applied` : "live: no subway closures right now", kind: "dim" };
  }
  const t = performance.now();
  const r = engine.plan(from, to);
  activity.push(`route ${from} → ${to}  ${r.ok ? "ok" : "no route"}  ${(performance.now() - t).toFixed(2)}ms`, r.ok ? "ok" : "err");
  return [...r.lines.map((text): Line => ({ text, kind: r.ok ? "out" : "err" })), note];
}

async function alertLines(): Promise<Line[]> {
  const [{ isActive }, live] = await Promise.all([import("./subway/alerts"), getAlerts()]);
  if (!live.ok || !live.data) return [{ text: `MBTA alerts unavailable (${live.error ?? "network"})`, kind: "err" }];
  const now = new Date();
  const active = live.data.alerts.filter((a) => isActive(a, now));
  if (!active.length) return [{ text: "no active subway alerts", kind: "ok" }];
  return [
    { text: `${active.length} active subway alert${active.length === 1 ? "" : "s"}:`, kind: "out" },
    ...active.slice(0, 6).map((a): Line => ({ text: `  ${a.effect.toLowerCase().replace(/_/g, " ")} · ${a.header}`, kind: "dim" })),
  ];
}
