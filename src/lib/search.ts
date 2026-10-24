import { APPS, LAUNCHPAD_ORDER, type AppId } from "./apps";
import type { commands } from "./commands";
import { PROJECTS } from "@/data/projects";
import { SKILLS } from "@/data/skills";

// Spotlight's index: apps, projects, skills and OS actions.

export type CommandName = keyof typeof commands;

export type SearchHit = {
  label: string;
  kind: "APP" | "PROJECT" | "SKILL" | "ACTION";
  /** Open this app (with params)… */
  app?: AppId;
  params?: Record<string, string>;
  /** …or run this command. */
  action?: CommandName;
};

const ACTIONS: { label: string; words: string; action: CommandName }[] = [
  { label: "Switch light / dark", words: "theme dark light mode appearance", action: "toggleTheme" },
  { label: "New terminal", words: "shell console cli", action: "newTerminal" },
  { label: "Take the tour", words: "guide help onboarding", action: "tour" },
  { label: "Start the recruiter tour", words: "hire hiring recruiter resume", action: "recruiterTour" },
  { label: "Change wallpaper", words: "background desktop settings", action: "wallpaper" },
  { label: "Turn interface sounds on / off", words: "sound audio mute volume", action: "toggleSound" },
  { label: "Energy Saver: motion on / off", words: "motion animation reduce effects 3d", action: "toggleMotion" },
];

const INDEX: (SearchHit & { haystack: string })[] = [
  ...LAUNCHPAD_ORDER.map((id) => ({
    label: APPS[id].label,
    kind: "APP" as const,
    app: id,
    haystack: `${APPS[id].label} ${id}`.toLowerCase(),
  })),
  ...PROJECTS.map((p) => ({
    label: p.title,
    kind: "PROJECT" as const,
    app: "projects" as const,
    params: { sel: p.num, view: p.caseStudy ? "case" : "index" },
    haystack: `${p.title} ${p.slug} ${p.cat} ${p.stack.join(" ")}`.toLowerCase(),
  })),
  ...SKILLS.flatMap((g) =>
    g.items.map((s) => ({
      label: s,
      kind: "SKILL" as const,
      app: "skills" as const,
      params: { skill: s },
      haystack: `${s} ${g.name}`.toLowerCase(),
    })),
  ),
  ...ACTIONS.map((a) => ({ label: a.label, kind: "ACTION" as const, action: a.action, haystack: `${a.label} ${a.words}`.toLowerCase() })),
];

/** `actions: false` leaves out OS actions (the phone has no windows to act on). */
export function search(query: string, limit = 8, { actions = true } = {}): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return INDEX.filter((e) => e.haystack.includes(q) && (actions || e.kind !== "ACTION"))
    .sort((a, b) => Number(b.label.toLowerCase().startsWith(q)) - Number(a.label.toLowerCase().startsWith(q)))
    .slice(0, limit)
    .map(({ label, kind, app, params, action }) => ({ label, kind, app, params, action }));
}
