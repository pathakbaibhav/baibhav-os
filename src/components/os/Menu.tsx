"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// A keyboard-navigable dropdown, shared by the menu bar and the desktop context menu.

export type MenuItem = {
  label: string;
  keys?: string;
  run?: () => void;
  sep?: boolean; // draw a separator above this item
  disabled?: boolean;
  checked?: boolean;
  /** A read-only row (status text); not focusable or clickable. */
  info?: boolean;
};

export function MenuList({
  items,
  label,
  onClose,
  style,
  ignore,
}: {
  items: MenuItem[];
  label: string;
  onClose: () => void;
  style?: CSSProperties;
  /** Clicks inside this element don't close the menu (e.g. the menu bar, which handles its own toggling). */
  ignore?: React.RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
    const close = (e: Event) => {
      const t = e.target as Node;
      if (!ref.current?.contains(t) && !ignore?.current?.contains(t)) onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose, ignore]);

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={label}
      className="anim-fade absolute z-[9500] w-[250px] rounded-xl border border-line bg-popover p-1.5 text-[13.5px] shadow-[0_20px_50px_var(--shadow)] backdrop-blur-[24px]"
      style={style}
      onKeyDown={(e) => {
        const buttons = [...(ref.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [])];
        const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (e.key === "ArrowDown") buttons[(i + 1) % buttons.length]?.focus();
        else if (e.key === "ArrowUp") buttons[(i - 1 + buttons.length) % buttons.length]?.focus();
        else return;
        e.preventDefault();
      }}
    >
      {items.map((it) => (
        <div key={it.label}>
          {it.sep && <div className="mx-2 my-[5px] h-px bg-line" />}
          {it.info ? (
            <div role="none" className="flex min-h-8 items-center justify-between gap-3 px-2.5 text-muted">
              <span>{it.label}</span>
              {it.keys && <span className="font-mono text-[11px]">{it.keys}</span>}
            </div>
          ) : (
          <button
            type="button"
            role={it.checked === undefined ? "menuitem" : "menuitemcheckbox"}
            aria-checked={it.checked}
            disabled={it.disabled}
            onClick={() => {
              it.run?.();
              onClose();
            }}
            className="flex min-h-8 w-full cursor-pointer items-center justify-between gap-3 rounded-[7px] px-2.5 text-left text-fg outline-none hover:bg-accent hover:text-[#071016] focus:bg-accent focus:text-[#071016] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-fg"
          >
            <span className="flex items-center gap-2">
              {it.checked !== undefined && <span aria-hidden="true" className="w-3">{it.checked ? "✓" : ""}</span>}
              {it.label}
            </span>
            {it.keys && <span className="font-mono text-[11px] opacity-70">{it.keys}</span>}
          </button>
          )}
        </div>
      ))}
    </div>
  );
}
