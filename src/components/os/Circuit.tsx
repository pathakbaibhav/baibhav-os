"use client";

import type { CSSProperties } from "react";

// Wallpaper A from the design: an isometric IoT circuit board built from CSS 3D
// boxes (a BP-01 chip, sensor modules, an antenna) on a fixed 1440×900 stage.

export const CIRCUIT = {
  dark: {
    bg: "radial-gradient(ellipse 75% 65% at 55% 40%, #1B2A40 0%, #0F1726 50%, #070A11 100%)",
    board: "#0C1420", grid: "rgba(127,212,232,0.07)", edge: "rgba(127,212,232,0.25)",
    trace: "rgba(127,212,232,0.7)", traceGlow: "rgba(127,212,232,0.45)",
    top: "linear-gradient(135deg, #242C3A, #131822)", front: "#090C12", right: "#151A24",
    sTop: "linear-gradient(135deg, #2A3242, #171C26)", sFront: "#0B0E14", sRight: "#141922",
    pin: "#5E6B7D", glow: "rgba(244,167,102,0.16)", label: "#8FA0B8",
    accent: "#7FD4E8", ring: "rgba(127,212,232,0.03)", drop: 0.5,
  },
  light: {
    bg: "radial-gradient(ellipse 75% 65% at 55% 40%, #FFFFFF 0%, #E9EDF3 55%, #D3DAE4 100%)",
    board: "#EEF2F7", grid: "rgba(30,70,110,0.08)", edge: "rgba(30,70,110,0.18)",
    trace: "rgba(28,132,170,0.75)", traceGlow: "rgba(28,132,170,0.25)",
    top: "linear-gradient(135deg, #3A414D, #222731)", front: "#1A1E26", right: "#2A303B",
    sTop: "linear-gradient(135deg, #FFFFFF, #DCE2EA)", sFront: "#B9C2CE", sRight: "#CBD3DD",
    pin: "#9AA4B2", glow: "rgba(28,132,170,0.14)", label: "#C9D3DF",
    accent: "#1C84AA", ring: "rgba(30,70,110,0.04)", drop: 0.12,
  },
};

type Palette = (typeof CIRCUIT)["dark"];

const abs = (x: number, y: number, w: number, h: number): CSSProperties => ({
  position: "absolute", left: x, top: y, width: w, height: h,
});

/** An isometric box on the board plane: front and right faces plus a lit top. */
function Box({ x, y, w, d, h, chip, label, led, C }: {
  x: number; y: number; w: number; d: number; h: number; chip?: boolean; label?: string; led?: string; C: Palette;
}) {
  const ledSize = chip ? 34 : 12;
  return (
    <div style={{ ...abs(x, y, w, d), transformStyle: "preserve-3d" }}>
      <div style={{ ...abs(0, d, w, h), transformOrigin: "0 0", transform: "rotateX(90deg)", background: chip ? C.front : C.sFront }} />
      <div style={{ ...abs(w, 0, h, d), transformOrigin: "0 0", transform: "rotateY(-90deg)", background: chip ? C.right : C.sRight }} />
      <div
        style={{
          ...abs(0, 0, w, d), transform: `translateZ(${h}px)`, background: chip ? C.top : C.sTop,
          border: `1px solid ${C.edge}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {label && (
          <span style={{ position: "absolute", left: 14, top: 12, fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: "0.14em", color: C.label }}>
            {label}
          </span>
        )}
        {led && (
          <span
            style={{
              width: ledSize, height: ledSize, borderRadius: "50%", background: led,
              boxShadow: `0 0 ${chip ? 40 : 16}px ${chip ? 12 : 4}px ${led}`,
              animation: "pulse-glow 3.2s ease-in-out infinite",
            }}
          />
        )}
      </div>
    </div>
  );
}

const TRACES: [number, number, number, number][] = [
  [390, 90, 4, 190], [90, 90, 304, 4], [450, 150, 4, 130], [450, 150, 200, 4],
  [500, 390, 200, 4], [696, 390, 4, 220], [390, 500, 4, 120], [140, 616, 254, 4],
  [100, 330, 180, 4], [100, 330, 4, 160], [500, 450, 120, 4], [616, 450, 4, 200],
];

export function CircuitStage({ light }: { light: boolean }) {
  const C = light ? CIRCUIT.light : CIRCUIT.dark;
  const pulses: [number, number, string][] = [
    [390, 180, "#F4A766"], [560, 150, C.accent], [696, 500, "#A78BFA"], [250, 616, "#6EE7B7"], [180, 330, "#F4A766"],
  ];
  const pins: CSSProperties[] = [];
  for (let i = 0; i < 6; i++) {
    const o = 300 + i * 30;
    pins.push(abs(o, 278, 10, 22), abs(o, 480, 10, 22), abs(278, o, 22, 10), abs(480, o, 22, 10));
  }
  return (
    <div style={{ ...abs(0, 0, 1440, 900), perspective: 2400 }}>
      <div style={{ ...abs(420, 120, 600, 460), borderRadius: "50%", background: `radial-gradient(circle, ${C.glow}, transparent 65%)` }} />
      <div style={{ ...abs(330, -10, 780, 780), transform: "rotateX(58deg) rotateZ(-45deg)", transformStyle: "preserve-3d" }}>
        <div
          style={{
            ...abs(0, 0, 780, 780), backgroundColor: C.board,
            backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
            backgroundSize: "30px 30px", border: `1px solid ${C.edge}`, borderRadius: 18,
            boxShadow: `0 0 0 10px ${C.ring}, 0 60px 120px rgba(0,0,0,${C.drop})`,
          }}
        />
        {TRACES.map(([x, y, w, h], i) => (
          <div key={i} style={{ ...abs(x, y, w, h), background: C.trace, boxShadow: `0 0 8px ${C.traceGlow}`, borderRadius: 2 }} />
        ))}
        {pulses.map(([x, y, col], i) => (
          <div
            key={i}
            style={{
              ...abs(x, y, 10, 10), margin: "-3px 0 0 -3px", borderRadius: "50%", background: col,
              boxShadow: `0 0 14px 4px ${col}`, animation: `pulse-glow ${2 + i * 0.4}s ease-in-out infinite`,
            }}
          />
        ))}
        {pins.map((p, i) => <div key={i} style={{ ...p, background: C.pin }} />)}
        <Box C={C} x={300} y={300} w={180} d={180} h={34} chip label="BP-01" led="#F4A766" />
        <Box C={C} x={50} y={50} w={80} d={80} h={22} led={C.accent} />
        <Box C={C} x={620} y={110} w={80} d={80} h={22} led="#A78BFA" />
        <Box C={C} x={660} y={600} w={80} d={80} h={22} led="#6EE7B7" />
        <Box C={C} x={100} y={580} w={80} d={80} h={22} led="#F4A766" />
        <Box C={C} x={70} y={470} w={60} d={60} h={120} led="#FF6B6B" />
        <Box C={C} x={590} y={640} w={60} d={60} h={14} />
      </div>
    </div>
  );
}
