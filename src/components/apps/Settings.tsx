"use client";

import { ACCENTS, useSettings, type Accent, type Theme } from "@/lib/store";
import { useResolvedTheme } from "@/components/os/useTheme";

const WALLPAPERS = [
  { label: "Code (default)", ready: true, bg: "linear-gradient(rgba(127,212,232,0.5) 0 0) 34% 38% / 40% 4px no-repeat, linear-gradient(rgba(167,139,250,0.5) 0 0) 38% 50% / 30% 4px no-repeat, linear-gradient(rgba(244,183,134,0.5) 0 0) 38% 62% / 36% 4px no-repeat, radial-gradient(circle at 55% 45%, rgba(244,167,102,0.3), transparent 45%), linear-gradient(160deg, #1E2338, #06070D)" },
  { label: "Circuit · soon", ready: false, bg: "radial-gradient(circle at 50% 45%, rgba(127,212,232,0.35), transparent 40%), linear-gradient(160deg, #1B2A40, #070A11)" },
  { label: "Signal · soon", ready: false, bg: "repeating-radial-gradient(circle at 30% 70%, rgba(244,167,102,0.35) 0 2px, transparent 2px 14px), #0C1018" },
];

export function Settings() {
  const s = useSettings();
  const resolved = useResolvedTheme();

  const toggle = (key: "sound" | "motion" | "tour", label: string, note?: string) => (
    <div className="flex min-h-12 items-center justify-between gap-4 border-t border-hair">
      <span className="text-sm text-fg">
        {label}
        {note && <span className="ml-2 font-mono text-[11px] text-muted">{note}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={s[key]}
        aria-label={label}
        onClick={() => s.set({ [key]: !s[key] })}
        className="flex h-[26px] w-11 cursor-pointer rounded-full p-[3px]"
        style={{ background: s[key] ? "var(--accent)" : "var(--line)", justifyContent: s[key] ? "flex-end" : "flex-start" }}
      >
        <span className="h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]" />
      </button>
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-[26px] overflow-y-auto px-6 py-7 sm:px-9">
      <div>
        <div className="eyebrow">01 · Appearance</div>
        <h1 className="mt-1.5 text-[28px] font-extrabold">Make it yours.</h1>
      </div>

      <div className="flex flex-col gap-2.5">
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
      </div>

      <div className="flex flex-col gap-2.5">
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

      <div className="flex flex-col gap-2.5">
        <div className="text-sm font-semibold">Wallpaper</div>
        <div className="grid grid-cols-3 gap-3">
          {WALLPAPERS.map((w) => (
            <div key={w.label} className="flex flex-col gap-1.5" aria-disabled={!w.ready}>
              <div
                className="h-24 rounded-xl"
                style={{ background: w.bg, border: w.ready ? "2px solid var(--accent)" : "1px solid var(--line)", opacity: w.ready ? 1 : 0.55 }}
              />
              <span className="text-xs text-muted">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        {toggle("motion", "Motion and 3D effects")}
        {toggle("tour", "Show boot screen on first visit")}
        {toggle("sound", "Interface sounds", "coming soon")}
      </div>
    </div>
  );
}
