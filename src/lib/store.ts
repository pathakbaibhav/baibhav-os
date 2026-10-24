"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppId } from "./apps";
import { SETTINGS_KEY, type Accent, type Theme } from "./theme";
import * as wm from "./windows";

const viewport = (): wm.Viewport =>
  typeof window === "undefined" ? { w: 1440, h: 900 } : { w: window.innerWidth, h: window.innerHeight };

type OSState = wm.WMState & {
  launchpad: boolean;
  spotlight: boolean;
  open: (id: AppId, params?: Record<string, string>) => void;
  close: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimize: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  snap: (id: AppId, side: "left" | "right") => void;
  move: (id: AppId, x: number, y: number) => void;
  resize: (id: AppId, w: number, h: number) => void;
  setParams: (id: AppId, params: Record<string, string>) => void;
  cycle: () => void;
  fit: () => void;
  setLaunchpad: (open: boolean, spotlight?: boolean) => void;
};

export const useOS = create<OSState>()((set) => ({
  ...wm.emptyWM,
  launchpad: false,
  spotlight: false,
  open: (id, params) => set((s) => ({ ...wm.openWindow(s, id, viewport(), params), launchpad: false })),
  close: (id) => set((s) => wm.closeWindow(s, id)),
  focus: (id) => set((s) => wm.focusWindow(s, id)),
  minimize: (id) => set((s) => wm.minimizeWindow(s, id)),
  toggleMaximize: (id) => set((s) => wm.toggleMaximize(s, id, viewport())),
  snap: (id, side) => set((s) => wm.snapWindow(s, id, side, viewport())),
  move: (id, x, y) => set((s) => wm.moveWindow(s, id, x, y, viewport())),
  resize: (id, w, h) => set((s) => wm.resizeWindow(s, id, w, h, viewport())),
  setParams: (id, params) =>
    set((s) => {
      const w = s.windows[id];
      return w ? { windows: { ...s.windows, [id]: { ...w, params: { ...w.params, ...params } } } } : {};
    }),
  cycle: () => set((s) => wm.cycleFocus(s)),
  fit: () => set((s) => wm.fitToViewport(s, viewport())),
  setLaunchpad: (open, spotlight = false) => set({ launchpad: open, spotlight: open && spotlight }),
}));

export { ACCENTS, type Accent, type Theme } from "./theme";

type SettingsState = {
  theme: Theme;
  accent: Accent;
  sound: boolean;
  motion: boolean;
  tour: boolean;
  set: (patch: Partial<Omit<SettingsState, "set">>) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      accent: "Cyan",
      sound: false,
      motion: true,
      tour: true,
      set: (patch) => set(patch),
    }),
    { name: SETTINGS_KEY },
  ),
);
