"use client";

import { useEffect, useState } from "react";
import { pathFor, titleFor, type Route } from "@/lib/routes";
import { Icon } from "@/components/Icon";
import { AppContent, windowTitle } from "@/components/apps";
import { APPS, ICONS, LAUNCHPAD_ORDER, type AppId } from "@/lib/apps";
import { search } from "@/lib/search";
import { PROFILE } from "@/data/profile";
import { PhoneWallpaper } from "./Wallpaper";

// Phone layout: home screen of app tiles; apps open full screen with a back button.

const PHONE_DOCK: AppId[] = ["projects", "terminal", "resume", "contact"];

function Tile({ id, size = 58 }: { id: AppId; size?: number }) {
  const a = APPS[id];
  return (
    <span
      className="flex items-center justify-center border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.27), background: `linear-gradient(160deg, ${a.color} 0%, ${a.color}AA 55%, #12151C 140%)` }}
    >
      <Icon d={a.icon} size={26} stroke="#FFFFFF" />
    </span>
  );
}

export function Phone({ initial }: { initial: Route | null }) {
  const [app, setApp] = useState<{ id: AppId; params: Record<string, string> } | null>(
    initial ? { id: initial.app, params: initial.params } : null,
  );
  const path = pathFor(app?.id ?? null, app?.params);
  const title = titleFor(app ? { app: app.id, params: app.params } : null);
  useEffect(() => {
    if (window.location.pathname !== path) window.history.replaceState(window.history.state, "", path);
    document.title = title;
  }, [path, title]);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const results = search(q);
  const launch = (id: AppId, params: Record<string, string> = {}) => {
    setApp({ id, params });
    setSearching(false);
    setQ("");
  };

  if (app) {
    return (
      <div className="fixed inset-0 flex flex-col bg-bg">
        <header className="flex flex-none items-center gap-2 border-b border-hair px-4 pb-3 pt-4">
          <button
            type="button"
            aria-label="Back to home screen"
            onClick={() => setApp(null)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-line text-fg"
          >
            <Icon d={ICONS.back} size={18} strokeWidth={2} />
          </button>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-mono text-[11px] text-muted">{windowTitle(app)}</span>
            <span className="text-[22px] font-extrabold leading-tight">{APPS[app.id].label}</span>
          </div>
        </header>
        <div className="relative min-h-0 flex-1">
          <AppContent
            id={app.id}
            params={app.params}
            setParams={(p) => setApp((a) => (a ? { ...a, params: { ...a.params, ...p } } : a))}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{ background: "radial-gradient(ellipse 90% 55% at 50% 22%, #1E2338 0%, #0E1120 55%, #06070D 100%)", color: "#F2F4F8" }}
    >
      <PhoneWallpaper />
      <header className="relative flex items-center justify-between px-5 pt-[18px]">
        <span className="font-mono text-lg font-medium text-[#7FD4E8]">
          Baibhav.<span className="text-[#A78BFA]">_</span>
        </span>
        <button
          type="button"
          aria-label="Search"
          aria-expanded={searching}
          onClick={() => setSearching((s) => !s)}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.08]"
        >
          <Icon d={ICONS.search} size={18} strokeWidth={2} stroke="#E6E9F0" />
        </button>
      </header>

      {searching && (
        <div className="relative mx-5 mt-4 flex flex-col gap-2">
          <label htmlFor="phone-search" className="sr-only">Search apps and projects</label>
          <input
            id="phone-search"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search apps, projects…"
            className="h-12 rounded-xl border border-white/15 bg-[rgba(30,33,40,0.85)] px-4 text-base text-[#F2F4F8] outline-none placeholder:text-[#9AA3B5]"
          />
          {results.map((r) => (
            <button
              key={r.kind + r.label}
              type="button"
              onClick={() => launch(r.app, r.params)}
              className="flex min-h-11 cursor-pointer items-center justify-between rounded-xl bg-[rgba(30,33,40,0.85)] px-4 text-left"
            >
              <span>{r.label}</span>
              <span className="font-mono text-[11px] text-[#9AA3B5]">{r.kind}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative px-5 pt-[clamp(48px,18vh,200px)]">
        <h1 className="text-[52px] font-extrabold leading-[0.95] tracking-[0.01em] [text-shadow:0_8px_30px_rgba(0,0,0,0.5)]">
          BAIBHAV
          <br />
          PATHAK
        </h1>
        <p className="mt-3 font-mono text-[11px] tracking-[0.18em] text-[#C9CFDA]">{PROFILE.role.toUpperCase()}</p>
      </div>

      <nav aria-label="Apps" className="relative grid grid-cols-4 gap-x-2 gap-y-3.5 px-[18px] pb-32 pt-10">
        {LAUNCHPAD_ORDER.map((id) => (
          <button key={id} type="button" onClick={() => launch(id)} className="flex cursor-pointer flex-col items-center gap-1.5 text-[11.5px] text-[#E6E9F0]">
            <Tile id={id} />
            {APPS[id].label}
          </button>
        ))}
      </nav>

      <nav
        aria-label="Dock"
        className="fixed inset-x-3.5 bottom-3.5 flex justify-around rounded-[28px] border border-white/10 bg-[rgba(30,32,38,0.5)] p-2.5 backdrop-blur-[20px]"
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
