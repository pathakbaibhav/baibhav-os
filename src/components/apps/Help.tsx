"use client";

import { useState } from "react";
import { APPS, LAUNCHPAD_ORDER } from "@/lib/apps";
import { useOS } from "@/lib/store";
import { startRecruiterTour } from "@/components/os/ContextMenu";
import { RailDoc, Section, btnGhost, btnSolid, type AppProps } from "./ui";

const SECTIONS = [
  { id: "start", label: "Getting started" },
  { id: "apps", label: "Apps" },
  { id: "keys", label: "Shortcuts" },
  { id: "phone", label: "On a phone" },
  { id: "credits", label: "Credits" },
];

const STEPS = [
  { t: "Open anything from the dock", x: "The dock at the bottom holds every app. Click one to open it as a window; the dot underneath means it is running." },
  { t: "Search with ⌘K", x: 'Press ⌘K (Ctrl+K on Windows) to search apps, projects and commands. Type "asl" to jump straight to a case study.' },
  { t: "Right-click the desktop", x: "You get quick actions: a new terminal, a wallpaper change, the light/dark switch and the recruiter tour." },
  { t: "Drag, snap and stack windows", x: "Drag a window by its title bar. Push it to the left or right edge to snap to half the screen. Double-click the title bar to maximize it." },
  { t: "Make it yours", x: "Open Settings to switch light or dark, pick an accent color, or turn motion effects off." },
];

const APP_DESCRIPTIONS: Record<string, string> = {
  about: "Who I am: overview, journey, what drives me, what I am doing now.",
  projects: "Filterable index of my work, with a full case study for each project.",
  resume: "Read it in the browser, or switch to the PDF and download it.",
  skills: "What I use, grouped and rated by how deep I go with each tool.",
  terminal: "A working shell. Try help, projects or route park-street harvard.",
  lab: "Live status, latency and traffic for the APIs I run.",
  github: "My contribution graph, recent commits and pinned repositories, pulled live.",
  writing: "Build logs and deep dives on the projects.",
  contact: "Send me a message, or grab my email and links.",
  settings: "Theme, accent color, wallpaper, sound and motion.",
  help: "You are here.",
  arcade: "Small games, for when you need a break.",
};

// ⌘T / ⌘W belong to the browser, so baibhavOS uses ⌥ for those.
const KEYS = [
  { d: "Search apps and projects", k: "⌘K" },
  { d: "Open Launchpad", k: "F4" },
  { d: "New terminal", k: "⌥T" },
  { d: "Close window", k: "⌥W" },
  { d: "Toggle light / dark", k: "⇧⌘L" },
  { d: "Snap window left / right", k: "drag to edge" },
  { d: "Maximize window", k: "double-click title" },
  { d: "Open Help", k: "?" },
];

export function Help({ params, setParams }: AppProps) {
  const open = useOS((s) => s.open);
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <RailDoc sections={SECTIONS} active={params.section ?? "start"} onPick={(section) => setParams({ section })}>
      <Section id="start" n={1} title="Getting started">
        <h1 className="mt-3 text-[34px] font-extrabold leading-tight">Welcome to baibhavOS.</h1>
        <p className="mt-4 max-w-[620px] text-base leading-[1.65] text-fg2">
          It&apos;s my portfolio, built as a small operating system. Everything you&apos;d find on a resume is an app. Open apps from
          the dock or the desktop, drag windows around, and right-click anywhere for shortcuts.
        </p>
        <div
          className="mt-4 flex flex-col gap-5 rounded-2xl border p-[22px] @2xl:flex-row"
          style={{ background: "color-mix(in srgb, var(--accent) 6%, transparent)", borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
        >
          <div
            className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-[14px] font-mono text-lg text-accent"
            style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)" }}
          >
            {step + 1}
          </div>
          <div className="flex flex-1 flex-col gap-1.5" aria-live="polite">
            <div className="font-mono text-[11px] text-muted">TOUR · STEP {step + 1} OF {STEPS.length}</div>
            <div className="text-[19px] font-bold">{s.t}</div>
            <div className="text-sm leading-relaxed text-fg2">{s.x}</div>
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
              {STEPS.map((_, k) => (
                <span key={k} className="h-1.5 rounded-[3px]" style={{ width: k === step ? 22 : 6, background: k === step ? "var(--accent)" : "var(--line)" }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 @2xl:flex-col @2xl:justify-center">
            <button type="button" className={`${btnSolid} cursor-pointer justify-center`} onClick={() => setStep(last ? 0 : step + 1)}>
              {last ? "Done" : "Next"}
            </button>
            <button type="button" className={`${btnGhost} cursor-pointer justify-center`} onClick={() => setStep(Math.max(0, step - 1))}>
              Back
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => startRecruiterTour(open)}
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
              <span className="text-[13px] leading-normal text-fg2">{APP_DESCRIPTIONS[id]}</span>
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
