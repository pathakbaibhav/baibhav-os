"use client";

import Image from "next/image";
import { CURRENTLY, DRIVES, FACTS, JOURNEY, OUTSIDE, PROFILE } from "@/data/profile";
import { PROJECTS } from "@/data/projects";
import { commands } from "@/lib/commands";
import { useOS } from "@/lib/store";
import { RailDoc, Section, btnGhost, btnSolid, type AppProps } from "./ui";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how", label: "How I work" },
  { id: "work", label: "Recent work" },
  { id: "journey", label: "Journey" },
  { id: "currently", label: "Currently" },
  { id: "outside", label: "Outside work" },
  { id: "contact", label: "Contact" },
];

export function About({ params, setParams }: AppProps) {
  const open = useOS((s) => s.open);
  return (
    <RailDoc
      sections={SECTIONS}
      active={params.section ?? "overview"}
      onPick={(section) => setParams({ section })}
      footer={
        <div className="rounded-xl border border-hair p-3 text-xs leading-normal text-muted">
          Short on time?{" "}
          <button type="button" className="cursor-pointer text-accent" onClick={commands.recruiterTour}>
            Take the recruiter tour →
          </button>
        </div>
      }
    >
      <Section id="overview" n={1} title="Overview">
        <div className="mt-4 flex flex-col gap-8 @2xl:flex-row @2xl:items-start">
          <Image
            src={PROFILE.portrait}
            alt={`Portrait of ${PROFILE.name}`}
            width={400}
            height={500}
            sizes="200px"
            priority
            className="h-[250px] w-[200px] flex-none rounded-2xl border border-line object-cover shadow-[0_12px_32px_var(--shadow)]"
          />
          <div className="flex flex-1 flex-col gap-3.5">
            <h1 className="text-[clamp(28px,4cqw,38px)] font-extrabold leading-tight">
              Hi, I&apos;m Baibhav. {PROFILE.headline}
            </h1>
            <p className="text-base leading-[1.7] text-fg2">
              I&apos;m a software engineer who works on the parts people don&apos;t see: control-plane services, APIs, data pipelines
              and the automation that keeps teams moving. I grew up helping my dad, an electrical engineer, take apart whatever had
              stopped working, and I still build software the way he fixes hardware: predictable, measurable and hard to break.
            </p>
            <p className="text-base leading-[1.7] text-fg2">
              Today I&apos;m a Senior Software Engineer at Zoppler Systems in Bangalore, working in C++ and Python. Before that I
              built control-plane services in Boston, did an M.S. in IoT at Northeastern, and spent nearly three years at PPD
              (Thermo Fisher) automating work for 10,000+ people.
            </p>
            <dl className="mt-1.5 grid gap-x-6 @xl:grid-cols-2">
              {FACTS.map((f) => (
                <div key={f.k} className="flex justify-between gap-3 border-t border-hair py-2.5 text-sm">
                  <dt className="font-mono text-xs text-muted">{f.k}</dt>
                  <dd className="text-right">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <Section id="how" n={2} title="How I work">
        <div className="mt-4 grid gap-3.5 @2xl:grid-cols-2">
          {DRIVES.map((d) => (
            <div key={d.t} className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-5">
              <div className="text-[17px] font-semibold">{d.t}</div>
              <div className="text-sm leading-relaxed text-fg2">{d.x}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="work" n={3} title="Recent work">
        <ul className="mt-4 grid gap-3 @2xl:grid-cols-2">
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => open("projects", { sel: p.num, view: "case" })}
                className="flex h-full w-full cursor-pointer flex-col gap-1.5 rounded-2xl border border-line bg-card p-5 text-left hover:border-accent"
              >
                <span className="font-mono text-xs text-muted">
                  {p.num} · {p.cat} · {p.year}
                </span>
                <span className="font-semibold">{p.title}</span>
                <span className="text-sm leading-relaxed text-fg2">{p.tagline}</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="journey" n={4} title="Journey">
        <h2 className="mb-6 mt-2 text-[26px] font-bold">From games with my dad to control planes.</h2>
        <ol>
          {JOURNEY.map((j) => (
            <li key={j.title} className="flex gap-5">
              <div className="w-16 flex-none pt-0.5 font-mono text-[13px] text-warm">{j.year}</div>
              <div className="flex flex-col items-center">
                <span className="mt-1 h-[11px] w-[11px] rounded-full border-2 border-accent" />
                <span className="w-px flex-1 bg-line" />
              </div>
              <div className="flex-1 pb-5">
                <div className="font-semibold">{j.title}</div>
                <div className="mt-1 text-sm leading-relaxed text-fg2">{j.text}</div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="currently" n={5} title="Currently">
        <h2 className="mb-5 mt-2 text-[26px] font-bold">What&apos;s on my plate right now.</h2>
        <dl className="grid gap-3 @2xl:grid-cols-2">
          {CURRENTLY.map((c) => (
            <div key={c.k} className="flex flex-col gap-1.5 rounded-2xl border border-line bg-card p-5 last:@2xl:col-span-2">
              <dt className="flex items-center gap-2 font-mono text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                {c.k}
              </dt>
              <dd className="text-[15px] leading-relaxed">{c.v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="outside" n={6} title="Outside work">
        <div className="mt-4 flex flex-col gap-4">
          <Image
            src={OUTSIDE.photo.src}
            alt={OUTSIDE.photo.alt}
            width={OUTSIDE.photo.w}
            height={OUTSIDE.photo.h}
            sizes="(min-width: 1000px) 760px, 100vw"
            className="w-full max-w-[760px] rounded-2xl border border-line object-cover"
          />
          <h2 className="mt-2 text-[26px] font-bold">Kitchen, mountains and race weekends.</h2>
          <p className="max-w-[60ch] text-base leading-[1.7] text-fg2">{OUTSIDE.text}</p>
          <div className="grid gap-3.5 @2xl:grid-cols-2">
            {OUTSIDE.cards.map((c) => (
              <div key={c.t} className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-5 last:@2xl:col-span-2">
                <div className="flex items-center gap-2.5 text-[17px] font-semibold">
                  <span className="text-[22px] leading-none" aria-hidden>
                    {c.e}
                  </span>
                  {c.t}
                </div>
                <div className="text-sm leading-relaxed text-fg2">{c.x}</div>
              </div>
            ))}
          </div>
          <ul className="flex flex-wrap gap-2">
            {OUTSIDE.interests.map((i) => (
              <li key={i} className="rounded-full border border-line px-3 py-1 text-[13px]">{i}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="contact" n={7} title="Contact">
        <h2 className="mb-4 mt-2 text-[26px] font-bold">Let&apos;s build something that stays up.</h2>
        <div className="flex flex-wrap gap-2.5">
          <a href={`mailto:${PROFILE.email}`} className={btnSolid}>{PROFILE.email}</a>
          <a href={PROFILE.github} target="_blank" rel="noreferrer" className={btnGhost}>GitHub ↗</a>
          <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className={btnGhost}>LinkedIn ↗</a>
        </div>
      </Section>
    </RailDoc>
  );
}
