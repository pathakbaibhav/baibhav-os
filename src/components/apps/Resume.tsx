"use client";

import { EDUCATION, JOBS, RESUME_PDF, RESUME_SUMMARY } from "@/data/experience";
import { PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { SKILLS } from "@/data/skills";
import { useOS } from "@/lib/store";
import { RailDoc, Section, btnGhost, type AppProps } from "./ui";

// Resume, two ways: Read (the interactive document) and PDF (the file itself),
// plus a download. The header stays put while the document scrolls.

const SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
];

const ROLE = PROFILE.role.replace(/\.$/, "");
const meta = "font-mono text-[11px] uppercase tracking-[0.18em]";
const chip = "rounded-md px-2 py-1 font-mono text-[11px] text-accent";
const chipBg = { background: "color-mix(in srgb, var(--accent) 10%, transparent)" };

export function Resume({ params, setParams }: AppProps) {
  const mode = params.mode === "pdf" ? "pdf" : "read";
  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-none flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-hair px-6 py-4 @3xl:px-8">
        <div className="min-w-0">
          <div className="text-xl font-semibold">{PROFILE.name}</div>
          <div className={`${meta} mt-1 text-muted`}>{ROLE}</div>
        </div>
        <div className={`${meta} flex items-center gap-7`}>
          <div role="tablist" aria-label="Resume view" className="flex gap-5">
            {(["read", "pdf"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setParams({ mode: m })}
                className="min-h-8 cursor-pointer border-b-2 pb-1"
                style={mode === m ? { borderColor: "var(--fg)", color: "var(--fg)" } : { borderColor: "transparent", color: "var(--muted)" }}
              >
                {m === "read" ? "Read" : "PDF"}
              </button>
            ))}
          </div>
          {RESUME_PDF ? (
            <a href={RESUME_PDF} download="Baibhav-Pathak-Resume.pdf" className="text-fg2 no-underline hover:text-fg">
              Download PDF ↓
            </a>
          ) : (
            <span aria-disabled="true" title="The PDF isn't published yet" className="text-muted opacity-60">
              Download PDF
            </span>
          )}
        </div>
      </header>
      <div className="relative min-h-0 flex-1">
        {mode === "read" ? <ReadView params={params} setParams={setParams} /> : <PdfView onRead={() => setParams({ mode: "read" })} />}
      </div>
    </div>
  );
}

function PdfView({ onRead }: { onRead: () => void }) {
  if (RESUME_PDF) return <iframe src={`${RESUME_PDF}#view=FitH`} title="Resume (PDF)" className="h-full w-full border-0 bg-white" />;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">PDF not published yet</p>
      <p className="max-w-[360px] text-sm leading-relaxed text-fg2">The full resume is in the Read view in the meantime.</p>
      <button type="button" onClick={onRead} className={`${btnGhost} cursor-pointer`}>Open the Read view</button>
    </div>
  );
}

function ReadView({ params, setParams }: AppProps) {
  const open = useOS((s) => s.open);
  const github = PROFILE.github.replace(/^https:\/\//, "");
  return (
    <RailDoc label="Resume" sections={SECTIONS} active={params.section ?? "summary"} onPick={(section) => setParams({ section })}>
      <header className="pb-10">
        <h1 className="text-[clamp(40px,8cqw,76px)] font-extrabold leading-[0.95] tracking-[-0.01em]">{PROFILE.name}</h1>
        <p className={`${meta} mt-5 text-fg2`}>{ROLE}</p>
        <div className="mt-5 h-px bg-line" />
        <p className={`${meta} mt-4 flex flex-wrap gap-x-2 gap-y-2 leading-relaxed text-muted`}>
          <a href={`mailto:${PROFILE.email}`} className="text-fg2 no-underline hover:text-fg">{PROFILE.email}</a>
          <span aria-hidden="true">·</span>
          <a href={PROFILE.github} target="_blank" rel="noreferrer" className="text-fg2 no-underline hover:text-fg">{github}</a>
          <span aria-hidden="true">·</span>
          <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className="text-fg2 no-underline hover:text-fg">LinkedIn</a>
          <span aria-hidden="true">·</span>
          <span>{PROFILE.location}</span>
        </p>
      </header>

      <Section id="summary" n={1} title="Summary">
        <p className="mt-4 max-w-[70ch] text-base leading-[1.7] text-fg2">{RESUME_SUMMARY}</p>
      </Section>

      <Section id="experience" n={2} title="Experience">
        <div className="mt-4 flex flex-col gap-3.5">
          {JOBS.map((j) => (
            <article key={j.id} className="flex flex-col gap-2.5 rounded-2xl border border-line bg-card px-6 py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-xl font-semibold">
                  {j.role} <span className="font-medium text-muted">· {j.company}</span>
                </h2>
                <span className="font-mono text-xs text-muted">{j.dates} · {j.location}</span>
              </div>
              {j.bullets.length > 0 && (
                <ul className="flex list-disc flex-col gap-1.5 pl-[18px] text-sm leading-relaxed text-fg2">
                  {j.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              )}
              <div className="flex flex-wrap gap-1.5">
                {j.tags.map((t) => <span key={t} className={chip} style={chipBg}>{t}</span>)}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="projects" n={3} title="Projects">
        <ul className="mt-4">
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => open("projects", { sel: p.num, view: "case" })}
                className="flex w-full cursor-pointer flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-hair py-3.5 text-left"
              >
                <span className="w-7 font-mono text-xs text-muted">{p.num}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="block font-semibold text-fg">{p.title}</span>
                  <span className="block text-sm text-fg2">{p.tagline} {p.desc}</span>
                  <span className="block font-mono text-[11px] text-muted">{(p.caseStudy?.builtWith ?? p.stack).join(" · ")}</span>
                </span>
                <span className="font-mono text-xs text-warm">{p.metrics.map((m) => m.v).join(" · ")}</span>
                <span className="text-sm text-accent">Case study →</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="skills" n={4} title="Skills">
        <dl className="mt-4">
          {SKILLS.map((g) => (
            <div key={g.name} className="flex flex-col gap-2 border-t border-hair py-3 @xl:flex-row @xl:gap-5">
              <dt className="flex-none font-mono text-xs text-muted @xl:w-36 @xl:pt-1">{g.name}</dt>
              <dd className="flex flex-wrap gap-1.5">
                {g.items.map((s) => <span key={s} className="rounded-lg border border-line px-2.5 py-1 text-[13px]">{s}</span>)}
              </dd>
            </div>
          ))}
        </dl>
        <button type="button" onClick={() => open("skills")} className="mt-3 cursor-pointer text-sm text-accent">
          Where I&apos;ve used each one →
        </button>
      </Section>

      <Section id="education" n={5} title="Education">
        <div className="mt-4 flex flex-col gap-3.5">
          {EDUCATION.map((e) => (
            <div key={e.school} className="rounded-2xl border border-line bg-card px-6 py-5">
              <div className="font-mono text-xs text-muted">{e.dates}</div>
              <div className="mt-1.5 text-lg font-semibold">{e.degree}</div>
              <div className="text-sm text-fg2">{e.school}</div>
            </div>
          ))}
        </div>
      </Section>
    </RailDoc>
  );
}
