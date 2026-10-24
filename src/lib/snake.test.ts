import { describe, expect, it } from "vitest";
import { newGame, placeFood, speedMs, tick, turn, type Game } from "./snake";

const fixed = () => 0; // always the first free cell

describe("snake", () => {
  it("starts in the middle, heading right", () => {
    const g = newGame(10, fixed);
    expect(g.snake[0]).toEqual({ x: 5, y: 5 });
    expect(g.dir).toBe("right");
    expect(g.snake).not.toContainEqual(g.food);
  });

  it("moves one cell per tick", () => {
    const g = tick(newGame(10, fixed), fixed);
    expect(g.snake[0]).toEqual({ x: 6, y: 5 });
    expect(g.snake).toHaveLength(3);
  });

  it("ignores a turn straight back into itself", () => {
    const g = newGame(10, fixed);
    expect(turn(g, "left")).toBe(g);
    expect(turn(g, "up").queued).toBe("up");
  });

  it("grows and scores when it eats", () => {
    const g: Game = { ...newGame(10, fixed), food: { x: 6, y: 5 } };
    const next = tick(g, fixed);
    expect(next.score).toBe(1);
    expect(next.snake).toHaveLength(4);
    expect(next.snake).not.toContainEqual(next.food);
  });

  it("crashes into walls and into itself", () => {
    let g: Game = { ...newGame(4, fixed), snake: [{ x: 3, y: 0 }, { x: 2, y: 0 }], dir: "right" };
    expect(tick(g, fixed).over).toBe(true);
    g = { ...newGame(10, fixed), snake: [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }], dir: "up", food: { x: 0, y: 0 } };
    g = turn(g, "right"); // the cell to the right of the head is the snake's own body
    expect(tick(g, fixed).over).toBe(true);
  });

  it("never places food on the snake", () => {
    const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
    for (let i = 0; i < 20; i++) expect(snake).not.toContainEqual(placeFood(2, snake, Math.random));
  });

  it("speeds up with score, with a floor", () => {
    expect(speedMs(0)).toBe(140);
    expect(speedMs(100)).toBe(70);
  });
});
