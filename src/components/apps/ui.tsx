"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type AppProps = {
  params: Record<string, string>;
  setParams: (p: Record<string, string>) => void;
};

export const btnSolid =
  "inline-flex min-h-11 items-center rounded-[10px] bg-[var(--solid-btn)] px-[18px] text-sm font-semibold text-[var(--solid-btn-fg)] no-underline";
export const btnGhost =
  "inline-flex min-h-11 items-center rounded-[10px] border border-line px-[18px] text-sm text-fg no-underline hover:border-accent";

/** Left rail + scrolling document, used by About, Help and Resume. Rail collapses to chips in narrow windows. */
export function RailDoc({
  sections,
  active,
  onPick,
  label,
  footer,
  children,
}: {
  sections: { id: string; label: string }[];
  active: string;
  onPick: (id: string) => void;
  /** Small heading above the rail in wide windows, e.g. "Resume". */
  label?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const doc = useRef<HTMLDivElement>(null);
  const nav = useRef<HTMLElement>(null);
  // The highlighted rail item follows the scroll position; `active` only says where to jump.
  const [current, setCurrent] = useState(active);
  // While a jump is scrolling, the scroll spy stays quiet so the rail doesn't flicker through sections.
  const jumping = useRef(0);

  const jump = (id: string, behavior: ScrollBehavior) => {
    const el = doc.current?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!el || !doc.current) return;
    setCurrent(id);
    window.clearTimeout(jumping.current);
    jumping.current = window.setTimeout(() => (jumping.current = 0), behavior === "smooth" ? 900 : 50);
    doc.current.scrollTo({ top: el.offsetTop - 24, behavior });
  };

  // Scroll to the requested section whenever it changes (rail click or a deep link).
  // On first open the first section stays at the top, so any header above it is visible.
  const first = useRef(true);
  useEffect(() => {
    const opening = first.current;
    first.current = false;
    if (opening && active === sections[0]?.id) return;
    jump(active, opening ? "auto" : "smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Scroll spy: the current section is the last one whose top has passed the upper third of the view.
  useEffect(() => {
    const box = doc.current;
    if (!box) return;
    const onScroll = () => {
      if (jumping.current) return;
      const els = [...box.querySelectorAll<HTMLElement>("[data-section]")];
      if (!els.length) return;
      let id = els[0].dataset.section!;
      if (box.scrollTop + box.clientHeight >= box.scrollHeight - 4) id = els[els.length - 1].dataset.section!;
      else for (const el of els) if (el.offsetTop - 24 <= box.scrollTop + box.clientHeight / 3) id = el.dataset.section!;
      setCurrent(id);
    };
    box.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      box.removeEventListener("scroll", onScroll);
      window.clearTimeout(jumping.current);
    };
  }, []);

  // In narrow windows the rail is a row of chips; keep the highlighted chip in view.
  useEffect(() => {
    const row = nav.current;
    const chip = row?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: chip.offsetLeft - 12, behavior: "smooth" });
  }, [current]);

  return (
    <div className="@container flex h-full flex-col @3xl:flex-row">
      <nav
        ref={nav}
        aria-label="Sections"
        className="flex flex-none gap-1 overflow-x-auto border-b border-hair px-3 py-2 @3xl:w-[210px] @3xl:flex-col @3xl:gap-0.5 @3xl:border-b-0 @3xl:border-r @3xl:px-3.5 @3xl:py-6"
      >
        {label && <div className="eyebrow mb-3 hidden border-b border-hair px-3 pb-4 !text-muted @3xl:block">{label}</div>}
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-current={current === s.id ? "true" : undefined}
            onClick={() => (s.id === active ? jump(s.id, "smooth") : onPick(s.id))}
            className="flex min-h-10 flex-none cursor-pointer items-center gap-3 whitespace-nowrap rounded-[9px] px-3 text-left text-sm"
            style={
              current === s.id
                ? { background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }
                : { color: "var(--fg2)" }
            }
          >
            <span className="font-mono text-[11px] opacity-60">{String(i + 1).padStart(2, "0")}</span>
            {s.label}
          </button>
        ))}
        {footer && <div className="mt-auto hidden @3xl:block">{footer}</div>}
      </nav>
      <div ref={doc} className="relative min-h-0 min-w-0 flex-1 overflow-y-auto px-6 pb-16 pt-8 @3xl:px-12 @3xl:pt-9">
        {children}
      </div>
    </div>
  );
}

export function Section({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section data-section={id} className="border-t border-hair py-10 first:border-t-0 first:pt-0">
      <div className="eyebrow">
        {String(n).padStart(2, "0")} · {title}
      </div>
      {children}
    </section>
  );
}

export function Stat({ v, l, c }: { v: string; l: string; c?: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-card p-4">
      <div className="text-2xl font-extrabold">{v}</div>
      <div className="mt-1 text-[13px] text-fg2">{l}</div>
      {c && <div className="mt-1 text-xs leading-snug text-muted">{c}</div>}
    </div>
  );
}
