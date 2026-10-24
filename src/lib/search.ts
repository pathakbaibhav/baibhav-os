import { APPS, LAUNCHPAD_ORDER, type AppId } from "./apps";
import { PROJECTS } from "@/data/projects";

export type SearchHit = {
  label: string;
  kind: "APP" | "PROJECT";
  app: AppId;
  params?: Record<string, string>;
};

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
];

export function search(query: string, limit = 6): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return INDEX.filter((e) => e.haystack.includes(q))
    .sort((a, b) => Number(b.label.toLowerCase().startsWith(q)) - Number(a.label.toLowerCase().startsWith(q)))
    .slice(0, limit)
    .map(({ label, kind, app, params }) => ({ label, kind, app, params }));
}
