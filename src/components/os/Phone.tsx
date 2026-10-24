"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { pathFor, titleFor } from "@/lib/routes";
import { Icon } from "@/components/Icon";
import { AppContent, windowTitle } from "@/components/apps";
import { APPS, ICONS, LAUNCHPAD_ORDER, type AppId } from "@/lib/apps";
import { search } from "@/lib/search";
import { useOS } from "@/lib/store";
import type { Win } from "@/lib/windows";
import { PROFILE } from "@/data/profile";
import { PageViews } from "./PageViews";
import { PhoneWallpaper } from "./Wallpaper";

// Phone layout. It runs on the same window store as the desktop: the focused
// window is the app on screen, opening another app stacks on top of it, and Back
// (button, swipe down on the header, or the browser's own back) closes the top one.

const PHONE_DOCK: AppId[] = ["projects", "terminal", "resume", "contact"];

const LIBRARY: { name: string; apps: AppId[] }[] = [
  { name: "Portfolio", apps: ["about", "projects", "resume", "skills", "contact"] },
  { name: "Live", apps: ["terminal", "lab", "github"] },
  { name: "Read & play", apps: ["writing", "arcade"] },
  { name: "System", apps: ["settings", "help"] },
];

const DISMISS_PX = 110;
const safe = (side: "top" | "bottom", px: number) => `calc(${px}px + env(safe-area-inset-${side}))`;

function Tile({ id, size = 58 }: { id: AppId; size?: number }) {
  const a = APPS[id];
  return (
    <span
      className="flex flex-none items-center justify-center border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.27), background: `linear-gradient(160deg, ${a.color} 0%, ${a.color}AA 55%, #12151C 140%)` }}
    >
      <Icon d={a.icon} size={Math.round(size * 0.45)} stroke="#FFFFFF" />
    </span>
  );
}

/**
 * Ties the app stack to browser history: each app opened from the phone pushes
 * an entry, so the system back gesture closes it instead of leaving the site.
 * Returns the in-app Back action.
 */
function usePhoneHistory(current: Win | undefined) {
  const depth = useOS((s) => Object.values(s.windows).filter(Boolean).length);
  const path = pathFor(current?.id ?? null, current?.params);
  const title = titleFor(current ? { app: current.id, params: current.params } : null);
  const prevDepth = useRef(depth);
  const pushed = useRef(0);

  useEffect(() => {
    if (window.location.pathname !== path) {
      if (depth > prevDepth.current) {
        window.history.pushState({ baibhavos: true }, "", path);
        pushed.current += 1;
      } else {
        window.history.replaceState(window.history.state, "", path);
      }
    }
    prevDepth.current = depth;
    document.title = title;
  }, [path, depth, title]);

  useEffect(() => {
    const onPop = () => {
      const s = useOS.getState();
      if (!s.focused) return;
      pushed.current = Math.max(0, pushed.current - 1);
      s.close(s.focused);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return () => {
    if (pushed.current > 0) return window.history.back();
    const s = useOS.getState();
    if (s.focused) s.close(s.focused);
  };
}

export function Phone() {
  const { windows, focused, open, close, setParams } = useOS();
  const fw = focused ? windows[focused] : undefined;
  const current = fw && !fw.minimized ? fw : undefined;
  const back = usePhoneHistory(current);
  const views = <PageViews path={pathFor(current?.id ?? null, current?.params)} />;

  if (current) {
    return (
      <>
        <AppScreen key={current.id} win={current} onBack={back} onHome={() => Object.keys(windows).forEach((id) => close(id as AppId))} setParams={setParams} />
        {views}
      </>
    );
  }
  return (
    <>
      <Home onLaunch={open} />
      {views}
    </>
  );
}

function AppScreen({
  win,
  onBack,
  onHome,
  setParams,
}: {
  win: Win;
  onBack: () => void;
  onHome: () => void;
  setParams: (id: AppId, p: Record<string, string>) => void;
}) {
  // Pull the header down to dismiss, like an iOS sheet.
  const [pull, setPull] = useState(0);
  const start = useRef<number | null>(null);
  const onDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" || (e.target as HTMLElement).closest("button")) return;
    start.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: ReactPointerEvent) => start.current !== null && setPull(Math.max(0, e.clientY - start.current));
  const onUp = () => {
    if (pull > DISMISS_PX) onBack();
    start.current = null;
    setPull(0);
  };

  return (
    <div
      className="anim-sheet fixed inset-0 flex flex-col bg-bg"
      style={{
        transform: pull ? `translateY(${pull}px)` : undefined,
        opacity: pull ? Math.max(0.4, 1 - pull / 400) : undefined,
        borderRadius: pull ? 24 : undefined,
        transition: start.current === null ? "transform 200ms ease-out, opacity 200ms" : undefined,
      }}
    >
      <header
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative flex flex-none touch-none items-center gap-2 border-b border-hair px-4 pb-3"
        style={{ paddingTop: safe("top", 10) }}
      >
        <span aria-hidden="true" className="absolute left-1/2 h-1 w-9 -translate-x-1/2 rounded-full bg-line" style={{ top: safe("top", 3) }} />
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-xl border border-line text-fg"
        >
          <Icon d={ICONS.back} size={18} strokeWidth={2} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-mono text-[11px] text-muted">{windowTitle(win)}</span>
          <span className="truncate text-[22px] font-extrabold leading-tight">{APPS[win.id].label}</span>
        </div>
        <button
          type="button"
          aria-label="Home screen"
          onClick={onHome}
          className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-xl text-muted"
        >
          <Icon d={ICONS.launchpad} size={18} strokeWidth={1.8} />
        </button>
      </header>
      <div className="@container relative min-h-0 flex-1" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <AppContent id={win.id} params={win.params} setParams={(p) => setParams(win.id, p)} />
      </div>
    </div>
  );
}

function Home({ onLaunch }: { onLaunch: (id: AppId, params?: Record<string, string>) => void }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const pages = useRef<HTMLDivElement>(null);
  const results = search(q, 8, { actions: false });
  const launch = (id: AppId, params: Record<string, string> = {}) => {
    setQ("");
    onLaunch(id, params);
  };
  const goTo = (i: number) => pages.current?.scrollTo({ left: i * pages.current.clientWidth, behavior: "smooth" });

  const appButton = (id: AppId) => (
    <button key={id} type="button" onClick={() => launch(id)} className="flex cursor-pointer flex-col items-center gap-1.5 text-[11.5px] text-[#E6E9F0]">
      <Tile id={id} />
      {APPS[id].label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden text-[#F2F4F8]"
      style={{ background: "radial-gradient(ellipse 90% 55% at 50% 22%, #1E2338 0%, #0E1120 55%, #06070D 100%)" }}
    >
      <PhoneWallpaper />

      <header className="relative z-10 flex flex-col gap-3 px-5" style={{ paddingTop: safe("top", 14) }}>
        <span className="font-mono text-lg font-medium text-[#7FD4E8]">
          Baibhav.<span className="text-[#A78BFA]">_</span>
        </span>
        <div className="relative">
          <label htmlFor="phone-search" className="sr-only">Search apps, projects and skills</label>
          <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <Icon d={ICONS.search} size={16} strokeWidth={2} stroke="#9AA3B5" />
          </span>
          <input
            id="phone-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search apps, projects, skills"
            autoComplete="off"
            className="h-12 w-full rounded-2xl border border-white/15 bg-[rgba(30,33,40,0.7)] pl-11 pr-4 text-base text-[#F2F4F8] outline-none backdrop-blur-[16px] placeholder:text-[#9AA3B5]"
          />
          {results.length > 0 && (
            <ul aria-label="Results" className="absolute inset-x-0 top-14 flex flex-col gap-1 rounded-2xl border border-white/15 bg-[rgba(22,25,32,0.96)] p-1.5">
              {results.map((r) => (
                <li key={r.kind + r.label}>
                  <button
                    type="button"
                    onClick={() => r.app && launch(r.app, r.params)}
                    className="flex min-h-11 w-full cursor-pointer items-center justify-between rounded-xl px-3 text-left"
                  >
                    <span>{r.label}</span>
                    <span className="font-mono text-[11px] text-[#9AA3B5]">{r.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {/* Two pages, swiped sideways: Home and the App Library. */}
      <div
        ref={pages}
        onScroll={(e) => setPage(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
        className="absolute inset-x-0 bottom-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none]"
        style={{ top: safe("top", 120) }}
      >
        <section aria-label="Home" className="flex w-full flex-none snap-start flex-col overflow-y-auto px-5 pb-40">
          <div className="pt-[clamp(24px,10vh,120px)]">
            <h1 className="text-[52px] font-extrabold leading-[0.95] tracking-[0.01em] [text-shadow:0_8px_30px_rgba(0,0,0,0.5)]">
              {PROFILE.name.split(" ").map((w) => (
                <span key={w} className="block">{w.toUpperCase()}</span>
              ))}
            </h1>
            <p className="mt-3 font-mono text-[11px] tracking-[0.18em] text-[#C9CFDA]">{PROFILE.role.toUpperCase()}</p>
          </div>
          <nav aria-label="Apps" className="grid grid-cols-4 gap-x-2 gap-y-3.5 pt-10">
            {LAUNCHPAD_ORDER.map(appButton)}
          </nav>
        </section>

        <section aria-label="App Library" className="flex w-full flex-none snap-start flex-col gap-4 overflow-y-auto px-5 pb-40 pt-6">
          <h2 className="text-2xl font-extrabold">App Library</h2>
          {LIBRARY.map((g) => (
            <div key={g.name} className="rounded-3xl border border-white/10 bg-[rgba(30,33,40,0.55)] p-4 backdrop-blur-[16px]">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#9AA3B5]">{g.name}</div>
              <div className="grid grid-cols-4 gap-x-2 gap-y-3.5">{g.apps.map(appButton)}</div>
            </div>
          ))}
        </section>
      </div>

      <div className="fixed inset-x-0 flex justify-center gap-2" style={{ bottom: safe("bottom", 104) }}>
        {["Home", "App Library"].map((label, i) => (
          <button
            key={label}
            type="button"
            aria-label={`Go to ${label}`}
            aria-current={page === i ? "page" : undefined}
            onClick={() => goTo(i)}
            className="flex h-6 w-6 cursor-pointer items-center justify-center"
          >
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: page === i ? "#F2F4F8" : "rgba(242,244,248,0.35)" }} />
          </button>
        ))}
      </div>

      <nav
        aria-label="Dock"
        className="fixed inset-x-3.5 flex justify-around rounded-[28px] border border-white/10 bg-[rgba(30,32,38,0.5)] p-2.5 backdrop-blur-[20px]"
        style={{ bottom: safe("bottom", 14) }}
      >
        {PHONE_DOCK.map((id) => (
          <button key={id} type="button" aria-label={APPS[id].label} onClick={() => launch(id)} className="cursor-pointer">
            <Tile id={id} />
          </button>
        ))}
      </nav>
    </div>
  );
}
