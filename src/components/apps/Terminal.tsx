"use client";

import { useEffect, useRef, useState } from "react";
import { PROMPT, TERMINAL_INTRO, runCommand, type Line, type LineKind } from "@/lib/terminal";
import { useOS } from "@/lib/store";

const COLORS: Record<LineKind, string> = {
  cmd: "var(--accent)",
  out: "var(--fg2)",
  err: "var(--warm)",
  dim: "var(--muted)",
  ok: "var(--ok)",
};

export function Terminal() {
  const open = useOS((s) => s.open);
  const [lines, setLines] = useState<Line[]>(TERMINAL_INTRO);
  const [cmd, setCmd] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => input.current?.focus(), []);
  useEffect(() => {
    screen.current?.scrollTo({ top: screen.current.scrollHeight });
  }, [lines]);

  const submit = () => {
    const res = runCommand(cmd);
    setLines((prev) => (res.clear ? [] : [...prev, ...res.lines]));
    if (cmd.trim()) setHistory((h) => [cmd, ...h]);
    setHIndex(-1);
    setCmd("");
    if (res.open) open(res.open);
    if (res.href) window.location.href = res.href;
  };

  return (
    <div
      className="flex h-full flex-col bg-[rgba(6,8,13,0.6)] font-mono text-sm leading-[1.75]"
      onClick={() => window.getSelection()?.isCollapsed && input.current?.focus()}
    >
      <div ref={screen} role="log" aria-live="polite" className="flex-1 overflow-y-auto px-[22px] pb-1.5 pt-[18px]">
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap" style={{ color: COLORS[l.kind] }}>
            {l.text}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2.5 px-[22px] pb-[18px] pt-2">
        <label htmlFor="term-in" className="whitespace-nowrap text-accent">{PROMPT}</label>
        <input
          id="term-in"
          ref={input}
          value={cmd}
          autoComplete="off"
          spellCheck={false}
          placeholder="type help and press Enter"
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            else if (e.key === "ArrowUp" && history.length) {
              const i = Math.min(hIndex + 1, history.length - 1);
              setHIndex(i);
              setCmd(history[i]);
            } else if (e.key === "ArrowDown") {
              const i = hIndex - 1;
              setHIndex(Math.max(i, -1));
              setCmd(i >= 0 ? history[i] : "");
            } else return;
            e.preventDefault();
          }}
          className="min-h-9 min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-muted"
        />
      </div>
    </div>
  );
}
