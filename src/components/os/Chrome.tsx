"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { APPS, DESKTOP_ICONS, DOCK, ICONS, type AppId } from "@/lib/apps";
import { commands } from "@/lib/commands";
import { motionOK } from "@/lib/motion";
import { play } from "@/lib/sound";
import { useOS, useSettings } from "@/lib/store";
import type { Win } from "@/lib/windows";
import { MenuList, type MenuItem } from "./Menu";
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

type MenuName = "File" | "View" | "Window" | "Help";
type TrayName = "Wi-Fi" | "Battery";

// When this tab loaded baibhavOS; the battery menu reports uptime from it.
const BOOTED_AT = Date.now();

/** Status menus on the right of the menu bar, macOS-style, with a little fun in them. */
function trayMenus(motion: boolean): Record<TrayName, MenuItem[]> {
  const uptime = Math.max(1, Math.round((Date.now() - BOOTED_AT) / 60_000));
  return {
    "Wi-Fi": [
      { label: "baibhavOS-5G", checked: true },
      { label: "IpserLabs-Guest", keys: "alumni", info: true },
      { label: "NEU-Wireless", keys: "graduated", info: true },
      { label: "PPD-Corp", keys: "alumni", info: true },
      { label: "Network Preferences…", run: () => useOS.getState().open("lab"), sep: true },
    ],
    Battery: [
      { label: "Power source", keys: "coffee", info: true },
      { label: "Uptime", keys: `${uptime} min`, info: true },
      { label: "Last crash", keys: "never in prod", info: true },
      { label: "Energy Saver", checked: !motion, run: commands.toggleMotion, sep: true },
    ],
  };
}

function useMenus(light: boolean): Record<MenuName, MenuItem[]> {
  const { focused, windows, focus } = useOS();
  const fw = focused ? windows[focused] : undefined;
  const none = !fw || fw.minimized;
  const open = Object.values(windows).filter((w): w is Win => !!w);
  return {
    File: [
      { label: "New Terminal", keys: "⌥T", run: commands.newTerminal },
      { label: "Open Launchpad", keys: "F4", run: commands.launchpad },
      { label: "Search…", keys: "⌘K", run: commands.spotlight },
      { label: "Close Window", keys: "⌥W", run: commands.closeWindow, disabled: none, sep: true },
    ],
    View: [
      { label: light ? "Switch to Dark" : "Switch to Light", keys: "⇧⌘L", run: commands.toggleTheme },
      { label: "Settings…", run: commands.settings },
    ],
    Window: [
      { label: "Minimize", run: commands.minimize, disabled: none },
      { label: fw?.maximized ? "Restore" : "Zoom", run: commands.maximize, disabled: none },
      { label: "Snap Left", keys: "⌃⌥←", run: commands.snapLeft, disabled: none },
      { label: "Snap Right", keys: "⌃⌥→", run: commands.snapRight, disabled: none },
      { label: "Cycle Windows", keys: "⌥`", run: commands.cycle, disabled: open.filter((w) => !w.minimized).length < 2 },
      ...open.map((w, i) => ({ label: APPS[w.id].label, checked: w.id === focused && !w.minimized, run: () => focus(w.id), sep: i === 0 })),
    ],
    Help: [
      { label: "baibhavOS Help", keys: "?", run: commands.help },
      { label: "Take the Tour", run: commands.tour },
      { label: "Start Recruiter Tour", run: commands.recruiterTour },
      { label: "About baibhavOS", run: commands.aboutOS, sep: true },
    ],
  };
}

export function MenuBar() {
  const { focused, windows, setLaunchpad } = useOS();
  const light = useResolvedTheme() === "light";
  const setSettings = useSettings((s) => s.set);
  const active = focused && windows[focused] ? APPS[focused].title : "Finder";
  const menus = useMenus(light);
  const { motion, sound } = useSettings();
  const tray = trayMenus(motion);
  const [openMenu, setOpenMenu] = useState<MenuName | TrayName | null>(null);
  const bar = useRef<HTMLElement>(null);
  const closeMenu = useCallback(() => setOpenMenu(null), []);

  return (
    <header ref={bar} className="absolute inset-x-0 top-0 z-[9000] flex h-[30px] items-center gap-5 border-b border-hair bg-chrome px-3.5 text-[13.5px] backdrop-blur-[24px] backdrop-saturate-[160%]">
      <button type="button" aria-label="Open Launchpad" onClick={() => setLaunchpad(true)} className="flex cursor-pointer items-center text-fg">
        <Icon d={ICONS.lab} size={16} strokeWidth={1.8} />
      </button>
      <span className="font-bold text-fg">{active}</span>
      <nav aria-label="Menus" data-tour="menus" className="-ml-2 hidden gap-0.5 text-fg2 md:flex">
        {(Object.keys(menus) as MenuName[]).map((name) => (
          <div key={name} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={openMenu === name}
              onClick={() => setOpenMenu((m) => (m === name ? null : name))}
              onPointerEnter={() => openMenu && setOpenMenu(name)}
              className="cursor-pointer rounded-md px-2 py-0.5"
              style={openMenu === name ? { background: "color-mix(in srgb, var(--fg) 12%, transparent)", color: "var(--fg)" } : undefined}
            >
              {name}
            </button>
            {openMenu === name && (
              <MenuList items={menus[name]} label={`${name} menu`} onClose={closeMenu} ignore={bar} style={{ left: 0, top: 27 }} />
            )}
          </div>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-4 text-fg2">
        <div data-tour="tray" className="flex items-center gap-4">
        {(Object.keys(tray) as TrayName[]).map((name) => (
          <div key={name} className="relative hidden sm:flex">
            <button
              type="button"
              aria-label={name}
              aria-haspopup="menu"
              aria-expanded={openMenu === name}
              onClick={() => setOpenMenu((m) => (m === name ? null : name))}
              onPointerEnter={() => openMenu && setOpenMenu(name)}
              className="flex cursor-pointer rounded-md px-1 py-0.5"
              style={openMenu === name ? { background: "color-mix(in srgb, var(--fg) 12%, transparent)", color: "var(--fg)" } : undefined}
            >
              <Icon d={name === "Wi-Fi" ? ICONS.wifi : ICONS.battery} size={16} strokeWidth={1.8} />
            </button>
            {openMenu === name && (
              <MenuList items={tray[name]} label={`${name} menu`} onClose={closeMenu} ignore={bar} style={{ right: 0, top: 27 }} />
            )}
          </div>
        ))}
        <button
          type="button"
          role="switch"
          aria-checked={sound}
          aria-label="Interface sounds"
          title={sound ? "Mute interface sounds" : "Turn on interface sounds"}
          onClick={() => {
            commands.toggleSound();
            if (!sound) play("toggle");
          }}
          className="flex cursor-pointer"
        >
          <Icon d={sound ? ICONS.volume : ICONS.mute} size={16} strokeWidth={1.8} />
        </button>
        </div>
        <button type="button" data-tour="search" aria-label="Search (⌘K)" title="Search (⌘K)" onClick={() => setLaunchpad(true, true)} className="flex cursor-pointer">
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
  const { windows, focused, open, focus, requestMinimize, setLaunchpad } = useOS();
  return (id: AppId | "launchpad") => {
    if (id === "launchpad") return setLaunchpad(true);
    const w = windows[id];
    if (!w) open(id);
    else if (focused === id && !w.minimized) requestMinimize(id);
    else focus(id);
  };
}

export function DesktopIcons() {
  const launch = useLaunch();
  const focused = useOS((s) => s.focused);
  return (
    <nav aria-label="Desktop" data-tour="desktop" className="absolute left-[26px] top-14 z-[5] hidden w-[110px] flex-col items-center gap-6 sm:flex">
      {DESKTOP_ICONS.map((id) => (
        <button key={id} type="button" onClick={() => launch(id)} className="group flex cursor-pointer flex-col items-center gap-2">
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

const MAGNIFY = 0.3; // extra scale at the cursor
const MAGNIFY_RADIUS = 110; // px over which the effect fades out

export function Dock() {
  const launch = useLaunch();
  const { windows, focused } = useOS();
  const [pointerX, setPointerX] = useState<number | null>(null);
  // Icon centres, measured unscaled when the pointer enters (scaling is a transform, so they don't move).
  const centers = useRef<Record<string, number>>({});
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});

  const scaleOf = (key: string) => {
    const c = centers.current[key];
    if (pointerX === null || c === undefined) return 1;
    return 1 + MAGNIFY * Math.max(0, 1 - Math.abs(pointerX - c) / MAGNIFY_RADIUS);
  };

  return (
    <nav
      aria-label="Dock"
      data-tour="dock"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse" || !motionOK()) return;
        for (const [k, el] of Object.entries(buttons.current)) {
          if (el) {
            const r = el.getBoundingClientRect();
            centers.current[k] = r.left + r.width / 2;
          }
        }
        setPointerX(e.clientX);
      }}
      onPointerMove={(e) => pointerX !== null && setPointerX(e.clientX)}
      onPointerLeave={() => setPointerX(null)}
      className="absolute bottom-3 left-1/2 z-[8000] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-end gap-[9px] rounded-[22px] border border-line px-[11px] py-2 shadow-[0_20px_60px_var(--shadow)] backdrop-blur-[24px] backdrop-saturate-[160%]"
      style={{ background: "color-mix(in srgb, var(--window) 55%, transparent)" }}
    >
      {DOCK.map((id, i) => {
        if (id === null) return <span key={`sep${i}`} className="h-10 w-px self-center bg-line" />;
        const label = id === "launchpad" ? "Launchpad" : APPS[id].label;
        const running = id !== "launchpad" && !!windows[id];
        const scale = scaleOf(id);
        return (
          <button
            key={id}
            ref={(el) => {
              buttons.current[id] = el;
            }}
            type="button"
            aria-label={label}
            onClick={() => launch(id)}
            className="group relative flex flex-none cursor-pointer flex-col items-center gap-[5px]"
          >
            <span
              role="tooltip"
              className="pointer-events-none absolute -top-11 whitespace-nowrap rounded-md border border-line bg-popover px-2.5 py-1 text-xs text-fg opacity-0 shadow-[0_8px_24px_var(--shadow)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              {label}
            </span>
            <span
              className="flex h-[50px] w-[50px] origin-bottom items-center justify-center rounded-[13px] border border-hair transition-transform duration-100 ease-out"
              style={{
                background: "var(--tile)",
                color: focused === id ? "var(--accent)" : "var(--fg)",
                transform: pointerX === null ? undefined : `translateY(${-(scale - 1) * 26}px) scale(${scale})`,
              }}
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
    <div className="anim-fade absolute right-7 top-14 z-[5] hidden flex-col gap-4 xl:flex">
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
