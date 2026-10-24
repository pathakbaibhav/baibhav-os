"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { windowTitle } from "@/components/apps";
import { APPS } from "@/lib/apps";
import { useOS } from "@/lib/store";
import type { Win } from "@/lib/windows";

const SNAP_EDGE = 6;

export function Window({ win, children }: { win: Win; children: ReactNode }) {
  const { focused, focus, close, minimize, toggleMaximize, move, snap, resize } = useOS();
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const root = useRef<HTMLElement>(null);
  const isFocused = focused === win.id;
  const app = APPS[win.id];

  // Move keyboard focus into a window when it opens, so Tab continues inside the app.
  useEffect(() => {
    root.current?.focus({ preventScroll: true });
  }, []);

  const onTitlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    focus(win.id);
    if (e.button !== 0 || win.maximized || (e.target as HTMLElement).closest("button")) return;
    drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onTitlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    move(win.id, e.clientX - drag.current.dx, e.clientY - drag.current.dy);
  };
  const onTitlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    if (e.clientX <= SNAP_EDGE) snap(win.id, "left");
    else if (e.clientX >= window.innerWidth - SNAP_EDGE) snap(win.id, "right");
  };

  const onResizePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    focus(win.id);
    const start = { x: e.clientX, y: e.clientY, w: win.w, h: win.h };
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const onMove = (ev: PointerEvent) => resize(win.id, start.w + ev.clientX - start.x, start.h + ev.clientY - start.y);
    const onUp = () => {
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
  };

  return (
    <section
      ref={root}
      tabIndex={-1}
      aria-label={`${app.label} window`}
      onPointerDown={() => focus(win.id)}
      className="anim-win absolute flex flex-col overflow-hidden outline-none border border-line bg-window backdrop-blur-[28px] backdrop-saturate-[140%]"
      style={{
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: 10 + win.z,
        display: win.minimized ? "none" : undefined,
        borderRadius: win.maximized ? 0 : 16,
        boxShadow: `0 40px 120px var(--shadow)${isFocused ? "" : ", 0 0 0 0 transparent"}`,
        opacity: isFocused ? 1 : 0.96,
      }}
    >
      <div
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
        onDoubleClick={(e) => !(e.target as HTMLElement).closest("button") && toggleMaximize(win.id)}
        className="flex h-[46px] flex-none touch-none select-none items-center gap-2 border-b border-hair px-4"
        style={{ cursor: win.maximized ? "default" : "grab" }}
      >
        <div className="group flex gap-2">
          <TrafficLight color="#F87171" label={`Close ${app.label}`} glyph="M8 8l8 8M16 8l-8 8" onClick={() => close(win.id)} />
          <TrafficLight color="#FBBF24" label={`Minimize ${app.label}`} glyph="M7 12h10" onClick={() => minimize(win.id)} />
          <TrafficLight
            color="#34D399"
            label={win.maximized ? `Restore ${app.label}` : `Maximize ${app.label}`}
            glyph="M8 8h8v8H8z"
            onClick={() => toggleMaximize(win.id)}
          />
        </div>
        <span className="mr-[52px] flex-1 truncate text-center font-mono text-[13px] text-muted">
          {windowTitle(win)}
        </span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
      {!win.maximized && (
        <div
          aria-hidden="true"
          onPointerDown={onResizePointerDown}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize touch-none"
        />
      )}
    </section>
  );
}

function TrafficLight({ color, label, glyph, onClick }: { color: string; label: string; glyph: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="relative h-3 w-3 cursor-pointer rounded-full before:absolute before:-inset-2 before:content-['']"
      style={{ background: color }}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute inset-0 opacity-0 group-hover:opacity-100" stroke="rgba(0,0,0,0.6)" strokeWidth="3" fill="none">
        <path d={glyph} />
      </svg>
    </button>
  );
}
