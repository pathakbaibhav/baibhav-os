"use client";

import { SKILLS } from "@/data/skills";
import { usageOf } from "@/lib/skills";
import { useOS } from "@/lib/store";
import type { AppProps } from "./ui";

// Every skill, grouped; pick one to see the jobs and projects that used it.

export function Skills({ params, setParams }: AppProps) {
  const open = useOS((s) => s.open);
  const selected = params.skill ?? "Python";
  const usage = usageOf(selected);
  const count = usage.jobs.length + usage.projects.length;

  return (
    <div className="@container flex h-full flex-col @3xl:flex-row">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 @3xl:px-8">
        <h1 className="text-[26px] font-extrabold">Skills</h1>
        <p className="mt-1 text-sm text-fg2">Pick a skill to see where I&apos;ve used it.</p>
        <div className="mt-5 flex flex-col gap-5">
          {SKILLS.map((g) => (
            <section key={g.name} className="flex flex-col gap-2.5">
              <h2 className="eyebrow !text-muted">{g.name}</h2>
              <div className="flex flex-wrap gap-2">
                {g.items.map((s) => {
                  const on = s === selected;
                  const n = usageOf(s);
                  const used = n.jobs.length + n.projects.length;
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setParams({ skill: s })}
                      className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 text-[13px]"
                      style={
                        on
                          ? { background: "color-mix(in srgb, var(--accent) 16%, transparent)", borderColor: "var(--accent)", color: "var(--fg)" }
                          : { borderColor: "var(--line)", color: "var(--fg)" }
                      }
                    >
                      {s}
                      {used > 0 && <span className="font-mono text-[10px] text-muted">{used}</span>}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <aside
        aria-label={`Where ${selected} was used`}
        aria-live="polite"
        className="flex flex-none flex-col gap-4 border-t border-hair px-6 py-6 @3xl:w-[340px] @3xl:overflow-y-auto @3xl:border-l @3xl:border-t-0"
      >
        <div>
          <div className="eyebrow">Used in</div>
          <h2 className="mt-1.5 text-2xl font-extrabold">{selected}</h2>
          <p className="mt-1 font-mono text-xs text-muted">
            {count === 0 ? "on my resume; not linked to a job or project here yet" : `${count} place${count === 1 ? "" : "s"} in this portfolio`}
          </p>
        </div>
        {usage.jobs.map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => open("resume", { section: "experience" })}
            className="flex cursor-pointer flex-col gap-1 rounded-xl border border-line bg-card px-4 py-3 text-left"
          >
            <span className="font-mono text-[11px] text-muted">JOB · {j.dates}</span>
            <span className="font-semibold">{j.company}</span>
            <span className="text-sm text-fg2">{j.role}</span>
          </button>
        ))}
        {usage.projects.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => open("projects", { sel: p.num, view: "case" })}
            className="flex cursor-pointer flex-col gap-1 rounded-xl border border-line bg-card px-4 py-3 text-left"
          >
            <span className="font-mono text-[11px] text-muted">PROJECT · {p.year}</span>
            <span className="font-semibold">{p.title}</span>
            <span className="text-sm text-fg2">{p.tagline}</span>
          </button>
        ))}
      </aside>
    </div>
  );
}
