"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { APPS, DESKTOP_ICONS, DOCK, ICONS, type AppId } from "@/lib/apps";
import { useOS, useSettings } from "@/lib/store";
import { PROFILE } from "@/data/profile";
import { useResolvedTheme } from "./useTheme";

// Menu bar, desktop icons, dock and desktop widgets.

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);
  const day = now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const time = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return (
    <time dateTime={now.toISOString()} className="font-medium text-fg">
      {day}, {time}
    </time>
  );
}

export function MenuBar() {
  const { focused, windows, setLaunchpad, open } = useOS();
  const light = useResolvedTheme() === "light";
  const setSettings = useSettings((s) => s.set);
  const active = focused && windows[focused] ? APPS[focused].title : "Finder";

  return (
    <header className="absolute inset-x-0 top-0 z-[9000] flex h-[30px] items-center gap-5 border-b border-hair bg-chrome px-3.5 text-[13.5px] backdrop-blur-[24px] backdrop-saturate-[160%]">
      <button type="button" aria-label="Open Launchpad" onClick={() => setLaunchpad(true)} className="flex cursor-pointer items-center text-fg">
        <Icon d={ICONS.lab} size={16} strokeWidth={1.8} />
      </button>
      <span className="font-bold text-fg">{active}</span>
      <nav aria-label="Menus" className="hidden gap-5 text-fg2 md:flex">
        <button type="button" className="cursor-pointer" onClick={() => open("projects")}>Projects</button>
        <button type="button" className="cursor-pointer" onClick={() => open("contact")}>Contact</button>
        <button type="button" className="cursor-pointer" onClick={() => open("help")}>Help</button>
      </nav>
      <div className="ml-auto flex items-center gap-4 text-fg2">
        <button type="button" aria-label="Search (⌘K)" title="Search (⌘K)" onClick={() => setLaunchpad(true, true)} className="flex cursor-pointer">
          <Icon d={ICONS.search} size={16} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label={light ? "Switch to dark" : "Switch to light"}
          title={light ? "Switch to dark (⇧⌘L)" : "Switch to light (⇧⌘L)"}
          onClick={() => setSettings({ theme: light ? "dark" : "light" })}
          className="flex cursor-pointer"
        >
          <Icon d={light ? ICONS.moon : ICONS.sun} size={16} strokeWidth={1.8} />
        </button>
        <span className="h-3.5 w-px bg-line" />
        <Clock />
      </div>
    </header>
  );
}

function useLaunch() {
  const { windows, focused, open, focus, minimize, setLaunchpad } = useOS();
  return (id: AppId | "launchpad") => {
    if (id === "launchpad") return setLaunchpad(true);
    const w = windows[id];
    if (!w) open(id);
    else if (focused === id && !w.minimized) minimize(id);
    else focus(id);
  };
}

export function DesktopIcons() {
  const launch = useLaunch();
  const focused = useOS((s) => s.focused);
  return (
    <nav aria-label="Desktop" className="absolute left-[26px] top-14 z-[5] hidden w-[110px] flex-col items-center gap-6 sm:flex">
      {DESKTOP_ICONS.map((id) => (
        <button key={id} type="button" onDoubleClick={() => launch(id)} onClick={() => launch(id)} className="group flex cursor-pointer flex-col items-center gap-2">
          <span
            className="flex h-[66px] w-[66px] items-center justify-center rounded-[17px] border text-fg shadow-[0_6px_18px_var(--shadow)] transition-transform group-hover:-translate-y-0.5"
            style={{ background: "var(--tile)", borderColor: focused === id ? "var(--accent)" : "var(--hair)" }}
          >
            <Icon d={APPS[id].icon} size={30} strokeWidth={1.6} />
          </span>
          <span
            className="rounded-full border border-hair px-[11px] py-[3px] text-[13px] font-medium text-fg"
            style={{ background: focused === id ? "color-mix(in srgb, var(--accent) 28%, transparent)" : "var(--pill)" }}
          >
            {APPS[id].label}
          </span>
        </button>
      ))}
    </nav>
  );
}

export function Dock() {
  const launch = useLaunch();
  const { windows, focused } = useOS();
  return (
    <nav
      aria-label="Dock"
      className="absolute bottom-3 left-1/2 z-[8000] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-end gap-[9px] overflow-x-auto rounded-[22px] border border-line px-[11px] py-2 shadow-[0_20px_60px_var(--shadow)] backdrop-blur-[24px] backdrop-saturate-[160%]"
      style={{ background: "color-mix(in srgb, var(--window) 55%, transparent)" }}
    >
      {DOCK.map((id, i) => {
        if (id === null) return <span key={`sep${i}`} className="h-10 w-px self-center bg-line" />;
        const label = id === "launchpad" ? "Launchpad" : APPS[id].label;
        const running = id !== "launchpad" && !!windows[id];
        return (
          <button key={id} type="button" aria-label={label} title={label} onClick={() => launch(id)} className="group flex flex-none cursor-pointer flex-col items-center gap-[5px]">
            <span
              className="flex h-[50px] w-[50px] items-center justify-center rounded-[13px] border border-hair transition-transform duration-150 group-hover:-translate-y-1.5 group-hover:scale-110"
              style={{ background: "var(--tile)", color: focused === id ? "var(--accent)" : "var(--fg)" }}
            >
              <Icon d={id === "launchpad" ? ICONS.launchpad : APPS[id].icon} />
            </span>
            <span className="h-1 w-1 rounded-full" style={{ background: running ? "var(--fg)" : "transparent" }} />
          </button>
        );
      })}
    </nav>
  );
}

const STAT_ROWS = [
  ["users served", "10,000+"],
  ["tools shipped", "50+"],
  ["peak API", "1,569 req/s"],
];

export function Widgets() {
  const open = useOS((s) => s.open);
  const card = "w-[280px] rounded-[18px] border border-line px-5 py-[18px] backdrop-blur-[20px] flex flex-col gap-2.5";
  const cardBg = { background: "color-mix(in srgb, var(--window) 65%, transparent)" };
  return (
    <div className="absolute right-7 top-14 z-[5] hidden flex-col gap-4 xl:flex">
      <aside aria-label="Now" className={card} style={cardBg}>
        <div className="eyebrow !text-muted">Now</div>
        <div className="text-[15px] leading-normal text-fg">{PROFILE.now}</div>
        <div className="h-px bg-hair" />
        {STAT_ROWS.map(([k, v]) => (
          <div key={k} className="flex justify-between font-mono text-xs text-fg2">
            <span>{k}</span>
            <span className="text-fg">{v}</span>
          </div>
        ))}
      </aside>
      <button type="button" onClick={() => open("lab")} className={`${card} cursor-pointer text-left`} style={cardBg}>
        <div className="eyebrow !text-muted">Systems</div>
        {[["ASL inference API", "2.7 ms"], ["MBTA route API", "[p50]"]].map(([name, v]) => (
          <div key={name} className="flex items-center justify-between text-sm text-fg">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#6EE7B7] shadow-[0_0_8px_#6EE7B7]" />
              {name}
            </span>
            <span className="font-mono text-xs text-fg2">{v}</span>
          </div>
        ))}
        <div className="text-[13px] text-accent">Open Lab →</div>
      </button>
    </div>
  );
}
