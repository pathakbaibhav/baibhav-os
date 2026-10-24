import type { AppId } from "./apps";
import { APPS } from "./apps";

// Pure window-manager logic. The zustand store in store.ts wraps these so
// they can be unit-tested without React.

export const MENU_H = 30;
export const DOCK_CLEARANCE = 90;
export const MIN_W = 360;
export const MIN_H = 240;

export type Rect = { x: number; y: number; w: number; h: number };
export type Viewport = { w: number; h: number };

export type Win = Rect & {
  id: AppId;
  z: number;
  minimized: boolean;
  maximized: boolean;
  restore?: Rect; // rect to go back to after maximize / snap
  params: Record<string, string>;
};

export type WMState = {
  windows: Partial<Record<AppId, Win>>;
  topZ: number;
  focused: AppId | null;
};

export const emptyWM: WMState = { windows: {}, topZ: 0, focused: null };

const rectOf = (w: Win): Rect => ({ x: w.x, y: w.y, w: w.w, h: w.h });

function topmost(windows: WMState["windows"], except?: AppId): AppId | null {
  let best: Win | null = null;
  for (const w of Object.values(windows)) {
    if (!w || w.minimized || w.id === except) continue;
    if (!best || w.z > best.z) best = w;
  }
  return best?.id ?? null;
}

function patch(s: WMState, id: AppId, changes: Partial<Win>): WMState {
  const w = s.windows[id];
  if (!w) return s;
  return { ...s, windows: { ...s.windows, [id]: { ...w, ...changes } } };
}

export function initialRect(id: AppId, vp: Viewport, openCount: number): Rect {
  const { w: dw, h: dh } = APPS[id].size;
  const w = Math.max(MIN_W, Math.min(dw, vp.w - 40));
  const h = Math.max(MIN_H, Math.min(dh, vp.h - MENU_H - DOCK_CLEARANCE));
  const offset = (openCount % 6) * 28;
  const x = Math.max(0, Math.round((vp.w - w) / 2) + offset - 56);
  const y = Math.max(MENU_H + 10, Math.round(MENU_H + (vp.h - MENU_H - DOCK_CLEARANCE - h) / 2) + offset - 28);
  return { x, y, w, h };
}

export function openWindow(s: WMState, id: AppId, vp: Viewport, params: Record<string, string> = {}): WMState {
  const z = s.topZ + 1;
  const existing = s.windows[id];
  if (existing) {
    return {
      ...patch(s, id, { minimized: false, z, params: { ...existing.params, ...params } }),
      topZ: z,
      focused: id,
    };
  }
  const openCount = Object.values(s.windows).filter(Boolean).length;
  const win: Win = { id, ...initialRect(id, vp, openCount), z, minimized: false, maximized: false, params };
  return { windows: { ...s.windows, [id]: win }, topZ: z, focused: id };
}

export function closeWindow(s: WMState, id: AppId): WMState {
  if (!s.windows[id]) return s;
  const windows = { ...s.windows };
  delete windows[id];
  return { ...s, windows, focused: s.focused === id ? topmost(windows) : s.focused };
}

export function focusWindow(s: WMState, id: AppId): WMState {
  const w = s.windows[id];
  if (!w || (s.focused === id && w.z === s.topZ)) return s;
  const z = s.topZ + 1;
  return { ...patch(s, id, { z, minimized: false }), topZ: z, focused: id };
}

export function minimizeWindow(s: WMState, id: AppId): WMState {
  if (!s.windows[id]) return s;
  const next = patch(s, id, { minimized: true });
  return { ...next, focused: topmost(next.windows) };
}

export function toggleMaximize(s: WMState, id: AppId, vp: Viewport): WMState {
  const w = s.windows[id];
  if (!w) return s;
  if (w.maximized) {
    return patch(s, id, { ...(w.restore ?? rectOf(w)), maximized: false, restore: undefined });
  }
  return patch(s, id, {
    x: 0,
    y: MENU_H,
    w: vp.w,
    h: vp.h - MENU_H,
    maximized: true,
    restore: w.restore ?? rectOf(w),
  });
}

export function snapWindow(s: WMState, id: AppId, side: "left" | "right", vp: Viewport): WMState {
  const w = s.windows[id];
  if (!w) return s;
  const half = Math.round(vp.w / 2);
  return patch(s, id, {
    x: side === "left" ? 0 : vp.w - half,
    y: MENU_H,
    w: half,
    h: vp.h - MENU_H,
    maximized: false,
    restore: w.restore ?? rectOf(w),
  });
}

export function moveWindow(s: WMState, id: AppId, x: number, y: number, vp: Viewport): WMState {
  const w = s.windows[id];
  if (!w) return s;
  // Keep the title bar grabbable: at least 80px stays on screen, never under the menu bar.
  const cx = Math.min(Math.max(x, 80 - w.w), vp.w - 80);
  const cy = Math.min(Math.max(y, MENU_H), vp.h - 46);
  // Dragging a snapped window restores its own size, like macOS.
  const size = w.restore && !w.maximized ? { w: w.restore.w, h: w.restore.h, restore: undefined } : {};
  return patch(s, id, { x: Math.round(cx), y: Math.round(cy), ...size });
}

/** ⌥` : bring the bottom-most visible window to the front, so repeated presses visit every window. */
export function cycleFocus(s: WMState): WMState {
  const visible = Object.values(s.windows).filter((w): w is Win => !!w && !w.minimized);
  if (visible.length < 2) return s;
  const bottom = visible.reduce((a, b) => (b.z < a.z ? b : a));
  return focusWindow(s, bottom.id);
}

/** After the browser window shrinks, pull every window back inside it. */
export function fitToViewport(s: WMState, vp: Viewport): WMState {
  let changed = false;
  const windows = { ...s.windows };
  for (const w of Object.values(s.windows)) {
    if (!w) continue;
    let next: Rect;
    if (w.maximized) {
      next = { x: 0, y: MENU_H, w: vp.w, h: vp.h - MENU_H };
    } else {
      const width = Math.max(MIN_W, Math.min(w.w, vp.w));
      const height = Math.max(MIN_H, Math.min(w.h, vp.h - MENU_H));
      next = {
        w: width,
        h: height,
        x: Math.max(0, Math.min(w.x, vp.w - width)),
        y: Math.max(MENU_H, Math.min(w.y, vp.h - height)),
      };
    }
    if (next.x !== w.x || next.y !== w.y || next.w !== w.w || next.h !== w.h) {
      windows[w.id] = { ...w, ...next };
      changed = true;
    }
  }
  return changed ? { ...s, windows } : s;
}

export function resizeWindow(s: WMState, id: AppId, width: number, height: number, vp: Viewport): WMState {
  const w = s.windows[id];
  if (!w) return s;
  return patch(s, id, {
    w: Math.round(Math.min(Math.max(width, MIN_W), vp.w - w.x)),
    h: Math.round(Math.min(Math.max(height, MIN_H), vp.h - w.y)),
    maximized: false,
    restore: undefined,
  });
}
