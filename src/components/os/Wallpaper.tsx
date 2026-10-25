"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PROFILE } from "@/data/profile";
import { motionOK } from "@/lib/motion";
import { useSettings } from "@/lib/store";
import { CIRCUIT, CircuitStage } from "./Circuit";

// Wallpaper D from the design: glass editor panes stacked in 3D, the front one
// showing the subway route API. Laid out on a fixed stage, then scaled to cover.
// With motion on, the code types itself, the stack leans toward the pointer and
// the chips drift; with motion off it is a still image.

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
type Tone = "kw" | "str" | "fn" | "dec";

const abs = (x: number, y: number, w: number, h: number): CSSProperties => ({
  position: "absolute", left: x, top: y, width: w, height: h,
});

const PANE_W = 580;
const PANE_H = 380;

// The front pane's code as coloured segments, so it can be typed out a character at a time.
const CODE: [string, Tone?][][] = [
  [["@app", "dec"], [".get("], ['"/route"', "str"], [")"]],
  [["async def", "kw"], [" "], ["route", "fn"], ["(src: "], ["str", "kw"], [", dst: "], ["str", "kw"], ["):"]],
  [["    alerts = "], ["await", "kw"], [" mbta.live_alerts()"]],
  [["    graph = network.without(alerts.closed)"]],
  [["    path = dijkstra(graph, src, dst)"]],
  [["    "], ["return", "kw"], [" {"], ['"path"', "str"], [": path, "], ['"mins"', "str"], [": eta(path)}"]],
];
const LINE_LEN = CODE.map((line) => line.reduce((n, [t]) => n + t.length, 0));
const CODE_LEN = LINE_LEN.reduce((a, b) => a + b, 0);

// The last line cycles through what the real service does (numbers from the resume).
const STATUS = [
  "# 200 OK · cache hit · 77%",
  "# 200 OK · rerouted around a closure",
  "# 7,750 station pairs · 9× faster",
];

/** Types the code once, then loops through the status lines. Full text, no motion, when motion is off. */
function useTyping() {
  const [chars, setChars] = useState(CODE_LEN);
  const [status, setStatus] = useState({ i: 0, n: STATUS[0].length });
  useEffect(() => {
    if (!motionOK()) return;
    let c = 0;
    let si = 0;
    let sn = 0;
    let hold = 0;
    setChars(0);
    setStatus({ i: 0, n: 0 });
    const t = setInterval(() => {
      if (c < CODE_LEN) {
        c = Math.min(CODE_LEN, c + 2);
        setChars(c);
      } else if (sn < STATUS[si].length) {
        sn += 1;
        setStatus({ i: si, n: sn });
      } else if (++hold > 90) {
        hold = 0;
        sn = 0;
        si = (si + 1) % STATUS.length;
        setStatus({ i: si, n: 0 });
      }
    }, 30);
    return () => clearInterval(t);
  }, []);
  return { chars, status: STATUS[status.i].slice(0, status.n) };
}

function Cursor({ color }: { color: string }) {
  return (
    <span
      style={{ display: "inline-block", width: 9, height: 18, marginLeft: 1, verticalAlign: "-3px", background: color, animation: "blink 1s steps(1) infinite" }}
    />
  );
}

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
  const { chars, status } = useTyping();
  const typing = chars < CODE_LEN;
  let start = 0;
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
        {CODE.map((line, li) => {
          let left = chars - start;
          const hasCursor = typing && chars >= start && chars <= start + LINE_LEN[li];
          start += LINE_LEN[li];
          return (
            <div key={li}>
              {line.map(([t, tone], si) => {
                const shown = t.slice(0, Math.max(0, left));
                left -= t.length;
                return shown ? <span key={si} style={tone ? { color: C[tone] } : undefined}>{shown}</span> : null;
              })}
              {hasCursor && <Cursor color={C.kw} />}
              {" "}
            </div>
          );
        })}
        <div>{" "}</div>
        <div style={{ color: C.comment }}>
          {typing ? "" : status}
          {!typing && <Cursor color={C.comment} />}
          {" "}
        </div>
      </div>
    </div>
  );
}

const CHIPS: [string, number, number, number, Tone][] = [
  ["{ }", -90, 40, 160, "fn"],
  ["200 OK", 470, 330, 200, "str"],
  ["</>", 560, -40, 120, "dec"],
  ["async", -60, 290, 120, "kw"],
];

/** Leans the stack toward the pointer by writing --px / --py (-1…1) on the element. */
function useParallax(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame || !motionOK()) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = ref.current;
        if (!el) return;
        el.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);
  return ref;
}

/** The 3D pane stack on its own 1440×900 stage. `lite` (phones) skips the pointer tilt and the float. */
function Panes({ C, lite = false }: { C: Palette; lite?: boolean }) {
  const tilt = useParallax(!lite);
  return (
    <div style={{ ...abs(0, 0, 1440, 900), perspective: 1800 }}>
      <div
        style={{
          ...abs(520, 90, 560, 460), borderRadius: "50%", background: `radial-gradient(circle, ${C.glow}, transparent 65%)`,
          animation: "pulse-glow 8s ease-in-out infinite",
        }}
      />
      <div
        ref={tilt}
        style={{
          ...abs(440, 150, PANE_W, PANE_H), transformStyle: "preserve-3d",
          transform: "rotateY(calc(-28deg + var(--px, 0) * 6deg)) rotateX(calc(12deg - var(--py, 0) * 4deg))",
          transition: "transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
      >
        <div style={{ ...abs(0, 0, PANE_W, PANE_H), transformStyle: "preserve-3d", animation: lite ? undefined : "pane-float 12s ease-in-out infinite" }}>
          <BackPane C={C} x={200} y={-120} z={-320} seed={3} />
          <BackPane C={C} x={100} y={-60} z={-160} seed={7} />
          <FrontPane C={C} />
          {CHIPS.map(([t, x, y, z, tone], i) => (
            <div key={t} style={{ position: "absolute", left: x, top: y, transform: `translateZ(${z}px)` }}>
              <div
                style={{
                  padding: "8px 14px", borderRadius: 10, whiteSpace: "nowrap",
                  fontFamily: "var(--font-mono)", fontSize: 14, color: C[tone], background: C.chipBg,
                  border: `1px solid color-mix(in srgb, ${C[tone]} 40%, transparent)`,
                  boxShadow: `0 0 24px color-mix(in srgb, ${C[tone]} 20%, transparent)`,
                  animation: lite ? undefined : `chip-drift ${6 + i * 1.5}s ease-in-out ${-i * 1.7}s infinite`,
                }}
              >
                {t}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Wallpaper({ light, dim, scale }: { light: boolean; dim?: boolean; scale: number }) {
  const C = light ? PALETTES.light : PALETTES.dark;
  const circuit = useSettings((s) => s.wallpaper) === "circuit";
  const bg = circuit ? CIRCUIT[light ? "light" : "dark"].bg : C.bg;
  return (
    <div aria-hidden="true" className="anim-desk absolute inset-0 overflow-hidden" style={{ background: bg }}>
      <div
        style={{
          position: "absolute", left: "50%", top: "50%", width: 1440, height: 900,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transition: "filter 200ms",
          filter: dim ? `brightness(${light ? 0.85 : 0.5}) blur(3px)` : undefined,
        }}
      >
        {circuit ? <CircuitStage light={light} /> : <Panes C={C} />}
      </div>
      {/* The name sits on the real screen, not the cropped stage: always just above
          the dock, sized to fit the width and the height (112px on a 1440×900 screen). */}
      <div
        style={{
          position: "absolute", left: 16, right: 16, bottom: 108, textAlign: "center", color: C.name,
          opacity: dim ? 0.2 : 1, transition: "filter 200ms", filter: dim ? "blur(3px)" : undefined,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: "min(7.8vw, 12.4vh)", lineHeight: 0.95, letterSpacing: "0.03em" }}>{PROFILE.name.toUpperCase()}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "max(10px, min(1.25vw, 2vh))", letterSpacing: "0.24em", marginTop: "min(1.25vw, 2vh)", color: C.sub }}>
          {PROFILE.role.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

/** Phone home screen: the chosen wallpaper's stage, cropped and scaled into the top of the screen. */
export function PhoneWallpaper() {
  const circuit = useSettings((s) => s.wallpaper) === "circuit";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[340px] overflow-hidden">
      <div style={{ position: "absolute", left: "50%", top: -40, width: 1440, height: 900, transform: "translateX(-50%) scale(0.5)", transformOrigin: "50% 0" }}>
        {circuit ? <CircuitStage light={false} /> : <Panes C={PALETTES.dark} lite />}
      </div>
    </div>
  );
}
