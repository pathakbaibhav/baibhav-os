import { describe, expect, it } from "vitest";
import {
  MENU_H,
  MIN_W,
  closeWindow,
  cycleFocus,
  emptyWM,
  fitToViewport,
  focusWindow,
  minimizeWindow,
  moveWindow,
  openWindow,
  resizeWindow,
  snapWindow,
  toggleMaximize,
} from "./windows";

const vp = { w: 1440, h: 900 };

describe("window manager", () => {
  it("opens a window focused and on top", () => {
    const s = openWindow(emptyWM, "about", vp);
    expect(s.focused).toBe("about");
    expect(s.windows.about?.z).toBe(1);
    expect(s.windows.about?.y).toBeGreaterThanOrEqual(MENU_H);
  });

  it("re-opening an existing window restores and refocuses it instead of duplicating", () => {
    let s = openWindow(emptyWM, "about", vp);
    s = openWindow(s, "terminal", vp);
    s = minimizeWindow(s, "about");
    s = openWindow(s, "about", vp, { section: "contact" });
    expect(Object.keys(s.windows)).toHaveLength(2);
    expect(s.windows.about?.minimized).toBe(false);
    expect(s.windows.about?.params.section).toBe("contact");
    expect(s.focused).toBe("about");
    expect(s.windows.about!.z).toBeGreaterThan(s.windows.terminal!.z);
  });

  it("clamps window size to small viewports", () => {
    const s = openWindow(emptyWM, "projects", { w: 800, h: 600 });
    expect(s.windows.projects!.w).toBeLessThanOrEqual(760);
    expect(s.windows.projects!.x).toBeGreaterThanOrEqual(0);
  });

  it("closing the focused window focuses the next topmost visible one", () => {
    let s = openWindow(emptyWM, "about", vp);
    s = openWindow(s, "help", vp);
    s = openWindow(s, "terminal", vp);
    s = minimizeWindow(s, "help");
    s = closeWindow(s, "terminal");
    expect(s.focused).toBe("about");
    expect(s.windows.terminal).toBeUndefined();
  });

  it("focus raises z", () => {
    let s = openWindow(emptyWM, "about", vp);
    s = openWindow(s, "help", vp);
    s = focusWindow(s, "about");
    expect(s.windows.about!.z).toBeGreaterThan(s.windows.help!.z);
  });

  it("maximize then restore returns to the original rect", () => {
    let s = openWindow(emptyWM, "about", vp);
    const before = { ...s.windows.about! };
    s = toggleMaximize(s, "about", vp);
    expect(s.windows.about).toMatchObject({ x: 0, y: MENU_H, w: vp.w, h: vp.h - MENU_H, maximized: true });
    s = toggleMaximize(s, "about", vp);
    expect(s.windows.about).toMatchObject({ x: before.x, y: before.y, w: before.w, h: before.h, maximized: false });
  });

  it("snaps to half the screen and dragging restores the original size", () => {
    let s = openWindow(emptyWM, "terminal", vp);
    const { w, h } = s.windows.terminal!;
    s = snapWindow(s, "terminal", "right", vp);
    expect(s.windows.terminal).toMatchObject({ x: 720, w: 720, h: vp.h - MENU_H });
    s = moveWindow(s, "terminal", 300, 200, vp);
    expect(s.windows.terminal).toMatchObject({ x: 300, y: 200, w, h });
  });

  it("keeps the title bar on screen and below the menu bar", () => {
    let s = openWindow(emptyWM, "about", vp);
    s = moveWindow(s, "about", -5000, -50, vp);
    expect(s.windows.about!.y).toBe(MENU_H);
    expect(s.windows.about!.x + s.windows.about!.w).toBeGreaterThanOrEqual(80);
    s = moveWindow(s, "about", 99999, 99999, vp);
    expect(s.windows.about!.x).toBeLessThanOrEqual(vp.w - 80);
    expect(s.windows.about!.y).toBeLessThanOrEqual(vp.h - 46);
  });

  it("enforces a minimum size on resize", () => {
    let s = openWindow(emptyWM, "about", vp);
    s = resizeWindow(s, "about", 10, 10, vp);
    expect(s.windows.about!.w).toBe(MIN_W);
  });

  it("cycling focus visits every visible window, skipping minimized ones", () => {
    let s = openWindow(emptyWM, "about", vp);
    s = openWindow(s, "help", vp);
    s = openWindow(s, "terminal", vp);
    s = minimizeWindow(s, "help");
    s = focusWindow(s, "terminal");
    s = cycleFocus(s);
    expect(s.focused).toBe("about");
    s = cycleFocus(s);
    expect(s.focused).toBe("terminal");
    expect(cycleFocus(openWindow(emptyWM, "about", vp)).focused).toBe("about");
  });

  it("fits windows back inside a smaller viewport", () => {
    let s = openWindow(emptyWM, "projects", vp);
    s = moveWindow(s, "projects", 1200, 700, vp);
    s = openWindow(s, "about", vp);
    s = toggleMaximize(s, "about", vp);
    const small = { w: 1000, h: 700 };
    s = fitToViewport(s, small);
    const p = s.windows.projects!;
    expect(p.x + p.w).toBeLessThanOrEqual(small.w);
    expect(p.y + p.h).toBeLessThanOrEqual(small.h);
    expect(s.windows.about).toMatchObject({ x: 0, y: MENU_H, w: small.w, h: small.h - MENU_H });
    expect(fitToViewport(s, small)).toBe(s);
  });

  it("ignores actions on windows that are not open", () => {
    expect(closeWindow(emptyWM, "about")).toBe(emptyWM);
    expect(focusWindow(emptyWM, "about")).toBe(emptyWM);
    expect(moveWindow(emptyWM, "about", 1, 1, vp)).toBe(emptyWM);
  });
});
