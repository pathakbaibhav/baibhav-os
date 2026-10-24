"use client";

import { APPS, LAUNCHPAD_ORDER } from "@/lib/apps";
import { commands } from "@/lib/commands";
import { TOUR_STEPS } from "@/components/os/Tour";
import { RailDoc, Section, btnSolid, type AppProps } from "./ui";

const SECTIONS = [
  { id: "start", label: "Getting started" },
  { id: "apps", label: "Apps" },
  { id: "keys", label: "Shortcuts" },
  { id: "phone", label: "On a phone" },
  { id: "credits", label: "Credits" },
];

// ⌘T / ⌘W / ⌘` belong to the browser, so baibhavOS uses ⌥ for those.
const KEYS = [
  { d: "Search apps and projects", k: "⌘K" },
  { d: "Open Launchpad", k: "F4" },
  { d: "New terminal", k: "⌥T" },
  { d: "Close window", k: "⌥W" },
  { d: "Cycle windows", k: "⌥`" },
  { d: "Toggle light / dark", k: "⇧⌘L" },
  { d: "Snap window left / right", k: "⌃⌥← / →" },
  { d: "Maximize window", k: "double-click title" },
  { d: "Open Help", k: "?" },
];

export function Help({ params, setParams }: AppProps) {
  return (
    <RailDoc sections={SECTIONS} active={params.section ?? "start"} onPick={(section) => setParams({ section })}>
      <Section id="start" n={1} title="Getting started">
        <h1 className="mt-3 text-[34px] font-extrabold leading-tight">Welcome to baibhavOS.</h1>
        <p className="mt-4 max-w-[620px] text-base leading-[1.65] text-fg2">
          It&apos;s my portfolio, built as a small operating system. Everything you&apos;d find on a resume is an app. Open apps from
          the dock or the desktop, drag windows around, and right-click anywhere for shortcuts.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button type="button" onClick={commands.tour} className={`${btnSolid} cursor-pointer`}>
            Start the guided tour →
          </button>
        </div>
        <ol className="mt-5 flex flex-col">
          {TOUR_STEPS.map((t, i) => (
            <li key={t.title} className="flex gap-4 border-t border-hair py-3">
              <span className="w-6 flex-none font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{t.title}</span>
                <span className="text-[13px] leading-relaxed text-fg2">{t.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={commands.recruiterTour}
          className="mt-4 cursor-pointer rounded-xl border border-[rgba(244,167,102,0.35)] bg-[rgba(244,167,102,0.08)] px-4 py-3 text-left text-sm text-warm"
        >
          Recruiter in a hurry? Start the 30-second tour: About Me → Projects → Resume, opened for you →
        </button>
      </Section>

      <Section id="apps" n={2} title="Apps">
        <div className="mt-3.5 grid gap-x-7 @2xl:grid-cols-2">
          {LAUNCHPAD_ORDER.map((id) => (
            <div key={id} className="flex gap-3.5 border-t border-hair py-3">
              <span className="w-[120px] flex-none text-sm font-semibold">{APPS[id].label}</span>
              <span className="text-[13px] leading-normal text-fg2">{id === "help" ? "You are here." : APPS[id].blurb}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="keys" n={3} title="Shortcuts">
        <div className="mt-3.5 grid gap-x-7 @2xl:grid-cols-2">
          {KEYS.map((k) => (
            <div key={k.d} className="flex items-center justify-between border-t border-hair py-2.5 text-sm">
              <span className="text-fg2">{k.d}</span>
              <kbd className="rounded-md border border-line bg-card px-2 py-0.5 font-mono text-xs">{k.k}</kbd>
            </div>
          ))}
        </div>
      </Section>

      <Section id="phone" n={4} title="On a phone">
        <p className="mt-3 max-w-[640px] text-[15px] leading-[1.65] text-fg2">
          baibhavOS turns into a phone home screen. Tap an app to open it full screen and tap back to close it. Search sits at the top
          of the home screen.
        </p>
      </Section>

      <Section id="credits" n={5} title="Credits">
        <p className="mt-3 max-w-[640px] text-[15px] leading-[1.65] text-fg2">
          Designed and built by Baibhav Pathak with Next.js, TypeScript, Tailwind CSS and Zustand. Inspired by macOS and by other
          developers who built OS-style portfolios. Source on GitHub.
        </p>
      </Section>
    </RailDoc>
  );
}
