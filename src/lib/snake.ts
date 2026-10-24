// Snake for the Arcade, as pure state transitions so it can be tested without a canvas.

export type Point = { x: number; y: number };
export type Dir = "up" | "down" | "left" | "right";
export type Game = {
  size: number;
  snake: Point[]; // head first
  dir: Dir;
  queued: Dir | null; // the next turn, applied on the next tick (prevents 180° turns within one tick)
  food: Point;
  score: number;
  over: boolean;
};

const STEP: Record<Dir, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

/** A free cell for the next packet; `rand` is injectable for tests. */
export function placeFood(size: number, snake: Point[], rand: () => number = Math.random): Point {
  const free: Point[] = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y });
  return free[Math.floor(rand() * free.length)] ?? { x: 0, y: 0 };
}

export function newGame(size = 18, rand: () => number = Math.random): Game {
  const mid = Math.floor(size / 2);
  const snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
  return { size, snake, dir: "right", queued: null, food: placeFood(size, snake, rand), score: 0, over: false };
}

/** Ask to turn; ignored if it would reverse straight into the snake's own neck. */
export function turn(g: Game, d: Dir): Game {
  const current = g.queued ?? g.dir;
  return d === current || d === OPPOSITE[current] ? g : { ...g, queued: d };
}

/** Advance one tick: move, eat (grow and score), or crash into a wall or the snake itself. */
export function tick(g: Game, rand: () => number = Math.random): Game {
  if (g.over) return g;
  const dir = g.queued ?? g.dir;
  const head = { x: g.snake[0].x + STEP[dir].x, y: g.snake[0].y + STEP[dir].y };
  const eats = same(head, g.food);
  const body = eats ? g.snake : g.snake.slice(0, -1);
  if (head.x < 0 || head.y < 0 || head.x >= g.size || head.y >= g.size || body.some((p) => same(p, head))) {
    return { ...g, dir, queued: null, over: true };
  }
  const snake = [head, ...body];
  return { ...g, snake, dir, queued: null, score: g.score + (eats ? 1 : 0), food: eats ? placeFood(g.size, snake, rand) : g.food };
}

/** Faster as the snake grows: 140 ms per tick down to 70. */
export const speedMs = (score: number) => Math.max(70, 140 - score * 4);
