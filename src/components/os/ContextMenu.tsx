"use client";

import { useEffect, useRef } from "react";
import { useOS, useSettings } from "@/lib/store";
import { useResolvedTheme } from "./useTheme";

type Item = { label: string; keys?: string; run: () => void; sep?: boolean };

export function startRecruiterTour(open: ReturnType<typeof useOS.getState>["open"]) {
  open("about");
  setTimeout(() => open("projects"), 250);
  setTimeout(() => open("resume"), 500);
}

export function ContextMenu({ x, y, onClose }: { x: number; y: number; onClose: () => void }) {
  const { open, setLaunchpad } = useOS();
  const setSettings = useSettings((s) => s.set);
  const light = useResolvedTheme() === "light";
  const ref = useRef<HTMLDivElement>(null);

  const items: Item[] = [
    { label: "New Terminal", keys: "⌥T", run: () => open("terminal") },
    { label: "Open Launchpad", keys: "F4", run: () => setLaunchpad(true) },
    { label: "Search…", keys: "⌘K", run: () => setLaunchpad(true, true) },
    { label: "Change Wallpaper…", run: () => open("settings"), sep: true },
    { label: light ? "Switch to Dark" : "Switch to Light", keys: "⇧⌘L", run: () => setSettings({ theme: light ? "dark" : "light" }) },
    { label: "Start Recruiter Tour", run: () => startRecruiterTour(open), sep: true },
    { label: "Help", keys: "?", run: () => open("help") },
    { label: "About baibhavOS", run: () => open("help", { section: "credits" }) },
  ];

  useEffect(() => {
    ref.current?.querySelector("button")?.focus();
    const close = (e: Event) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  const left = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1440) - 260);
  const top = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 900) - 330);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Desktop menu"
      className="anim-fade absolute z-[9500] w-[250px] rounded-xl border border-line bg-popover p-1.5 text-[13.5px] shadow-[0_20px_50px_var(--shadow)] backdrop-blur-[24px]"
      style={{ left, top }}
      onKeyDown={(e) => {
        const buttons = [...(ref.current?.querySelectorAll("button") ?? [])];
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (e.key === "ArrowDown") buttons[(i + 1) % buttons.length]?.focus();
        else if (e.key === "ArrowUp") buttons[(i - 1 + buttons.length) % buttons.length]?.focus();
      }}
    >
      {items.map((it) => (
        <div key={it.label}>
          {it.sep && <div className="mx-2 my-[5px] h-px bg-line" />}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              it.run();
              onClose();
            }}
            className="flex min-h-8 w-full cursor-pointer items-center justify-between rounded-[7px] px-2.5 text-fg outline-none hover:bg-accent hover:text-[#071016] focus:bg-accent focus:text-[#071016]"
          >
            <span>{it.label}</span>
            {it.keys && <span className="font-mono text-[11px] opacity-70">{it.keys}</span>}
          </button>
        </div>
      ))}
    </div>
  );
}
