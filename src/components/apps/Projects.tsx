"use client";

import Image from "next/image";
import { PROJECTS, PROJECT_FILTERS, filterProjects, type Project, type ProjectFilter } from "@/data/projects";
import { Stat, btnGhost, btnSolid, type AppProps } from "./ui";

const statusClass = (p: Project) =>
  p.status === "Live" ? "bg-[rgba(110,231,183,0.14)] text-ok" : "bg-card text-fg2";

export function Projects({ params, setParams }: AppProps) {
  const filter = (params.filter as ProjectFilter) ?? "Featured";
  const shown = filterProjects(PROJECTS, filter);
  const sel = PROJECTS.find((p) => p.num === params.sel) ?? shown[0] ?? PROJECTS[0];

  if (params.view === "case") {
    return <CaseStudyView key={sel.num} project={sel} onBack={() => setParams({ view: "index" })} onNext={(p) => setParams({ sel: p.num })} />;
  }

  return (
    <div className="@container flex h-full flex-col @3xl:flex-row">
      <div className="flex min-h-0 flex-col border-b border-hair @3xl:w-[440px] @3xl:flex-none @3xl:border-b-0 @3xl:border-r">
        <div className="flex flex-col gap-3.5 px-6 pb-3.5 pt-5">
          <div className="flex items-baseline justify-between">
            <h1 className="text-[26px] font-extrabold">Index</h1>
            <span className="font-mono text-xs text-muted">{String(shown.length).padStart(2, "0")} projects</span>
          </div>
          <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-1">
            {PROJECT_FILTERS.map((f) => {
              const on = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setParams({ filter: f })}
                  className="min-h-[34px] cursor-pointer rounded-lg border px-3 font-mono text-[11px] uppercase tracking-[0.08em]"
                  style={
                    on
                      ? { background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)", borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)" }
                      : { color: "var(--muted)", borderColor: "var(--line)" }
                  }
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
        <ul className="max-h-[40cqh] overflow-y-auto border-t border-hair @3xl:max-h-none @3xl:flex-1">
          {shown.map((p) => {
            const on = p.num === sel.num;
            return (
              <li key={p.num}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setParams({ sel: p.num })}
                  className="flex w-full cursor-pointer items-center gap-3.5 border-b border-hair px-6 py-4 text-left"
                  style={on ? { background: "color-mix(in srgb, var(--accent) 8%, transparent)", boxShadow: "inset 2px 0 0 var(--accent)" } : undefined}
                >
                  <span className="w-[26px] font-mono text-xs text-muted">{p.num}</span>
                  <span className="flex flex-1 flex-col gap-[3px]">
                    <span className="font-semibold text-fg">{p.title}</span>
                    <span className="font-mono text-[11px] text-muted">{p.cat} · {p.year}</span>
                  </span>
                  <span className={`rounded-full px-2 py-[3px] font-mono text-[10px] ${statusClass(p)}`}>{p.status}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-7 @3xl:px-9">
        <div
          className="flex h-[180px] flex-none items-center justify-center rounded-2xl border border-hair"
          style={{ background: `radial-gradient(circle at 78% 18%, ${sel.hue}55, transparent 55%), linear-gradient(160deg, #1A2132, #0E121B)` }}
        >
          <span className="font-mono text-[88px] font-bold text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.35)" }}>
            {sel.num}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-[28px] font-extrabold leading-tight">{sel.title}</h2>
          <p className="text-base leading-normal text-warm">{sel.tagline}</p>
          <p className="text-sm leading-relaxed text-fg2">{sel.desc}</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {sel.metrics.map((m) => <Stat key={m.l} v={m.v} l={m.l} />)}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sel.stack.map((s) => (
            <span key={s} className="rounded-md px-2 py-1 font-mono text-[11px] text-accent" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
              {s}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" className={`${btnSolid} cursor-pointer`} onClick={() => setParams({ view: "case" })}>
            Open case study →
          </button>
          {sel.source && <a href={sel.source} target="_blank" rel="noreferrer" className={btnGhost}>Source ↗</a>}
        </div>
      </div>
    </div>
  );
}

function CaseStudyView({ project: p, onBack, onNext }: { project: Project; onBack: () => void; onNext: (p: Project) => void }) {
  const cs = p.caseStudy;
  const next = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length];
  return (
    <div className="@container h-full overflow-y-auto">
      <div className="mx-auto flex max-w-[880px] flex-col gap-14 px-6 pb-16 pt-6 @3xl:px-10">
        <button type="button" onClick={onBack} className="cursor-pointer self-start font-mono text-xs text-muted hover:text-fg">
          ← projects
        </button>
        <header className="flex flex-col gap-[18px]">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            <span className={`rounded-full px-2 py-1 ${statusClass(p)}`}>{p.status}</span>
            <span className="text-muted">{p.num} · {cs?.meta ?? `${p.year} · ${p.cat}`}</span>
          </div>
          <h1 className="text-[clamp(36px,6cqw,56px)] font-extrabold leading-[1.02] tracking-[-0.01em]">{p.title}</h1>
          <p className="text-xl leading-normal text-warm">{cs?.headline ?? p.tagline}</p>
          <div className="flex flex-wrap gap-2.5">
            {cs?.demo && <a href={cs.demo} target="_blank" rel="noreferrer" className={btnSolid}>Live demo ↗</a>}
            {p.source && <a href={p.source} target="_blank" rel="noreferrer" className={btnGhost}>Source on GitHub ↗</a>}
          </div>
        </header>

        {cs ? (
          <>
            {cs.media && cs.media.length > 0 && (
              <div className="flex flex-col gap-3">
                <figure className="flex flex-col gap-2">
                  <Image src={cs.media[0].src} alt={cs.media[0].alt} width={cs.media[0].w} height={cs.media[0].h} sizes="(min-width: 900px) 800px, 100vw" className="w-full rounded-[18px] border border-line" />
                  <figcaption className="font-mono text-xs text-muted">{cs.media[0].caption}</figcaption>
                </figure>
                {cs.media.length > 1 && (
                  <div className="grid grid-cols-2 gap-3">
                    {cs.media.slice(1).map((m) => (
                      <figure key={m.src} className="flex flex-col gap-2">
                        <Image src={m.src} alt={m.alt} width={m.w} height={m.h} sizes="(min-width: 900px) 400px, 50vw" className="w-full rounded-xl border border-line" />
                        <figcaption className="font-mono text-[11px] leading-snug text-muted">{m.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            )}
            <CsSection title="Key results">
              <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-4">
                {cs.results.map((r) => <Stat key={r.l} {...r} />)}
              </div>
            </CsSection>
            <CsSection title="Overview">
              <p className="text-[17px] leading-[1.75] text-fg2">{cs.overview}</p>
            </CsSection>
            <CsSection title="Architecture">
              <div className="flex flex-col items-stretch gap-2.5 font-mono text-xs @2xl:flex-row @2xl:items-center">
                {cs.architecture.map((a, i) => (
                  <div key={a.name} className="contents">
                    {i > 0 && <span aria-hidden="true" className="self-center text-muted @2xl:rotate-0 rotate-90">→</span>}
                    <div
                      className="flex-1 rounded-xl border p-4 text-center"
                      style={a.highlight ? { borderColor: "rgba(244,167,102,0.6)", background: "rgba(244,167,102,0.06)" } : { borderColor: "var(--line)", background: "var(--card)" }}
                    >
                      {a.name}
                      <br />
                      <span className="text-muted">{a.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CsSection>
            <CsSection title="The story">
              {cs.story.map((s) => (
                <div key={s.h} className="flex flex-col gap-3.5">
                  <h2 className="text-[26px] font-semibold">{s.h}</h2>
                  <p className="text-[17px] leading-[1.75] text-fg2">{s.p}</p>
                </div>
              ))}
              {cs.deadEnd && (
                <div className="rounded-[14px] border border-[rgba(244,167,102,0.25)] bg-[rgba(244,167,102,0.06)] px-5 py-[18px]">
                  <div className="font-mono text-xs text-warm">What didn&apos;t work</div>
                  <p className="mt-2 text-[15px] leading-relaxed text-fg2">{cs.deadEnd}</p>
                </div>
              )}
            </CsSection>
            <CsSection title="Built with">
              <div className="flex flex-wrap gap-2">
                {cs.builtWith.map((s) => <span key={s} className="rounded-lg border border-line px-[11px] py-1.5 text-[13px]">{s}</span>)}
              </div>
            </CsSection>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-[17px] leading-[1.75] text-fg2">{p.desc}</p>
            <div className="grid grid-cols-2 gap-3">{p.metrics.map((m) => <Stat key={m.l} v={m.v} l={m.l} />)}</div>
            <p className="rounded-[14px] border border-dashed border-line p-5 font-mono text-[13px] text-muted">
              [Full case study coming: demo, architecture, the story and what didn&apos;t work.]
            </p>
          </div>
        )}

        <button type="button" onClick={() => onNext(next)} className="flex cursor-pointer items-center justify-between gap-4 border-t border-line pt-6 text-left text-fg">
          <span className="font-mono text-xs text-muted">NEXT PROJECT</span>
          <span className="text-[22px] font-semibold">{next.title} →</span>
        </button>
      </div>
    </div>
  );
}

function CsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-[18px]">
      <div className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{"// "}{title}</div>
      {children}
    </section>
  );
}
