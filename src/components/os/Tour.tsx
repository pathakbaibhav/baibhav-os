"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { commands } from "@/lib/commands";
import { useOS } from "@/lib/store";
import { btnGhost, btnSolid } from "@/components/apps/ui";

// The guided tour: dims the desktop, rings one part of it at a time and explains
// it. Steps point at elements tagged data-tour="…"; if a target isn't on screen
// (narrow window, hidden menu) the caption simply sits in the middle.

export const TOUR_STEPS: { target?: string; title: string; text: string }[] = [
  { target: "dock", title: "Everything lives in the dock", text: "Click an app to open it as a window. A dot underneath means it's running; click it again to minimise it." },
  { target: "desktop", title: "The same apps are on the desktop", text: "A single click opens them. Drag windows by their title bar, push one to the screen edge to snap it, double-click to maximise." },
  { target: "menus", title: "Menus work like a Mac's", text: "File, View, Window and Help: switch light or dark, snap windows, or jump to any open window." },
  { target: "search", title: "Search everything with ⌘K", text: "Apps, projects, skills and actions such as \"dark mode\" or \"new terminal\". Try typing \"asl\"." },
  { target: "tray", title: "Status menus", text: "Wi-Fi, battery (try Energy Saver) and interface sounds." },
  { title: "That's the tour", text: "Right-click the desktop for quick actions, and press ? any time for Help. In a hurry? The recruiter tour opens About, Projects and the Resume for you." },
];

type Box = { x: number; y: number; w: number; h: number };
const PAD = 8;
const CARD_W = 360;

function useTargetBox(target: string | undefined): Box | null {
  const [box, setBox] = useState<Box | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = target ? document.querySelector<HTMLElement>(`[data-tour="${target}"]`) : null;
      const r = el?.getBoundingClientRect();
      setBox(r && r.width > 0 && r.height > 0 ? { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 } : null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [target]);
  return box;
}

export function Tour({ step }: { step: number }) {
  const { setTourStep, endTour } = useOS();
  const s = TOUR_STEPS[step];
  const last = step === TOUR_STEPS.length - 1;
  const box = useTargetBox(s.target);
  const next = useRef<HTMLButtonElement>(null);

  useEffect(() => next.current?.focus(), [step]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") endTour();
      else if (e.key === "ArrowRight" && last) endTour();
      else if (e.key === "ArrowRight") setTourStep(step + 1);
      else if (e.key === "ArrowLeft" && step > 0) setTourStep(step - 1);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [step, last, setTourStep, endTour]);

  // Caption below the target if it's in the top half of the screen, else above; kept on screen.
  const vw = typeof window === "undefined" ? 1440 : window.innerWidth;
  const vh = typeof window === "undefined" ? 900 : window.innerHeight;
  const card = box
    ? {
        left: Math.min(Math.max(16, box.x + box.w / 2 - CARD_W / 2), vw - CARD_W - 16),
        ...(box.y + box.h / 2 < vh / 2 ? { top: box.y + box.h + 14 } : { bottom: vh - box.y + 14 }),
      }
    : { left: Math.max(16, vw / 2 - CARD_W / 2), top: Math.max(60, vh / 2 - 120) };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="tour-title" className="fixed inset-0 z-[9600]">
      {box ? (
        <div
          aria-hidden="true"
          className="absolute rounded-2xl transition-all duration-300 ease-out"
          style={{
            left: box.x, top: box.y, width: box.w, height: box.h,
            boxShadow: "0 0 0 2px var(--accent), 0 0 0 9999px rgba(3,5,10,0.62)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-[rgba(3,5,10,0.62)]" />
      )}
      <div
        className="anim-fade absolute flex flex-col gap-3 rounded-2xl border border-line bg-popover p-5 shadow-[0_20px_60px_var(--shadow)] backdrop-blur-[24px]"
        style={{ width: CARD_W, maxWidth: "calc(100vw - 32px)", ...card }}
      >
        <div className="font-mono text-[11px] text-muted">TOUR · {step + 1} OF {TOUR_STEPS.length}</div>
        <h2 id="tour-title" className="text-lg font-bold">{s.title}</h2>
        <p className="text-sm leading-relaxed text-fg2">{s.text}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button ref={next} type="button" onClick={() => (last ? endTour() : setTourStep(step + 1))} className={`${btnSolid} cursor-pointer`}>
            {last ? "Done" : "Next"}
          </button>
          {step > 0 && (
            <button type="button" onClick={() => setTourStep(step - 1)} className={`${btnGhost} cursor-pointer`}>
              Back
            </button>
          )}
          {last ? (
            <button
              type="button"
              onClick={() => {
                endTour();
                commands.recruiterTour();
              }}
              className="ml-auto cursor-pointer text-sm text-warm"
            >
              Recruiter tour →
            </button>
          ) : (
            <button type="button" onClick={endTour} className="ml-auto cursor-pointer text-sm text-muted hover:text-fg">
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const HINT_KEY = "baibhavos-hint-seen";

/** A one-time nudge after the first boot: take the tour, or don't. */
export function FirstVisitHint() {
  const [show, setShow] = useState(false);
  const startTour = useOS((s) => s.startTour);
  useEffect(() => {
    try {
      if (localStorage.getItem(HINT_KEY)) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  const dismiss = () => {
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {}
    setShow(false);
  };
  return (
    <div
      role="status"
      className="anim-fade absolute bottom-[104px] right-7 z-[8800] flex w-[300px] flex-col gap-3 rounded-2xl border border-line bg-popover p-4 shadow-[0_20px_50px_var(--shadow)] backdrop-blur-[24px]"
    >
      <p className="text-sm leading-relaxed text-fg">New here? Take a 30-second tour of baibhavOS.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            dismiss();
            startTour();
          }}
          className={`${btnSolid} min-h-9 cursor-pointer px-3.5`}
        >
          Start tour
        </button>
        <button type="button" onClick={dismiss} className={`${btnGhost} min-h-9 cursor-pointer px-3.5`}>
          No thanks
        </button>
      </div>
    </div>
  );
}
