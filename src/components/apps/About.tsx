"use client";

import Image from "next/image";
import { CURRENTLY, DRIVES, FACTS, JOURNEY, OUTSIDE, PROFILE } from "@/data/profile";
import { commands } from "@/lib/commands";
import { RailDoc, Section, btnGhost, btnSolid, type AppProps } from "./ui";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "journey", label: "Journey" },
  { id: "drives", label: "What drives me" },
  { id: "currently", label: "Currently" },
  { id: "outside", label: "Outside work" },
  { id: "contact", label: "Contact" },
];

export function About({ params, setParams }: AppProps) {
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

      <Section id="journey" n={2} title="Journey">
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

      <Section id="drives" n={3} title="What drives me">
        <div className="mt-4 grid gap-3.5 @2xl:grid-cols-3">
          {DRIVES.map((d) => (
            <div key={d.t} className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-5">
              <div className="text-[17px] font-semibold">{d.t}</div>
              <div className="text-sm leading-relaxed text-fg2">{d.x}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="currently" n={4} title="Currently">
        <dl className="mt-3.5">
          {CURRENTLY.map((c) => (
            <div key={c.k} className="flex gap-5 border-b border-hair py-3 text-[15px]">
              <dt className="w-[110px] flex-none pt-0.5 font-mono text-xs text-muted">{c.k}</dt>
              <dd>{c.v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="outside" n={5} title="Outside work">
        <div className="mt-4 flex flex-col gap-4">
          <Image
            src={OUTSIDE.photo.src}
            alt={OUTSIDE.photo.alt}
            width={OUTSIDE.photo.w}
            height={OUTSIDE.photo.h}
            sizes="(min-width: 1000px) 760px, 100vw"
            className="w-full max-w-[760px] rounded-2xl border border-line object-cover"
          />
          <p className="max-w-[60ch] text-base leading-[1.7] text-fg2">{OUTSIDE.text}</p>
          <ul className="flex flex-wrap gap-2">
            {OUTSIDE.interests.map((i) => (
              <li key={i} className="rounded-full border border-line px-3 py-1 text-[13px]">{i}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="contact" n={6} title="Contact">
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
