"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { APPS, ICONS, LAUNCHPAD_ORDER } from "@/lib/apps";
import { search } from "@/lib/search";
import { useOS } from "@/lib/store";

export function Launchpad() {
  const { spotlight, setLaunchpad, open } = useOS();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const results = search(q);

  useEffect(() => {
    if (spotlight) input.current?.focus();
  }, [spotlight]);

  const pick = (i: number) => {
    const hit = results[i];
    if (hit) open(hit.app, hit.params);
  };

  return (
    <div
      className="anim-fade absolute inset-x-0 bottom-0 top-[30px] z-[8500] flex flex-col items-center overflow-y-auto px-4 pb-32 pt-14 backdrop-blur-[30px]"
      style={{ background: "color-mix(in srgb, var(--bg) 60%, transparent)" }}
      onClick={(e) => e.target === e.currentTarget && setLaunchpad(false)}
    >
      <div className="flex w-full max-w-[620px] flex-col gap-2">
        <div className="flex h-[54px] items-center gap-3 rounded-[14px] border border-line bg-popover px-[18px] shadow-[0_20px_50px_var(--shadow)]">
          <Icon d={ICONS.search} size={20} strokeWidth={2} className="text-muted" />
          <label htmlFor="spotlight" className="sr-only">Search baibhavOS</label>
          <input
            id="spotlight"
            ref={input}
            value={q}
            autoComplete="off"
            placeholder="Search apps, projects, commands…"
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
              else if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
              else if (e.key === "Enter") pick(active);
              else return;
              e.preventDefault();
            }}
            className="h-10 min-w-0 flex-1 bg-transparent text-lg text-fg outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted">⌘K</kbd>
        </div>
        {results.length > 0 && (
          <ul role="listbox" aria-label="Results" className="rounded-[14px] border border-line bg-popover p-2">
            {results.map((r, i) => (
              <li key={r.kind + r.label} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onClick={() => pick(i)}
                  onMouseEnter={() => setActive(i)}
                  className="flex min-h-[42px] w-full cursor-pointer items-center justify-between rounded-[9px] px-3 text-[15px] text-fg"
                  style={{ background: i === active ? "color-mix(in srgb, var(--accent) 18%, transparent)" : undefined }}
                >
                  <span>{r.label}</span>
                  <span className="font-mono text-[11px] text-muted">{r.kind}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <nav aria-label="All apps" className="mt-12 grid grid-cols-3 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-6 lg:gap-x-11">
        {LAUNCHPAD_ORDER.map((id) => {
          const a = APPS[id];
          return (
            <button key={id} type="button" onClick={() => open(id)} className="group flex w-[110px] cursor-pointer flex-col items-center gap-2.5 text-sm text-fg">
              <span
                className="flex h-[84px] w-[84px] items-center justify-center rounded-[22px] border border-white/15 shadow-[0_12px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform group-hover:scale-105"
                style={{ background: `linear-gradient(160deg, ${a.color} 0%, ${a.color}AA 55%, #12151C 140%)` }}
              >
                <Icon d={a.icon} size={38} stroke="#FFFFFF" strokeWidth={1.6} />
              </span>
              {a.label}
            </button>
          );
        })}
      </nav>
      <p className="mt-12 font-mono text-xs text-muted">click outside or press esc to close</p>
    </div>
  );
}
