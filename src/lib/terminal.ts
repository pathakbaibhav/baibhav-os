import type { AppId } from "./apps";
import { APPS } from "./apps";
import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { JOBS } from "@/data/experience";
import { SKILLS } from "@/data/skills";

export type LineKind = "cmd" | "out" | "err" | "dim" | "ok";
export type Line = { text: string; kind: LineKind };

export type CommandResult = {
  lines: Line[];
  clear?: boolean;
  open?: AppId;
  href?: string;
};

export const PROMPT = "baibhav@os ❯";

const out = (...texts: string[]): Line[] => texts.map((text) => ({ text, kind: "out" }));

/** "Sep 2025 – Jul 2026" → "2025–26". */
export const yearSpan = (dates: string): string => {
  const [a, b] = dates.match(/\d{4}/g) ?? [];
  return b && b !== a ? `${a}–${b.slice(2)}` : (a ?? dates);
};

const COMMANDS: Record<string, () => CommandResult> = {
  help: () => ({
    lines: out("whoami · projects · experience · stack · route <from> <to> · open <app> · contact · resume · sudo hire-me · clear"),
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
    return { lines: [echo, { text: "→ calling api.baibhav.dev/route … (live in phase 4)", kind: "dim" }] };
  }

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
