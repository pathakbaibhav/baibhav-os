// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TOUR_STEPS } from "./Tour";
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
  // jsdom doesn't lay out, scroll or draw.
  Element.prototype.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
});

// The site's own API, faked: no network in tests.
const GITHUB = {
  ok: true, login: "pathakbaibhav", url: "https://github.com/pathakbaibhav", publicRepos: 15, followers: 2, fetchedAt: new Date().toISOString(),
  repos: [{ name: "baibhav-os", description: "baibhavOS", language: "TypeScript", stars: 0, pushedAt: new Date().toISOString(), url: "u" }],
  activity: [{ repo: "baibhav-os", at: new Date().toISOString(), text: 'pushed "Phase 6"' }],
  contributions: { total: 43, days: [{ date: "2026-10-18", level: 1, count: 2 }, { date: "2026-10-19", level: 0, count: 0 }] },
};
let contactStatus = 503;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
beforeEach(() => {
  contactStatus = 503;
  vi.stubGlobal("fetch", async (url: string) => {
    if (url.startsWith("/api/github")) return json(GITHUB);
    if (url.startsWith("/api/mbta/alerts")) return json({ ok: true, alerts: [], upstreamMs: 40, fetchedAt: new Date().toISOString() });
    if (url.startsWith("/api/contact")) return json({ ok: contactStatus === 200 }, contactStatus);
    throw new Error(`unexpected fetch ${url}`);
  });
});
afterEach(() => vi.unstubAllGlobals());

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

  describe("on a phone", () => {
    let desktop: typeof window.matchMedia;
    beforeEach(() => {
      desktop = window.matchMedia;
      window.matchMedia = (query: string) => ({ ...desktop(query), matches: query.includes("max-width") });
      sessionStorage.setItem("baibhavos-booted", "1"); // skip the boot screen
    });
    afterEach(() => {
      window.matchMedia = desktop;
    });
    const tap = (name: string) => act(() => screen.getAllByRole("button", { name: new RegExp(`^${name}$`) })[0].click());

    it("every app opens full screen and Back returns home", async () => {
      render(<OS initial={null} />);
      for (const id of LAUNCHPAD_ORDER) {
        tap(APPS[id].label);
        expect(window.location.pathname).toBe(`/${id}`);
        tap("Back"); // history.back(): the browser delivers popstate a moment later
        await waitFor(() => expect(window.location.pathname).toBe("/"));
        expect(screen.getByRole("region", { name: "Home" })).toBeTruthy();
      }
      expect(errors).toEqual([]);
    });

    it("links between apps stack, and Back returns to the previous app", () => {
      render(<OS initial={null} />);
      tap("Resume");
      const row = screen.getAllByRole("button").find((b) => b.textContent?.includes("Case study →"))!;
      act(() => row.click());
      expect(window.location.pathname).toBe("/projects/asl-engine");
      expect(screen.getByText("Left-handed signers broke it first.")).toBeTruthy();
      act(() => useOS.getState().close(useOS.getState().focused!)); // what Back does once history is unwound
      expect(window.location.pathname).toBe("/resume");
      expect(screen.getByRole("tab", { name: "Read" })).toBeTruthy();
      expect(errors).toEqual([]);
    });

    it("the browser's own back gesture closes the app", () => {
      render(<OS initial={null} />);
      tap("Terminal");
      expect(window.location.pathname).toBe("/terminal");
      act(() => window.dispatchEvent(new PopStateEvent("popstate")));
      expect(useOS.getState().focused).toBeNull();
      expect(screen.getByRole("region", { name: "Home" })).toBeTruthy();
      expect(errors).toEqual([]);
    });

    it("a deep link opens its app, and Home closes everything", () => {
      render(<OS initial={{ app: "skills", params: {} }} />);
      expect(screen.getByRole("complementary", { name: "Where Python was used" })).toBeTruthy();
      tap("Home screen");
      expect(Object.keys(useOS.getState().windows)).toHaveLength(0);
      expect(window.location.pathname).toBe("/");
      expect(errors).toEqual([]);
    });

    it("the App Library groups every app", () => {
      render(<OS initial={null} />);
      const library = screen.getByRole("region", { name: "App Library" });
      for (const id of LAUNCHPAD_ORDER) expect(library.textContent).toContain(APPS[id].label);
      expect(errors).toEqual([]);
    });
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

  it("Skills links to the projects that used a skill, and on into their case studies", () => {
    render(<OS initial={{ app: "skills", params: {} }} />);
    act(() => screen.getByRole("button", { name: "SystemC 1" }).click());
    const used = screen.getByRole("complementary", { name: "Where SystemC was used" });
    act(() => used.querySelector("button")!.click());
    expect(window.location.pathname).toBe("/projects/vit-soc");
    expect(screen.getByText("Parallel patches and fixed-point maths cut latency by 30%.")).toBeTruthy();
    expect(errors).toEqual([]);
  });

  it("every project has a case study reachable from the Resume", () => {
    render(<OS initial={{ app: "resume", params: {} }} />);
    for (const slug of ["asl-engine", "subway-optimizer", "vit-soc", "cellular-drone"]) {
      act(() => useOS.getState().focus("resume"));
      const row = screen.getAllByRole("button").find((b) => b.textContent?.includes("Case study →") && b.textContent.includes(slug === "asl-engine" ? "ASL" : slug === "subway-optimizer" ? "Subway" : slug === "vit-soc" ? "Vision" : "Drone"));
      act(() => row!.click());
      expect(window.location.pathname).toBe(`/projects/${slug}`);
      expect(screen.queryByText(/Full case study coming/)).toBeNull();
    }
    expect(errors).toEqual([]);
  });

  it("Resume switches between the Read and PDF views", () => {
    render(<OS initial={{ app: "resume", params: {} }} />);
    expect(screen.getByRole("tab", { name: "Read" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("heading", { level: 1, name: "Baibhav Pathak" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Download PDF/ })[0].getAttribute("href")).toBe("/resume.pdf");
    act(() => screen.getByRole("tab", { name: "PDF" }).click());
    expect(screen.getByRole("tab", { name: "PDF" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByTitle("Resume (PDF)").getAttribute("src")).toMatch(/^\/resume\.pdf/);
    act(() => screen.getByRole("tab", { name: "Read" }).click());
    expect(screen.getByRole("tab", { name: "Read" }).getAttribute("aria-selected")).toBe("true");
    expect(errors).toEqual([]);
  });

  it("the guided tour tucks windows away, walks every step and restores them", () => {
    render(<OS initial={{ app: "about", params: {} }} />);
    act(() => useOS.getState().open("terminal"));
    act(() => commands.tour());
    expect(useOS.getState().windows.about?.minimized).toBe(true);
    const dialog = () => screen.getByRole("dialog");
    expect(dialog().textContent).toContain("Everything lives in the dock");
    for (let i = 1; i < TOUR_STEPS.length; i++) {
      act(() => screen.getByRole("button", { name: "Next" }).click());
      expect(dialog().textContent).toContain(TOUR_STEPS[i].title);
    }
    act(() => screen.getByRole("button", { name: "Done" }).click());
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(useOS.getState().windows.about?.minimized).toBe(false);
    expect(useOS.getState().focused).toBe("terminal");
    expect(errors).toEqual([]);
  });

  it("first visit offers the tour once", () => {
    vi.useFakeTimers();
    try {
      localStorage.removeItem("baibhavos-hint-seen");
      sessionStorage.setItem("baibhavos-booted", "1");
      render(<OS initial={null} />);
      act(() => vi.advanceTimersByTime(1500));
      act(() => screen.getByRole("button", { name: "Start tour" }).click());
      expect(screen.getByRole("dialog")).toBeTruthy();
      expect(localStorage.getItem("baibhavos-hint-seen")).toBe("1");
      act(() => useOS.getState().endTour());
    } finally {
      vi.useRealTimers();
    }
    expect(errors).toEqual([]);
  });

  it("status menus: Wi-Fi opens, Energy Saver turns motion off", () => {
    render(<OS initial={null} />);
    act(() => screen.getByRole("button", { name: "Wi-Fi" }).click());
    expect(screen.getByRole("menu", { name: "Wi-Fi menu" }).textContent).toContain("baibhavOS-5G");
    act(() => screen.getByRole("button", { name: "Battery" }).click());
    act(() => useSettings.getState().set({ motion: true }));
    act(() => screen.getByRole("menuitemcheckbox", { name: /Energy Saver/ }).click());
    expect(useSettings.getState().motion).toBe(false);
    act(() => screen.getByRole("switch", { name: "Interface sounds" }).click());
    expect(useSettings.getState().sound).toBe(true);
    act(() => useSettings.getState().set({ motion: true, sound: false }));
    expect(errors).toEqual([]);
  });

  it("Settings switches wallpaper", () => {
    render(<OS initial={{ app: "settings", params: { section: "wallpaper" } }} />);
    act(() => screen.getByRole("radio", { name: /^Circuit/ }).click());
    expect(useSettings.getState().wallpaper).toBe("circuit");
    act(() => screen.getByRole("radio", { name: /^Code/ }).click());
    expect(useSettings.getState().wallpaper).toBe("code");
    expect(errors).toEqual([]);
  });

  it("Spotlight runs actions and opens skills", () => {
    render(<OS initial={null} />);
    act(() => commands.spotlight());
    const box = screen.getByRole("textbox", { name: "Search baibhavOS" }) as HTMLInputElement;
    act(() => fireEvent.change(box, { target: { value: "systemc" } }));
    act(() => screen.getAllByRole("option").find((o) => o.textContent?.includes("SKILL"))!.querySelector("button")!.click());
    expect(window.location.pathname).toBe("/skills");
    act(() => commands.spotlight());
    const theme = document.documentElement.dataset.theme;
    act(() => fireEvent.change(screen.getByRole("textbox", { name: "Search baibhavOS" }), { target: { value: "dark" } }));
    act(() => screen.getAllByRole("option").find((o) => o.textContent?.includes("ACTION"))!.querySelector("button")!.click());
    expect(document.documentElement.dataset.theme).not.toBe(theme);
    expect(errors).toEqual([]);
  });

  it("GitHub shows the contribution calendar, repos and activity", async () => {
    render(<OS initial={{ app: "github", params: {} }} />);
    expect(await screen.findByRole("img", { name: "43 contributions in the last year" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Repositories" }).textContent).toContain("baibhav-os");
    expect(screen.getByRole("region", { name: "Recent activity" }).textContent).toContain("Phase 6");
    expect(errors).toEqual([]);
  });

  it("Lab shows live numbers from the API and benchmarks the route engine", async () => {
    render(<OS initial={{ app: "lab", params: {} }} />);
    await waitFor(() => expect(screen.getByRole("region", { name: "Subway closures today" }).textContent).toContain("No active subway alerts"));
    await waitFor(() => expect(screen.getByRole("region", { name: "Route engine" }).textContent).toMatch(/µs/), { timeout: 5000 });
    await waitFor(() => expect(screen.getByRole("region", { name: "Request log" }).textContent).toContain("/api/github"));
    expect(errors).toEqual([]);
  });

  it("the terminal routes a real trip", async () => {
    render(<OS initial={{ app: "terminal", params: {} }} />);
    const input = screen.getByRole("textbox", { name: /baibhav@os/ });
    act(() => fireEvent.change(input, { target: { value: "route park-street harvard" } }));
    act(() => fireEvent.keyDown(input, { key: "Enter" }));
    expect(await screen.findByText(/^Park Street → Harvard · \d+ min · 0 transfers$/)).toBeTruthy();
    expect(await screen.findByText("live: no subway closures right now")).toBeTruthy();
    expect(errors).toEqual([]);
  });

  it("Contact validates, then falls back to email and LinkedIn until the form is connected", async () => {
    render(<OS initial={{ app: "contact", params: {} }} />);
    expect(screen.getByRole("link", { name: "Message me on LinkedIn ↗" }).getAttribute("href")).toBe("https://www.linkedin.com/in/baibhavkp");
    act(() => screen.getByRole("button", { name: "Send message" }).click());
    expect(screen.getByText("Please add your name.")).toBeTruthy();
    act(() => fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ada" } }));
    act(() => fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ada@example.com" } }));
    act(() => fireEvent.change(screen.getByLabelText("Message"), { target: { value: "We'd love to talk about a backend role." } }));
    act(() => screen.getByRole("button", { name: "Send message" }).click());
    expect(await screen.findByText(/The form isn.t connected yet/)).toBeTruthy();
    contactStatus = 200;
    act(() => screen.getByRole("button", { name: "Send message" }).click());
    expect(await screen.findByText("Message sent. Thank you!")).toBeTruthy();
    expect(errors).toEqual([]);
  });

  it("Arcade starts from the keyboard and Writing lists what's coming", () => {
    render(<OS initial={{ app: "arcade", params: {} }} />);
    const board = screen.getByRole("application", { name: /Packet Snake board/ });
    act(() => fireEvent.keyDown(board, { key: " " }));
    expect(screen.queryByRole("button", { name: "Start" })).toBeNull();
    act(() => useOS.getState().open("writing"));
    expect(screen.getByRole("region", { name: "Coming soon" }).textContent).toContain("micro-batching");
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
