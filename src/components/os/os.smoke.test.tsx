// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { LAUNCHPAD_ORDER, APPS } from "@/lib/apps";
import { useOS, useSettings } from "@/lib/store";
import { emptyWM } from "@/lib/windows";
import { commands } from "@/lib/commands";
import { OS } from "./OS";

// Renders the real desktop in jsdom and drives it the way a visitor would.
// Any React warning (e.g. an unstable store selector looping) fails the test.

beforeAll(() => {
  // jsdom has no matchMedia; report a desktop-sized screen that allows motion.
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, onchange: null, addListener() {}, removeListener() {}, dispatchEvent: () => false }) as MediaQueryList;
  // jsdom doesn't lay out or scroll.
  Element.prototype.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
});

let errors: unknown[][];
beforeEach(() => {
  errors = [];
  vi.spyOn(console, "error").mockImplementation((...args) => errors.push(args));
  useOS.setState({ ...emptyWM, launchpad: false, spotlight: false });
  window.history.replaceState(null, "", "/");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("desktop smoke test", () => {
  it("boots a deep link and opens every app without React errors", () => {
    render(<OS initial={{ app: "settings", params: {} }} />);
    expect(screen.getByRole("region", { name: "Settings window" })).toBeTruthy();
    expect(window.location.pathname).toBe("/settings");

    for (const id of LAUNCHPAD_ORDER) {
      act(() => useOS.getState().open(id));
      expect(screen.getByRole("region", { name: `${APPS[id].label} window` })).toBeTruthy();
      expect(window.location.pathname).toBe(`/${id}`);
    }
    expect(errors).toEqual([]);
  });

  it("closing the last window returns the URL to the desktop", () => {
    render(<OS initial={{ app: "about", params: {} }} />);
    act(() => useOS.getState().close("about"));
    expect(window.location.pathname).toBe("/");
    expect(document.title).toBe("Baibhav Pathak · baibhavOS");
    expect(errors).toEqual([]);
  });

  it("a case-study deep link shows the case study", () => {
    render(<OS initial={{ app: "projects", params: { sel: "01", view: "case" } }} />);
    expect(screen.getByText("Left-handed signers broke it first.")).toBeTruthy();
    expect(window.location.pathname).toBe("/projects/asl-engine");
    expect(errors).toEqual([]);
  });

  it("on a phone, every app opens full screen and Back returns home", () => {
    const desktop = window.matchMedia;
    window.matchMedia = (query: string) => ({ ...desktop(query), matches: query.includes("max-width") });
    sessionStorage.setItem("baibhavos-booted", "1"); // skip the boot screen
    try {
      render(<OS initial={null} />);
      for (const id of LAUNCHPAD_ORDER) {
        act(() => screen.getAllByRole("button", { name: new RegExp(`^${APPS[id].label}$`) })[0].click());
        expect(window.location.pathname).toBe(`/${id}`);
        act(() => screen.getByRole("button", { name: "Back to home screen" }).click());
        expect(window.location.pathname).toBe("/");
      }
      expect(errors).toEqual([]);
    } finally {
      window.matchMedia = desktop;
    }
  });

  it("turning motion off in Settings makes closing instant", () => {
    render(<OS initial={{ app: "settings", params: {} }} />);
    act(() => useOS.getState().open("terminal"));
    act(() => useOS.getState().focus("settings"));
    const motion = screen.getByRole("switch", { name: "Motion and 3D effects" });
    if (motion.getAttribute("aria-checked") === "true") act(() => motion.click());
    expect(document.documentElement.dataset.motion).toBe("off");
    act(() => commands.closeWindow());
    expect(useOS.getState().windows.settings).toBeUndefined();
    act(() => useSettings.getState().set({ motion: true }));
    act(() => commands.closeWindow());
    expect(useOS.getState().windows.terminal?.exiting).toBe("close");
    expect(errors).toEqual([]);
  });

  it("menu commands run without errors", () => {
    render(<OS initial={{ app: "about", params: {} }} />);
    act(() => {
      useOS.getState().open("terminal");
      commands.cycle();
      commands.snapLeft();
      commands.maximize();
      commands.minimize();
      commands.toggleTheme();
      commands.launchpad();
    });
    expect(screen.getByRole("navigation", { name: "All apps" })).toBeTruthy();
    expect(errors).toEqual([]);
  });
});
