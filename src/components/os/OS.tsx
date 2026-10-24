"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AppContent } from "@/components/apps";
import type { AppId } from "@/lib/apps";
import { useOS, useSettings } from "@/lib/store";
import { Boot } from "./Boot";
import { DesktopIcons, Dock, MenuBar, Widgets } from "./Chrome";
import { ContextMenu } from "./ContextMenu";
import { Launchpad } from "./Launchpad";
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
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        os.setLaunchpad(!os.launchpad, true);
      } else if (e.key === "F4") {
        e.preventDefault();
        os.setLaunchpad(!os.launchpad);
      } else if (e.key === "Escape" && os.launchpad) {
        os.setLaunchpad(false);
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        const s = useSettings.getState();
        const light = document.documentElement.dataset.theme === "light";
        s.set({ theme: light ? "dark" : "light" });
      } else if (e.altKey && e.code === "KeyT") {
        e.preventDefault();
        os.open("terminal");
      } else if (e.altKey && e.code === "KeyW") {
        e.preventDefault();
        if (os.focused) os.close(os.focused);
      } else if (e.key === "?" && !isTyping(e.target)) {
        os.open("help");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

const noop = () => () => {};
function useMounted() {
  return useSyncExternalStore(noop, () => true, () => false);
}

export function OS() {
  const mounted = useMounted();
  const resolved = useThemeSync();
  const isPhone = useIsPhone();
  const showBoot = useSettings((s) => s.tour);
  const [booted, setBooted] = useState(true);

  useEffect(() => {
    try {
      setBooted(!showBoot || sessionStorage.getItem(BOOTED_KEY) === "1");
    } catch {
      setBooted(true);
    }
  }, [showBoot]);

  const enter = useCallback(() => {
    try {
      sessionStorage.setItem(BOOTED_KEY, "1");
    } catch {}
    setBooted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 bg-bg" />;
  if (!booted) return <Boot onEnter={enter} />;
  if (isPhone) return <Phone />;
  return <Desktop light={resolved === "light"} />;
}

function Desktop({ light }: { light: boolean }) {
  useHotkeys();
  const scale = useCoverScale();
  const { windows, launchpad, setParams } = useOS();
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
      <Dock />
      {menu && <ContextMenu x={menu.x} y={menu.y} onClose={closeMenu} />}
    </main>
  );
}
