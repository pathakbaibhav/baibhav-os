"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ACCENTS, useSettings } from "@/lib/store";

const query = "(prefers-color-scheme: light)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function useResolvedTheme(): "dark" | "light" {
  const theme = useSettings((s) => s.theme);
  const systemLight = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
  return theme === "auto" ? (systemLight ? "light" : "dark") : theme;
}

/** Mirrors Settings onto <html> so the CSS tokens follow them. */
export function useThemeSync() {
  const resolved = useResolvedTheme();
  const { accent, motion } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolved;
    root.dataset.motion = motion ? "on" : "off";
    root.style.setProperty("--accent", ACCENTS[accent][resolved]);
  }, [resolved, accent, motion]);
  return resolved;
}

const mobileQuery = "(max-width: 767px)";
export function useIsPhone(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(mobileQuery);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(mobileQuery).matches,
    () => false,
  );
}
