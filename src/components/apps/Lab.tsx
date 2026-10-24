"use client";

// Sample data until phase 5 wires these cards to the live APIs.

const line = (ys: number[]) => ys.map((y, i) => `${Math.round((i * 300) / (ys.length - 1))},${y}`).join(" ");

const SERVICES = [
  {
    name: "ASL inference API", host: "asl.baibhav.dev", color: "#7FD4E8", label: "Sample latency trend for the ASL API",
    points: line([48, 44, 46, 40, 42, 30, 34, 28, 32, 26, 30, 24, 27, 22]),
    stats: [{ v: "2.7 ms", l: "p50 latency" }, { v: "1,569", l: "peak req/s" }, { v: "[ % ]", l: "uptime 30d" }],
  },
  {
    name: "MBTA route API", host: "api.baibhav.dev/route", color: "#F4A766", label: "Sample request trend for the route API",
    points: line([50, 52, 40, 44, 36, 42, 30, 38, 28, 34, 24, 30, 26, 20]),
    stats: [{ v: "77%", l: "cache hit rate" }, { v: "[ ms ]", l: "p50 latency" }, { v: "[ n ]", l: "alerts parsed" }],
  },
];

const DEVICES = [
  { name: "ESP32 sensor node · desk", reading: "[temp] · [humidity]", on: true },
  { name: "Raspberry Pi gateway", reading: "MQTT · [n] msgs/min", on: true },
  { name: "Drone telemetry replay", reading: "archived · 2020", on: false },
];

// The log panel stays dark in both themes, so it uses fixed colors.
const LOG = [
  { t: "12:08:14  GET /route?from=park&to=harvard  200  [ms]", c: "#C3C9D6" },
  { t: "12:08:12  POST /predict  200  2.6ms", c: "#C3C9D6" },
  { t: "12:08:11  POST /predict  200  2.9ms  (batched ×8)", c: "#C3C9D6" },
  { t: "12:08:09  alert parsed: Red Line delay → reroute", c: "#F4B786" },
  { t: "12:08:05  mqtt desk/esp32 temp=[x]", c: "#9AA3B5" },
  { t: "12:08:01  health check ok · 2 services", c: "#6EE7B7" },
];

const card = "rounded-2xl border border-line bg-card p-5";

export function Lab() {
  return (
    <div className="@container flex h-full flex-col gap-5 overflow-y-auto px-6 py-6 @3xl:px-[30px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Lab</div>
          <h1 className="mt-1.5 text-[28px] font-extrabold">Things I run, measured live.</h1>
        </div>
        <span className="rounded-lg border border-dashed border-[rgba(244,167,102,0.5)] px-2.5 py-1.5 font-mono text-[11px] text-warm">
          SAMPLE DATA · live numbers coming soon
        </span>
      </div>

      <div className="grid gap-3.5 @3xl:grid-cols-2">
        {SERVICES.map((s) => (
          <div key={s.name} className={`${card} flex flex-col gap-3.5`}>
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2.5 font-semibold">
                <span className="h-[9px] w-[9px] rounded-full bg-[#6EE7B7] shadow-[0_0_10px_#6EE7B7]" />
                {s.name}
              </span>
              <span className="truncate font-mono text-[11px] text-muted">{s.host}</span>
            </div>
            <svg role="img" aria-label={s.label} width="100%" height="70" viewBox="0 0 300 70" preserveAspectRatio="none">
              <polyline points={s.points} fill="none" stroke={s.color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <line x1="0" y1="69" x2="300" y2="69" stroke="var(--line)" />
            </svg>
            <div className="grid grid-cols-3 gap-2.5">
              {s.stats.map((m) => (
                <div key={m.l}>
                  <div className="text-xl font-extrabold">{m.v}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-muted">{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3.5 @3xl:grid-cols-2">
        <div className={`${card} flex flex-col gap-1`}>
          <div className="mb-2 font-mono text-[11px] tracking-[0.14em] text-muted">EDGE DEVICES</div>
          {DEVICES.map((d) => (
            <div key={d.name} className="flex min-h-[42px] items-center justify-between gap-3 border-t border-hair text-sm">
              <span className="inline-flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full" style={d.on ? { background: "#6EE7B7", boxShadow: "0 0 8px #6EE7B7" } : { background: "#5E6B7D" }} />
                {d.name}
              </span>
              <span className="font-mono text-xs text-fg2">{d.reading}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-line bg-[#05070B] p-5 font-mono text-xs leading-[1.8]">
          <div className="mb-2 text-[11px] tracking-[0.14em] text-[#9AA3B5]">REQUEST LOG</div>
          {LOG.map((l) => (
            <div key={l.t} className="truncate" style={{ color: l.c }}>
              {l.t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
