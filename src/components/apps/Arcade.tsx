"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { newGame, speedMs, tick, turn, type Dir, type Game } from "@/lib/snake";
import { btnSolid } from "./ui";

// Packet Snake: route the packet stream to the next node without crashing.
// Arrow keys / WASD on a keyboard, swipes on a touch screen; best score stays in this browser.

const BEST_KEY = "baibhavos-snake-best";
const CELL = 20;
const KEYS: Record<string, Dir> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right", W: "up", S: "down", A: "left", D: "right",
};

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

export function Arcade() {
  const [game, setGame] = useState<Game>(() => newGame());
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => setBest(readBest()), []);

  const start = useCallback(() => {
    setGame(newGame());
    setRunning(true);
    board.current?.focus();
  }, []);

  // Game loop: the tick rate speeds up with the score.
  useEffect(() => {
    if (!running || game.over) return;
    const t = setTimeout(() => setGame((g) => tick(g)), speedMs(game.score));
    return () => clearTimeout(t);
  }, [running, game]);

  // Game over: stop and keep the best score.
  useEffect(() => {
    if (!game.over) return;
    setRunning(false);
    if (game.score > best) {
      setBest(game.score);
      try {
        localStorage.setItem(BEST_KEY, String(game.score));
      } catch {}
    }
  }, [game.over, game.score, best]);

  // Pause when the visitor looks away.
  useEffect(() => {
    const pause = () => document.hidden && setRunning(false);
    document.addEventListener("visibilitychange", pause);
    return () => document.removeEventListener("visibilitychange", pause);
  }, []);

  // Draw.
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const css = getComputedStyle(c);
    const accent = css.getPropertyValue("--accent").trim() || "#7FD4E8";
    const warm = css.getPropertyValue("--warm").trim() || "#F4B786";
    const grid = css.getPropertyValue("--hair").trim() || "rgba(255,255,255,0.07)";
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = grid;
    for (let i = 1; i < game.size; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, c.height);
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(c.width, i * CELL);
      ctx.stroke();
    }
    ctx.fillStyle = warm;
    ctx.shadowColor = warm;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(game.food.x * CELL + CELL / 2, game.food.y * CELL + CELL / 2, CELL / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    game.snake.forEach((p, i) => {
      ctx.globalAlpha = Math.max(0.35, 1 - i / (game.snake.length + 4));
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(p.x * CELL + 2, p.y * CELL + 2, CELL - 4, CELL - 4, 5);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }, [game]);

  const steer = (d: Dir) => {
    if (!running && !game.over) setRunning(true);
    setGame((g) => turn(g, d));
  };

  const onSwipeStart = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onSwipeEnd = (e: ReactPointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  };

  const px = game.size * CELL;
  return (
    <div className="flex h-full flex-col items-center gap-4 overflow-y-auto px-6 py-6">
      <header className="flex w-full max-w-[400px] items-end justify-between">
        <div>
          <div className="eyebrow">Arcade</div>
          <h1 className="mt-1 text-2xl font-extrabold">Packet Snake</h1>
        </div>
        <div className="text-right font-mono text-xs text-muted" aria-live="polite">
          <div>
            packets <span className="text-fg">{game.score}</span>
          </div>
          <div>
            best <span className="text-fg">{best}</span>
          </div>
        </div>
      </header>

      <div
        ref={board}
        tabIndex={0}
        role="application"
        aria-label="Packet Snake board. Use the arrow keys or swipe to steer."
        onKeyDown={(e) => {
          const d = KEYS[e.key];
          if (d) {
            e.preventDefault();
            steer(d);
          } else if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            if (game.over || !running) start();
          }
        }}
        onPointerDown={onSwipeStart}
        onPointerUp={onSwipeEnd}
        className="relative w-full max-w-[400px] touch-none overflow-hidden rounded-2xl border border-line bg-card"
        style={{ aspectRatio: "1 / 1" }}
      >
        <canvas ref={canvas} width={px} height={px} className="h-full w-full" />
        {(!running || game.over) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[color-mix(in_srgb,var(--bg)_55%,transparent)] text-center backdrop-blur-[2px]">
            <p className="text-sm text-fg2">
              {game.over ? `Connection lost after ${game.score} packet${game.score === 1 ? "" : "s"}.` : "Route packets to the glowing node. Don't hit the walls or yourself."}
            </p>
            <button type="button" onClick={start} className={`${btnSolid} cursor-pointer`}>
              {game.over ? "Play again" : "Start"}
            </button>
          </div>
        )}
      </div>

      <p className="font-mono text-[11px] text-muted">arrow keys or WASD · swipe on touch screens · space to restart</p>
    </div>
  );
}
