// TypeScript port of web/js/alerts.js from pathakbaibhav/Boston-Subway-Network-Visualization
// (itself a port of transit/closures.py): turns live MBTA V3 alerts into graph closures.
//
// - STATION_CLOSURE / STOP_CLOSURE: trains skip the station.
// - SUSPENSION / SHUTTLE / NO_SERVICE / SHUTDOWN: a segment closes when both of its stations are
//   named by the alert and it carries one of the alert's routes (closures are per line).

import { segmentKey, type Network } from "./graph";

export const STATION_EFFECTS = new Set(["STATION_CLOSURE", "STOP_CLOSURE"]);
export const SEGMENT_EFFECTS = new Set(["SUSPENSION", "SHUTTLE", "NO_SERVICE", "SHUTDOWN"]);
/** Light rail (0) and heavy rail (1): the subway. */
export const MBTA_ALERTS_URL = "https://api-v3.mbta.com/alerts?filter%5Broute_type%5D=0,1";

export type Alert = {
  id: string;
  effect: string;
  header: string;
  severity: number | null;
  lifecycle: string | null;
  routes: string[];
  stations: string[];
  active_periods: { start: string | null; end: string | null }[];
};

/** Timestamps without an offset are treated as UTC, matching transit/closures.py. */
export function parseTime(value: string | null): Date | null {
  if (!value) return null;
  return new Date(/([+-]\d\d:\d\d|Z)$/.test(value) ? value : `${value}Z`);
}

export function isActive(alert: Alert, at: Date): boolean {
  if (alert.active_periods.length) {
    return alert.active_periods.some((p) => {
      const start = parseTime(p.start);
      const end = parseTime(p.end);
      return (!start || start <= at) && (!end || at < end);
    });
  }
  return alert.lifecycle !== "UPCOMING";
}

export function closuresFromAlerts(alerts: Alert[], network: Network, at: Date) {
  const stations = new Map<string, string[]>();
  const segments = new Map<string, string[]>();
  const add = (map: Map<string, string[]>, key: string, id: string) => (map.get(key) ?? map.set(key, []).get(key)!).push(id);

  for (const alert of alerts) {
    if (!isActive(alert, at)) continue;
    if (STATION_EFFECTS.has(alert.effect)) {
      for (const station of alert.stations) add(stations, station, alert.id);
    } else if (SEGMENT_EFFECTS.has(alert.effect)) {
      const named = new Set(alert.stations);
      const routes = new Set(alert.routes);
      for (const seg of network.segments) {
        const onRoute = routes.size === 0 || seg.routes.some((r) => routes.has(r));
        if (named.has(seg.from_station) && named.has(seg.to_station) && onRoute) {
          add(segments, segmentKey(seg.line, seg.from_station, seg.to_station), alert.id);
        }
      }
    }
  }
  return { stations, segments };
}

type RawAlert = {
  id: string;
  attributes: {
    effect: string;
    header: string;
    severity?: number | null;
    lifecycle?: string | null;
    informed_entity?: { route?: string; stop?: string }[];
    active_period?: { start?: string | null; end?: string | null }[];
  };
};

/** Normalise a raw MBTA V3 alert (a JSON:API resource) into the Alert shape. */
export function alertFromRaw(raw: RawAlert, network: Network, stationIds: Set<string>): Alert {
  const a = raw.attributes;
  const routes: string[] = [];
  const stations: string[] = [];
  for (const entity of a.informed_entity ?? []) {
    if (entity.route && !routes.includes(entity.route)) routes.push(entity.route);
    if (entity.stop) {
      const station = network.platform_to_station[entity.stop] ?? entity.stop;
      if (stationIds.has(station) && !stations.includes(station)) stations.push(station);
    }
  }
  return {
    id: raw.id,
    effect: a.effect,
    header: a.header,
    severity: a.severity ?? null,
    lifecycle: a.lifecycle ?? null,
    routes,
    stations,
    active_periods: (a.active_period ?? []).map((p) => ({ start: p.start ?? null, end: p.end ?? null })),
  };
}
