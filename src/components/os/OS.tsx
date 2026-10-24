"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { AppContent } from "@/components/apps";
import type { AppId } from "@/lib/apps";
import { commands } from "@/lib/commands";
import { pathFor, titleFor, type Route } from "@/lib/routes";
import { useOS, useSettings } from "@/lib/store";
import { Boot } from "./Boot";
import { DesktopIcons, Dock, MenuBar, Widgets } from "./Chrome";
import { ContextMenu } from "./ContextMenu";
import { Launchpad } from "./Launchpad";
import { FirstVisitHint, Tour } from "./Tour";
import { Phone } from "./Phone";
import { Wallpaper } from "./Wallpaper";
import { Window } from "./Window";
import { useIsPhone, useThemeSync } from "./useTheme";

const BOOTED_KEY = "baibhavos-booted";

function useCoverScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => setScale(Math.max(window.innerWidth / 1440, window.innerHeight / 900));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

function useHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const os = useOS.getState();
      const mod = e.metaKey || e.ctrlKey;
      let run: (() => void) | null = null;
      if (mod && e.key.toLowerCase() === "k") run = () => os.setLaunchpad(!os.launchpad, true);
      else if (e.key === "F4") run = () => os.setLaunchpad(!os.launchpad);
      else if (e.key === "Escape" && os.launchpad) run = () => os.setLaunchpad(false);
      else if (mod && e.shiftKey && e.key.toLowerCase() === "l") run = commands.toggleTheme;
      else if (e.ctrlKey && e.altKey && e.key === "ArrowLeft") run = commands.snapLeft;
      else if (e.ctrlKey && e.altKey && e.key === "ArrowRight") run = commands.snapRight;
      else if (e.altKey && e.code === "Backquote") run = commands.cycle;
      else if (e.altKey && e.code === "KeyT") run = commands.newTerminal;
      else if (e.altKey && e.code === "KeyW") run = commands.closeWindow;
      else if (e.key === "?" && !isTyping(e.target)) run = commands.help;
      if (!run) return;
      e.preventDefault();
      run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

const noop = () => () => {};
function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Keep the address bar and tab title on the focused window, so any window can be shared as a link. */
function useUrlSync() {
  // Select the window object itself (a stable store reference) and derive the route
  // outside the selector: returning a fresh object from a selector loops forever.
  const win = useOS((s) => (s.focused ? s.windows[s.focused] : undefined));
  const route: Route | null = win && !win.minimized ? { app: win.id, params: win.params } : null;
  const path = pathFor(route?.app ?? null, route?.params);
  const title = titleFor(route);
  useEffect(() => {
    if (window.location.pathname !== path) window.history.replaceState(window.history.state, "", path);
    document.title = title;
  }, [path, title]);
}

/**
 * The whole portfolio. `initial` is the app a deep link asks for (/about,
 * /projects/<slug>); `children` is the server-rendered text version of the
 * page, shown to crawlers and screen readers until the OS mounts.
 */
export function OS({ initial, children }: { initial: Route | null; children?: ReactNode }) {
  const mounted = useMounted();
  const resolved = useThemeSync();
  const isPhone = useIsPhone();
  const showBoot = useSettings((s) => s.tour);
  const [booted, setBooted] = useState(true);

  useEffect(() => {
    // A deep link goes straight to its window: no boot screen in the way.
    if (initial) {
      useOS.getState().open(initial.app, initial.params);
      setBooted(true);
      return;
    }
    try {
      setBooted(!showBoot || sessionStorage.getItem(BOOTED_KEY) === "1");
    } catch {
      setBooted(true);
    }
    // Only on first load: later Settings changes must not re-run the deep link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enter = useCallback(() => {
    try {
      sessionStorage.setItem(BOOTED_KEY, "1");
    } catch {}
    setBooted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-bg">{children}</div>;
  if (!booted) return <Boot onEnter={enter} />;
  if (isPhone) return <Phone />;
  return <Desktop light={resolved === "light"} hint={!initial} />;
}

function Desktop({ light, hint }: { light: boolean; hint: boolean }) {
  useHotkeys();
  useUrlSync();
  const scale = useCoverScale();
  useEffect(() => {
    const fit = () => useOS.getState().fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  const { windows, launchpad, setParams, tour } = useOS();
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const closeMenu = useCallback(() => setMenu(null), []);
  const anyOpen = Object.values(windows).some((w) => w && !w.minimized);

  return (
    <main
      className="fixed inset-0 select-none overflow-hidden"
      onContextMenu={(e) => {
        if ((e.target as HTMLElement).closest("section, header, nav, aside, input, textarea, a")) return;
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <h1 className="sr-only">baibhavOS, the portfolio of Baibhav Pathak</h1>
      <Wallpaper light={light} dim={anyOpen || launchpad} scale={scale} />
      <MenuBar />
      <DesktopIcons />
      {!anyOpen && <Widgets />}
      <div className="select-text">
        {Object.values(windows).map(
          (w) =>
            w && (
              <Window key={w.id} win={w}>
                <AppContent id={w.id} params={w.params} setParams={(p) => setParams(w.id as AppId, p)} />
              </Window>
            ),
        )}
      </div>
      {launchpad && <Launchpad />}
      {hint && tour === null && <FirstVisitHint />}
      {tour !== null && <Tour step={tour} />}
      <Dock />
      {menu && <ContextMenu x={menu.x} y={menu.y} onClose={closeMenu} />}
    </main>
  );
}
