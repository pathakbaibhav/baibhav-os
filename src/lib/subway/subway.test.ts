import { describe, expect, it } from "vitest";
import { applyAlerts, benchmark, findStation, plan, searchStations, stats } from "./index";
import { alertFromRaw } from "./alerts";
import { NETWORK } from "./index";

describe("subway engine (ported from Boston-Subway-Network-Visualization)", () => {
  it("loads the full network", () => {
    expect(stats.stations).toBe(125);
    expect(stats.segments).toBe(127);
  });

  it("finds stations by friendly name", () => {
    expect(findStation("park-street")).toMatchObject({ name: "Park Street" });
    expect(findStation("Harvard")).toMatchObject({ name: "Harvard" });
    expect(findStation("place-pktrm")).toMatchObject({ name: "Park Street" });
    expect("error" in findStation("nowhere")).toBe(true);
  });

  it("routes Park Street to Harvard on the Red Line with no transfers", () => {
    const r = plan("park-street", "harvard");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.route.transfers).toBe(0);
    expect(r.route.legs.map((l) => l.line)).toEqual(["Red"]);
    expect(r.lines[0]).toMatch(/^Park Street → Harvard · \d+ min · 0 transfers$/);
  });

  it("names the exact Green Line branch", () => {
    const r = plan("alewife", "riverside");
    expect(r.lines.some((l) => l.includes("Green Line D"))).toBe(true);
    expect(r.lines.some((l) => l.includes("Green Line E"))).toBe(false);
  });

  it("transfers when it has to", () => {
    const r = plan("harvard", "airport");
    expect(r.ok && r.route.transfers).toBeGreaterThanOrEqual(1);
  });

  it("explains ambiguous names", () => {
    const r = plan("street", "harvard");
    expect(r.ok).toBe(false);
    expect(r.lines[0]).toMatch(/could be/);
  });

  it("reroutes around a live closure and recovers when it ends", () => {
    const before = plan("park-street", "harvard");
    const kendall = findStation("kendall");
    if (!("id" in kendall)) throw new Error("no Kendall");
    const raw = {
      id: "test-closure",
      attributes: { effect: "STATION_CLOSURE", header: "Kendall closed", informed_entity: [{ stop: kendall.id, route: "Red" }], active_period: [] },
    };
    const alert = alertFromRaw(raw, NETWORK, new Set(NETWORK.stations.map((s) => s.id)));
    expect(applyAlerts([alert]).stations).toContain(kendall.name);
    expect(plan("kendall", "harvard").lines[0]).toMatch(/is closed right now/);
    applyAlerts([]);
    expect(plan("park-street", "harvard")).toEqual(before);
  });

  it("benchmarks all 7,750 station pairs", () => {
    const b = benchmark();
    expect(b.pairs).toBe(7750);
    expect(b.p50us).toBeGreaterThan(0);
  });

  it("searches station names", () => {
    expect(searchStations("park")).toContain("Park Street");
  });
});
