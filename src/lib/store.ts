"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppId } from "./apps";
import { motionOK } from "./motion";
import { play, type Sound } from "./sound";
import { SETTINGS_KEY, type Accent, type Theme, type WallpaperId } from "./theme";
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
  /** Close / minimize with the exit animation (instant when motion is reduced). */
  requestClose: (id: AppId) => void;
  requestMinimize: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  snap: (id: AppId, side: "left" | "right") => void;
  move: (id: AppId, x: number, y: number) => void;
  resize: (id: AppId, w: number, h: number) => void;
  setParams: (id: AppId, params: Record<string, string>) => void;
  cycle: () => void;
  fit: () => void;
  setLaunchpad: (open: boolean, spotlight?: boolean) => void;
  /** Guided tour: the current step, or null when it isn't running. */
  tour: number | null;
  /** Windows the tour tucked away, restored when it ends. */
  tourHidden: AppId[];
  startTour: () => void;
  setTourStep: (step: number) => void;
  endTour: () => void;
};

/** Interface sound, if the visitor turned sounds on in Settings. */
const sfx = (sound: Sound) => useSettings.getState().sound && play(sound);

export const useOS = create<OSState>()((set, get) => ({
  ...wm.emptyWM,
  launchpad: false,
  spotlight: false,
  open: (id, params) => {
    const w = get().windows[id];
    if (!w || w.minimized) sfx("open");
    set((s) => ({ ...wm.openWindow(s, id, viewport(), params), launchpad: false }));
  },
  close: (id) => set((s) => wm.closeWindow(s, id)),
  focus: (id) => set((s) => wm.focusWindow(s, id)),
  minimize: (id) => set((s) => wm.minimizeWindow(s, id)),
  requestClose: (id) => {
    if (get().windows[id]) sfx("close");
    set((s) => (motionOK() ? wm.beginExit(s, id, "close") : wm.closeWindow(s, id)));
  },
  requestMinimize: (id) => {
    if (get().windows[id]) sfx("minimize");
    set((s) => (motionOK() ? wm.beginExit(s, id, "minimize") : wm.minimizeWindow(s, id)));
  },
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
  tour: null,
  tourHidden: [],
  // The tour points at the desktop itself, so visible windows step aside for it.
  startTour: () =>
    set((s) => {
      const hidden = Object.values(s.windows)
        .filter((w): w is wm.Win => !!w && !w.minimized)
        .sort((a, b) => a.z - b.z)
        .map((w) => w.id);
      const wmState = hidden.reduce<wm.WMState>((acc, id) => wm.minimizeWindow(acc, id), s);
      return { ...wmState, launchpad: false, tour: 0, tourHidden: hidden };
    }),
  setTourStep: (step) => set({ tour: step }),
  endTour: () =>
    set((s) => ({ ...s.tourHidden.reduce<wm.WMState>((acc, id) => wm.focusWindow(acc, id), s), tour: null, tourHidden: [] })),
}));

export { ACCENTS, type Accent, type Theme, type WallpaperId } from "./theme";

type SettingsState = {
  theme: Theme;
  accent: Accent;
  wallpaper: WallpaperId;
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
      wallpaper: "code",
      sound: false,
      motion: true,
      tour: true,
      set: (patch) => set(patch),
    }),
    { name: SETTINGS_KEY },
  ),
);
