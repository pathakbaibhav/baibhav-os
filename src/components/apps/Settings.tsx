"use client";

import type { ReactNode } from "react";
import { ACCENTS, useSettings, type Accent, type Theme, type WallpaperId } from "@/lib/store";
import { SETTINGS_KEY } from "@/lib/theme";
import { play } from "@/lib/sound";
import { useResolvedTheme } from "@/components/os/useTheme";
import { RailDoc, Section, btnGhost, type AppProps } from "./ui";

const SECTIONS = [
  { id: "appearance", label: "Appearance" },
  { id: "wallpaper", label: "Wallpaper" },
  { id: "sound", label: "Sound & motion" },
  { id: "privacy", label: "Privacy" },
  { id: "about", label: "About this OS" },
];

const WALLPAPERS: { id: WallpaperId; label: string; note: string; thumb: string }[] = [
  {
    id: "code",
    label: "Code",
    note: "Glass editor panes running the subway route API.",
    thumb:
      "linear-gradient(rgba(127,212,232,0.5) 0 0) 34% 38% / 40% 4px no-repeat, linear-gradient(rgba(167,139,250,0.5) 0 0) 38% 50% / 30% 4px no-repeat, linear-gradient(rgba(244,183,134,0.5) 0 0) 38% 62% / 36% 4px no-repeat, radial-gradient(circle at 55% 45%, rgba(244,167,102,0.3), transparent 45%), linear-gradient(160deg, #1E2338, #06070D)",
  },
  {
    id: "circuit",
    label: "Circuit",
    note: "An IoT circuit board: a BP-01 chip, sensors and an antenna.",
    thumb:
      "linear-gradient(rgba(127,212,232,0.6) 0 0) 50% 30% / 2px 30% no-repeat, linear-gradient(rgba(127,212,232,0.6) 0 0) 30% 50% / 40% 2px no-repeat, radial-gradient(circle at 50% 50%, rgba(244,167,102,0.55) 0 7%, transparent 8%), radial-gradient(circle at 50% 45%, rgba(127,212,232,0.3), transparent 45%), linear-gradient(160deg, #1B2A40, #070A11)",
  },
];

const REPO = "https://github.com/pathakbaibhav/baibhav-os";

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 border-t border-hair py-2">
      <span className="flex flex-col text-sm text-fg">
        {label}
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
      {children}
    </div>
  );
}

export function Settings({ params, setParams }: AppProps) {
  const s = useSettings();
  const resolved = useResolvedTheme();

  const toggle = (key: "sound" | "motion" | "tour", label: string, hint?: string) => (
    <Row label={label} hint={hint}>
      <button
        type="button"
        role="switch"
        aria-checked={s[key]}
        aria-label={label}
        onClick={() => {
          s.set({ [key]: !s[key] });
          if (key === "sound" && !s.sound) play("toggle"); // a preview as it turns on
        }}
        className="flex h-[26px] w-11 flex-none cursor-pointer rounded-full p-[3px]"
        style={{ background: s[key] ? "var(--accent)" : "var(--line)", justifyContent: s[key] ? "flex-end" : "flex-start" }}
      >
        <span className="h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]" />
      </button>
    </Row>
  );

  const reset = () => {
    if (!window.confirm("Reset baibhavOS? Your theme, accent, wallpaper and sound settings go back to the defaults.")) return;
    try {
      localStorage.removeItem(SETTINGS_KEY);
      sessionStorage.clear();
    } catch {}
    window.location.assign("/");
  };

  return (
    <RailDoc label="Settings" sections={SECTIONS} active={params.section ?? "appearance"} onPick={(section) => setParams({ section })}>
      <Section id="appearance" n={1} title="Appearance">
        <h1 className="mt-1.5 text-[28px] font-extrabold">Make it yours.</h1>
        <div className="mt-6 flex flex-col gap-2.5">
          <div id="theme-label" className="text-sm font-semibold">Theme</div>
          <div role="radiogroup" aria-labelledby="theme-label" className="inline-flex self-start rounded-[10px] bg-card p-[3px]">
            {(["light", "dark", "auto"] as Theme[]).map((t) => {
              const on = s.theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => s.set({ theme: t })}
                  className="min-h-9 min-w-[92px] cursor-pointer rounded-lg text-sm font-medium capitalize text-fg"
                  style={on ? { background: "var(--window)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" } : undefined}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted">Auto follows your system&apos;s light or dark setting.</p>
        </div>
        <div className="mt-6 flex flex-col gap-2.5">
          <div className="text-sm font-semibold">Accent</div>
          <div className="flex gap-3">
            {(Object.keys(ACCENTS) as Accent[]).map((a) => (
              <button
                key={a}
                type="button"
                aria-label={`${a} accent`}
                aria-pressed={s.accent === a}
                onClick={() => s.set({ accent: a })}
                className="h-8 w-8 cursor-pointer rounded-full"
                style={{
                  background: ACCENTS[a][resolved],
                  border: `3px solid ${s.accent === a ? "var(--fg)" : "transparent"}`,
                  outline: "2px solid var(--bg)",
                  outlineOffset: -5,
                }}
              />
            ))}
          </div>
        </div>
      </Section>

      <Section id="wallpaper" n={2} title="Wallpaper">
        <div role="radiogroup" aria-label="Wallpaper" className="mt-4 grid gap-4 @xl:grid-cols-2">
          {WALLPAPERS.map((w) => {
            const on = s.wallpaper === w.id;
            return (
              <button
                key={w.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => s.set({ wallpaper: w.id })}
                className="flex cursor-pointer flex-col gap-2 text-left"
              >
                <span
                  className="h-28 w-full rounded-xl"
                  style={{ background: w.thumb, border: on ? "2px solid var(--accent)" : "1px solid var(--line)" }}
                />
                <span className="text-sm font-semibold text-fg">
                  {w.label} {on && <span className="font-mono text-[11px] font-normal text-accent">· in use</span>}
                </span>
                <span className="text-xs leading-snug text-muted">{w.note}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section id="sound" n={3} title="Sound & motion">
        <div className="mt-3 flex flex-col">
          {toggle("sound", "Interface sounds", "Soft clicks when windows open, close and minimize.")}
          {toggle("motion", "Motion and 3D effects", "Off makes everything still, as does your system's Reduce Motion setting.")}
          {toggle("tour", "Show boot screen on first visit")}
        </div>
      </Section>

      <Section id="privacy" n={4} title="Privacy">
        <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-fg2">
          baibhavOS sets no cookies. Page views are counted anonymously with Vercel Analytics, which stores no personal data
          and can&apos;t follow you across sites. Your settings are saved only in this browser&apos;s local storage.
        </p>
        <button type="button" onClick={reset} className={`${btnGhost} mt-4 cursor-pointer`}>
          Reset baibhavOS…
        </button>
      </Section>

      <Section id="about" n={5} title="About this OS">
        <dl className="mt-3 font-mono text-[13px]">
          {[
            ["version", "baibhavOS 1.0"],
            ["build", `${process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev"} · ${process.env.NEXT_PUBLIC_BUILD_DATE ?? ""}`],
            ["made with", "Next.js · React · TypeScript · Tailwind CSS · Zustand"],
            ["type", "Inter Tight · JetBrains Mono (SIL Open Font License)"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4 border-t border-hair py-2.5">
              <dt className="w-24 flex-none text-muted">{k}</dt>
              <dd className="text-fg">{v}</dd>
            </div>
          ))}
        </dl>
        <a href={REPO} target="_blank" rel="noreferrer" className={`${btnGhost} mt-4`}>
          Source on GitHub ↗
        </a>
      </Section>
    </RailDoc>
  );
}
