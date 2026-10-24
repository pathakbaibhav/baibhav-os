"use client";

import type { CSSProperties } from "react";
import { PROFILE } from "@/data/profile";

// Wallpaper D from the design: glass editor panes stacked in 3D, the front one
// showing the subway route API. Laid out on a fixed stage, then scaled to cover.

const PALETTES = {
  dark: {
    bg: "radial-gradient(ellipse 70% 60% at 55% 38%, #1E2338 0%, #0E1120 55%, #06070D 100%)",
    glow: "rgba(244,167,102,0.2)",
    front: "rgba(12,15,25,0.88)", frontEdge: "rgba(127,212,232,0.35)", frontGlow: "rgba(127,212,232,0.15)",
    back: "rgba(16,20,34,0.7)", backEdge: "rgba(255,255,255,0.08)", dot: "rgba(255,255,255,0.2)",
    hair: "rgba(255,255,255,0.07)", shadow: "rgba(0,0,0,0.5)",
    text: "#C9CFDA", kw: "#7FD4E8", str: "#6EE7B7", fn: "#F4B786", dec: "#A78BFA", comment: "#6B7488", file: "#9AA3B5",
    chipBg: "rgba(12,15,25,0.85)", name: "#F2F4F8", sub: "#C9CFDA",
  },
  light: {
    bg: "radial-gradient(ellipse 70% 60% at 55% 38%, #FFFFFF 0%, #E6EAF2 55%, #CFD6E2 100%)",
    glow: "rgba(28,132,170,0.16)",
    front: "rgba(255,255,255,0.86)", frontEdge: "rgba(28,132,170,0.4)", frontGlow: "rgba(28,132,170,0.12)",
    back: "rgba(255,255,255,0.55)", backEdge: "rgba(0,0,0,0.08)", dot: "rgba(0,0,0,0.15)",
    hair: "rgba(0,0,0,0.07)", shadow: "rgba(20,30,50,0.18)",
    text: "#3B4250", kw: "#1C84AA", str: "#1F8A63", fn: "#B4621F", dec: "#6D4FD8", comment: "#8A93A3", file: "#5A6272",
    chipBg: "rgba(255,255,255,0.9)", name: "#12151C", sub: "#3B4250",
  },
};

type Palette = (typeof PALETTES)["dark"];

const abs = (x: number, y: number, w: number, h: number): CSSProperties => ({
  position: "absolute", left: x, top: y, width: w, height: h,
});

const PANE_W = 580;
const PANE_H = 380;

function Dots({ colors }: { colors: string[] }) {
  return (
    <>
      {colors.map((c, i) => (
        <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
      ))}
    </>
  );
}

/** A faded pane of placeholder "code" bars, stacked behind the front pane. */
function BackPane({ x, y, z, seed, C }: { x: number; y: number; z: number; seed: number; C: Palette }) {
  const colors = [C.kw, C.dec, C.fn, C.str, C.comment];
  return (
    <div
      style={{
        ...abs(x, y, PANE_W, PANE_H), borderRadius: 14, transform: `translateZ(${z}px)`,
        background: C.back, border: `1px solid ${C.backEdge}`,
      }}
    >
      <div style={{ height: 30, display: "flex", alignItems: "center", gap: 6, padding: "0 12px", borderBottom: `1px solid ${C.hair}` }}>
        <Dots colors={[C.dot, C.dot, C.dot]} />
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 11 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            style={{
              display: "block", height: 8, borderRadius: 4, opacity: 0.45,
              marginLeft: ((seed + i) % 3) * 22, width: 80 + ((seed * 37 + i * 53) % 300),
              background: colors[(seed + i) % colors.length],
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FrontPane({ C }: { C: Palette }) {
  const k = (s: string) => <span style={{ color: C.kw }}>{s}</span>;
  const str = (s: string) => <span style={{ color: C.str }}>{s}</span>;
  return (
    <div
      style={{
        ...abs(0, 0, PANE_W, PANE_H), borderRadius: 14, background: C.front, border: `1px solid ${C.frontEdge}`,
        boxShadow: `0 0 60px ${C.frontGlow}, 0 40px 80px ${C.shadow}`,
        fontFamily: "var(--font-mono)", fontSize: 15, lineHeight: 1.85,
      }}
    >
      <div style={{ height: 34, display: "flex", alignItems: "center", gap: 7, padding: "0 14px", borderBottom: `1px solid ${C.hair}` }}>
        <Dots colors={["#F87171", "#FBBF24", "#34D399"]} />
        <span style={{ marginLeft: 12, fontSize: 12, color: C.file }}>route_api.py</span>
      </div>
      <div style={{ padding: "16px 22px", whiteSpace: "pre", color: C.text }}>
        <div><span style={{ color: C.dec }}>@app</span>.get({str('"/route"')})</div>
        <div>{k("async def")} <span style={{ color: C.fn }}>route</span>(src: {k("str")}, dst: {k("str")}):</div>
        <div>    alerts = {k("await")} mbta.live_alerts()</div>
        <div>    graph = network.without(alerts.closed)</div>
        <div>    path = dijkstra(graph, src, dst)</div>
        <div>    {k("return")} {"{"}{str('"path"')}: path, {str('"mins"')}: eta(path){"}"}</div>
        <div> </div>
        <div style={{ color: C.comment }}># 200 OK · cache hit · 77%</div>
      </div>
    </div>
  );
}

const CHIPS: [string, number, number, number, keyof Palette][] = [
  ["{ }", -90, 40, 160, "fn"],
  ["200 OK", 470, 330, 200, "str"],
  ["</>", 560, -40, 120, "dec"],
  ["async", -60, 290, 120, "kw"],
];

/** The 3D pane stack on its own 1440×900 stage. */
function Panes({ C }: { C: Palette }) {
  return (
    <div style={{ ...abs(0, 0, 1440, 900), perspective: 1800 }}>
      <div style={{ ...abs(520, 90, 560, 460), borderRadius: "50%", background: `radial-gradient(circle, ${C.glow}, transparent 65%)` }} />
      <div
        style={{
          ...abs(440, 150, PANE_W, PANE_H), transformStyle: "preserve-3d",
          transform: "rotateY(-28deg) rotateX(12deg)", animation: "pane-float 12s ease-in-out infinite",
        }}
      >
        <BackPane C={C} x={200} y={-120} z={-320} seed={3} />
        <BackPane C={C} x={100} y={-60} z={-160} seed={7} />
        <FrontPane C={C} />
        {CHIPS.map(([t, x, y, z, key]) => (
          <div
            key={t}
            style={{
              position: "absolute", left: x, top: y, transform: `translateZ(${z}px)`, padding: "8px 14px", borderRadius: 10,
              fontFamily: "var(--font-mono)", fontSize: 14, color: C[key], background: C.chipBg,
              border: `1px solid color-mix(in srgb, ${C[key]} 40%, transparent)`,
              boxShadow: `0 0 24px color-mix(in srgb, ${C[key]} 20%, transparent)`,
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Wallpaper({ light, dim, scale }: { light: boolean; dim?: boolean; scale: number }) {
  const C = light ? PALETTES.light : PALETTES.dark;
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden" style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute", left: "50%", top: "50%", width: 1440, height: 900,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transition: "filter 200ms",
          filter: dim ? `brightness(${light ? 0.85 : 0.5}) blur(3px)` : undefined,
        }}
      >
        <Panes C={C} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", color: C.name, opacity: dim ? 0.2 : 1 }}>
          <div style={{ fontWeight: 800, fontSize: 112, lineHeight: 0.95, letterSpacing: "0.03em" }}>{PROFILE.name.toUpperCase()}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.24em", marginTop: 18, color: C.sub }}>
            {PROFILE.role.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Phone home screen: the same pane stack, cropped and scaled into the top of the screen. */
export function PhoneWallpaper() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[340px] overflow-hidden">
      <div style={{ position: "absolute", left: "50%", top: -40, width: 1440, height: 900, transform: "translateX(-50%) scale(0.5)", transformOrigin: "50% 0" }}>
        <Panes C={PALETTES.dark} />
      </div>
    </div>
  );
}
