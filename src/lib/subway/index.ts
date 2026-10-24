import data from "@/data/subway-network.json";
import { closuresFromAlerts, type Alert } from "./alerts";
import { RoutePlanner, StationClosedError, TransitGraph, type Network, type Route } from "./graph";

// The subway engine as baibhavOS uses it: one graph and planner per tab, station
// lookup by friendly name, live closures, and a benchmark for the Lab. This module
// (and its 64 KB network) is loaded on demand, the first time something routes.

export const NETWORK = data as Network;
const NAMES = new Map(NETWORK.stations.map((s) => [s.id, s.name]));
// Keyed by route id ("Green-D"), not group: the four Green branches share the group "Green".
const ROUTE_NAMES = new Map(NETWORK.lines.map((l) => [l.id, l.name]));
export const stationName = (id: string) => NAMES.get(id) ?? id;

const graph = new TransitGraph(NETWORK);
const planner = new RoutePlanner(graph);


const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export type Lookup = { id: string; name: string } | { error: string };

/** "park-street", "Park St", "harvard", "place-pktrm" → a station; ambiguous or unknown → an error line. */
export function findStation(query: string): Lookup {
  const q = norm(query);
  if (!q) return { error: "which station?" };
  const all = NETWORK.stations;
  const byId = all.find((s) => s.id === query);
  const hit =
    byId ??
    all.find((s) => norm(s.name) === q) ??
    (() => {
      const starts = all.filter((s) => norm(s.name).startsWith(q));
      if (starts.length === 1) return starts[0];
      const contains = starts.length ? starts : all.filter((s) => norm(s.name).includes(q));
      if (contains.length === 1) return contains[0];
      if (contains.length > 1) throw new Ambiguous(query, contains.map((s) => s.name));
      return undefined;
    })();
  return hit ? { id: hit.id, name: hit.name } : { error: `no station matches "${query}" (try: stations ${query.slice(0, 3)})` };
}

class Ambiguous extends Error {
  constructor(readonly query: string, readonly options: string[]) {
    super(`"${query}" could be ${options.slice(0, 4).join(", ")}${options.length > 4 ? ", …" : ""}`);
  }
}

export type Planned = { ok: true; route: Route; lines: string[] } | { ok: false; lines: string[] };

/** Route between two stations given by name, formatted for the terminal. */
export function plan(from: string, to: string): Planned {
  let a: Lookup;
  let b: Lookup;
  try {
    a = findStation(from);
    b = findStation(to);
  } catch (e) {
    return { ok: false, lines: [(e as Error).message] };
  }
  if ("error" in a) return { ok: false, lines: [a.error] };
  if ("error" in b) return { ok: false, lines: [b.error] };
  let route: Route | null;
  try {
    route = planner.route(a.id, b.id);
  } catch (e) {
    if (e instanceof StationClosedError) return { ok: false, lines: [`${stationName(e.station)} is closed right now (live MBTA alert)`] };
    throw e;
  }
  if (!route) return { ok: false, lines: [`no route from ${a.name} to ${b.name} with today's closures`] };
  const head = `${a.name} → ${b.name} · ${Math.round(route.minutes)} min · ${route.transfers} transfer${route.transfers === 1 ? "" : "s"}`;
  const legs = route.legs.map((leg) => {
    const stops = leg.stations.length - 1;
    const line = (ROUTE_NAMES.get(leg.route) ?? leg.route).padEnd(14);
    return `  ${line} ${stationName(leg.stations[0])} → ${stationName(leg.stations[stops])}  (${stops} stop${stops === 1 ? "" : "s"}, ${Math.round(leg.minutes)} min)`;
  });
  return { ok: true, route, lines: [head, ...legs] };
}

/** Apply live alerts as closures; returns what was closed. */
export function applyAlerts(alerts: Alert[], at = new Date()) {
  const c = closuresFromAlerts(alerts, NETWORK, at);
  graph.setClosures(c.stations.keys(), c.segments.keys());
  return { stations: [...c.stations.keys()].map(stationName), segments: c.segments.size };
}

/** Time every one of the 7,750 station pairs on this device (fresh searches, no cache). */
export function benchmark() {
  const ids = NETWORK.stations.map((s) => s.id);
  const times: number[] = [];
  const t0 = performance.now();
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const t = performance.now();
      try {
        graph.findPath(ids[i], ids[j]);
      } catch {
        // a closed station can't be routed to; it still counts as a search
      }
      times.push(performance.now() - t);
    }
  }
  const total = performance.now() - t0;
  times.sort((x, y) => x - y);
  return { pairs: times.length, totalMs: total, p50us: times[Math.floor(times.length / 2)] * 1000 };
}

export const stats = { stations: NETWORK.stations.length, segments: NETWORK.segments.length, edges: graph.edgeCount, serviceDate: NETWORK.service_date };

/** Stations whose name contains the query, for the terminal's `stations` command. */
export function searchStations(query: string): string[] {
  const q = norm(query);
  return NETWORK.stations.filter((s) => norm(s.name).includes(q)).map((s) => s.name).sort();
}
