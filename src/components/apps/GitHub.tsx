"use client";

import { useEffect, useState } from "react";
import { GITHUB_USER, type ContribDay, type GitHubSummary } from "@/lib/github";
import { getGitHub } from "@/lib/live";
import { btnGhost } from "./ui";

// Live from GitHub (via /api/github, cached an hour): contribution calendar,
// most recently pushed repos and recent public activity.

const PROFILE_URL = `https://github.com/${GITHUB_USER}`;

const ago = (iso: string) => {
  const h = (Date.now() - Date.parse(iso)) / 3_600_000;
  if (h < 1) return "just now";
  if (h < 24) return `${Math.round(h)}h ago`;
  const d = Math.round(h / 24);
  return d < 60 ? `${d}d ago` : new Date(iso).toLocaleDateString([], { month: "short", year: "numeric" });
};

/** GitHub's calendar: one column per week, Sunday at the top. */
function Calendar({ days, total }: { days: ContribDay[]; total: number }) {
  const weeks: ContribDay[][] = [];
  for (const d of days) {
    const weekday = new Date(`${d.date}T00:00:00Z`).getUTCDay();
    if (!weeks.length || weekday === 0) weeks.push([]);
    weeks[weeks.length - 1][weekday] = d;
  }
  const fill = (level: number) =>
    level === 0 ? "var(--line)" : `color-mix(in srgb, var(--accent) ${[0, 35, 55, 78, 100][level]}%, transparent)`;
  return (
    <div className="overflow-x-auto pb-1">
      <div role="img" aria-label={`${total} contributions in the last year`} className="flex w-max gap-[3px]">
        {weeks.map((w, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, k) => {
              const d = w[k];
              return (
                <span
                  key={k}
                  title={d ? `${d.count} contribution${d.count === 1 ? "" : "s"} on ${d.date}` : undefined}
                  className="h-[11px] w-[11px] rounded-[3px]"
                  style={{ background: d ? fill(d.level) : "transparent" }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function GitHub() {
  const [data, setData] = useState<GitHubSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    getGitHub().then((r) => {
      if (!alive) return;
      if (r.ok && r.data) setData(r.data);
      else setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (failed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-sm text-fg2">GitHub isn&apos;t reachable right now.</p>
        <a href={PROFILE_URL} target="_blank" rel="noreferrer" className={btnGhost}>Open github.com/{GITHUB_USER} ↗</a>
      </div>
    );
  }
  if (!data) return <p className="p-8 font-mono text-xs text-muted">loading github.com/{GITHUB_USER} …</p>;

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-6 py-6 @3xl:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">GitHub</div>
          <h1 className="mt-1.5 text-[28px] font-extrabold">@{data.login}</h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {data.publicRepos} public repos · {data.followers} followers · updated {ago(data.fetchedAt)}
          </p>
        </div>
        <a href={data.url} target="_blank" rel="noreferrer" className={btnGhost}>Profile ↗</a>
      </header>

      {data.contributions && (
        <section aria-label="Contributions" className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-5">
          <div className="font-mono text-[11px] tracking-[0.14em] text-muted">{data.contributions.total.toLocaleString()} CONTRIBUTIONS IN THE LAST YEAR</div>
          <Calendar days={data.contributions.days} total={data.contributions.total} />
        </section>
      )}

      <div className="grid gap-5 @3xl:grid-cols-[3fr_2fr]">
        <section aria-label="Repositories" className="flex flex-col">
          <h2 className="eyebrow !text-muted mb-2">Recently pushed</h2>
          {data.repos.map((r) => (
            <a key={r.name} href={r.url} target="_blank" rel="noreferrer" className="flex flex-col gap-1 border-t border-hair py-3 text-fg no-underline hover:text-accent">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-semibold">{r.name}</span>
                <span className="font-mono text-[11px] text-muted">
                  {[r.language, r.stars ? `★ ${r.stars}` : null, ago(r.pushedAt)].filter(Boolean).join(" · ")}
                </span>
              </span>
              {r.description && <span className="text-sm text-fg2">{r.description}</span>}
            </a>
          ))}
        </section>
        <section aria-label="Recent activity" className="flex flex-col">
          <h2 className="eyebrow !text-muted mb-2">Recent activity</h2>
          {data.activity.length === 0 && <p className="border-t border-hair py-3 text-sm text-muted">No public activity lately.</p>}
          {data.activity.map((a) => (
            <div key={a.at + a.repo + a.text} className="flex flex-col gap-0.5 border-t border-hair py-2.5 text-sm">
              <span className="font-mono text-[11px] text-muted">{a.repo} · {ago(a.at)}</span>
              <span className="text-fg2">{a.text}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
