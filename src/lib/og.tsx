import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { APPS } from "./apps";
import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { POSTS } from "@/data/writing";
import { pathFor, type Route } from "./routes";

// Link previews (Open Graph / X cards), drawn at build time: a dark window on
// the desktop gradient with the page's path, title and one line about it.

export const OG_SIZE = { width: 1200, height: 630 };

/** og:image entry for a page's path ("/" is the desktop). */
export const ogImageFor = (path: string, alt: string) => [{ url: path === "/" ? "/og" : `/og${path}`, ...OG_SIZE, alt }];

/** The OS mark (the Lab chip), 24×24 stroke paths. */
export const MARK = "M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4";

const ACCENT = "#7FD4E8";

// The site's typeface. Satori reads .woff but not .woff2, hence the static @fontsource files.
const font = (weight: 400 | 800) => ({
  name: "Inter Tight",
  weight,
  style: "normal" as const,
  data: readFileSync(join(process.cwd(), `node_modules/@fontsource/inter-tight/files/inter-tight-latin-${weight}-normal.woff`)),
});

export function ogContent(r: Route | null): { path: string; title: string; line: string } {
  if (!r) return { path: "~", title: PROFILE.name, line: PROFILE.role.replace(/\.$/, "") };
  const project = r.app === "projects" ? PROJECTS.find((p) => p.num === r.params.sel) : undefined;
  if (project) return { path: `~/projects/${project.slug}`, title: project.title, line: project.tagline };
  const post = r.app === "writing" ? POSTS.find((p) => p.slug === r.params.post) : undefined;
  if (post) return { path: `~/writing/${post.slug}`, title: post.title, line: post.summary };
  return { path: `~${pathFor(r.app, r.params)}`, title: APPS[r.app].label, line: APPS[r.app].blurb };
}

export function ogImage(r: Route | null) {
  const { path, title, line } = ogContent(r);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 56,
          fontFamily: "Inter Tight",
          background: "radial-gradient(circle at 78% 18%, rgba(244,167,102,0.28), transparent 45%), linear-gradient(160deg, #1E2338, #06070D)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(12,16,25,0.86)",
            color: "#E8ECF3",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "22px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {["#F87171", "#FBBF24", "#34D399"].map((c) => (
              <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
            ))}
            <div style={{ marginLeft: 16, fontSize: 24, color: "#8A93A6" }}>{path}</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", gap: 20 }}>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
            <div style={{ fontSize: 32, lineHeight: 1.35, color: "#B4BCCB", maxWidth: 940 }}>{line}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 64px 40px", fontSize: 26, color: ACCENT }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={MARK} />
            </svg>
            {r ? `baibhavOS · ${PROFILE.name}` : "baibhavOS · portfolio"}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [font(400), font(800)] },
  );
}
