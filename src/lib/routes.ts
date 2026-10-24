import { APPS, LAUNCHPAD_ORDER, type AppId } from "./apps";
import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { POSTS } from "@/data/writing";

/** Canonical origin. Set NEXT_PUBLIC_SITE_URL once the custom domain is live. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://baibhav-os.vercel.app").replace(/\/$/, "");
export const SITE_DESCRIPTION =
  "Baibhav Pathak, backend engineer: systems, APIs and IoT. A portfolio built as a small operating system.";

// Every app has a URL, so a window can be linked to and crawled:
//   /                    the desktop
//   /<app>               that app open, e.g. /about, /terminal
//   /projects/<slug>     a project's case study
//   /writing/<slug>      a post
// The OS keeps the address bar in sync with the focused window.

export type Route = { app: AppId; params: Record<string, string> };

const isApp = (s: string): s is AppId => s in APPS;

/** URL for an app in a given state; null (no focused window) is the desktop. */
export function pathFor(app: AppId | null, params: Record<string, string> = {}): string {
  if (!app) return "/";
  if (app === "projects" && params.view === "case") {
    const p = PROJECTS.find((x) => x.num === params.sel);
    if (p) return `/projects/${p.slug}`;
  }
  if (app === "writing" && params.post && POSTS.some((p) => p.slug === params.post)) return `/writing/${params.post}`;
  return `/${app}`;
}

/** Inverse of pathFor. `null` is the desktop; `undefined` means no such page (404). */
export function routeFor(segments: string[] = []): Route | null | undefined {
  if (segments.length === 0) return null;
  const [first, second, ...rest] = segments;
  if (rest.length || !isApp(first)) return undefined;
  if (second === undefined) return { app: first, params: {} };
  if (first === "writing") return POSTS.some((p) => p.slug === second) ? { app: "writing", params: { post: second } } : undefined;
  if (first !== "projects") return undefined;
  const p = PROJECTS.find((x) => x.slug === second);
  return p ? { app: "projects", params: { sel: p.num, view: "case" } } : undefined;
}

const projectOf = (r: Route) =>
  r.app === "projects" && r.params.view === "case" ? PROJECTS.find((p) => p.num === r.params.sel) : undefined;
const postOf = (r: Route) => (r.app === "writing" && r.params.post ? POSTS.find((p) => p.slug === r.params.post) : undefined);

/** Browser tab / <title> for a route. */
export function titleFor(r: Route | null): string {
  if (!r) return `${PROFILE.name} · baibhavOS`;
  return `${projectOf(r)?.title ?? postOf(r)?.title ?? APPS[r.app].label} · ${PROFILE.name}`;
}

/** <meta name="description"> for a route. */
export function descriptionFor(r: Route | null): string {
  if (!r) return SITE_DESCRIPTION;
  const p = projectOf(r);
  if (p) return `${p.tagline} ${p.desc}`;
  const post = postOf(r);
  return post ? post.summary : `${APPS[r.app].blurb} ${PROFILE.name}, ${PROFILE.role.replace(/\.$/, "")}.`;
}

/** Every page to prerender, for generateStaticParams and the sitemap. */
export const ALL_PATHS: string[][] = [
  ...LAUNCHPAD_ORDER.map((id) => [id]),
  ...PROJECTS.map((p) => ["projects", p.slug]),
  ...POSTS.map((p) => ["writing", p.slug]),
];
