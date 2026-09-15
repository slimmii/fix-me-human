import { describe, expect, it } from "vitest";
import {
  newSnakeGame,
  placeFood,
  SNAKE_COLUMNS,
  SNAKE_ROWS,
  stepSnake,
  turnSnake,
  type SnakeGame,
} from "../src/computer/snake-game";

const runningGame = (): SnakeGame => ({ ...newSnakeGame(), status: "running" });

describe("Snake", () => {
  it("waits to start and stops moving while paused or after losing", () => {
    for (const status of ["ready", "paused", "over", "won"] as const) {
      const game = { ...newSnakeGame(), status };
      expect(stepSnake(game)).toBe(game);
      expect(turnSnake(game, "up")).toBe(game);
    }
  });

  it("moves, grows after eating, scores, and keeps food off the body", () => {
    let game = runningGame();
    for (let index = 0; index < 6; index++) game = stepSnake(game, () => 0);
    expect(game.body[0]).toEqual({ x: 12, y: 8 });
    expect(game.body).toHaveLength(5);
    expect(game.score).toBe(10);
    expect(game.body).not.toContainEqual(game.food);
    expect(game.food).toEqual({ x: 0, y: 0 });
  });

  it("rejects reversing and buffers two quick corners across separate ticks", () => {
    const game = runningGame();
    expect(turnSnake(game, "left")).toBe(game);
    let next = turnSnake(turnSnake(game, "up"), "left");
    expect(turnSnake(next, "down")).toBe(next);
    next = stepSnake(next);
    expect(next.body[0]).toEqual({ x: 6, y: 7 });
    next = stepSnake(next);
    expect(next.body[0]).toEqual({ x: 5, y: 7 });
    expect(next.status).toBe("running");
  });

  it("ends the game at walls and when hitting the body", () => {
    expect(
      stepSnake({ ...runningGame(), body: [{ x: SNAKE_COLUMNS - 1, y: 8 }] })
        .status,
    ).toBe("over");
    const loop: SnakeGame = {
      ...runningGame(),
      direction: "down",
      body: [
        { x: 3, y: 2 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 4, y: 3 },
      ],
    };
    expect(stepSnake(loop).status).toBe("over");
    // The tail moves away on the same tick, so its old cell is safe.
    expect(stepSnake({ ...loop, body: loop.body.slice(0, -1) }).status).toBe(
      "running",
    );
  });

  it("wins on a full board instead of looping forever trying to place food", () => {
    const body = Array.from(
      { length: SNAKE_COLUMNS * SNAKE_ROWS },
      (_, index) => ({
        x: index % SNAKE_COLUMNS,
        y: Math.floor(index / SNAKE_COLUMNS),
      }),
    );
    expect(placeFood(body)).toBeNull();
    const finalFood = body.pop()!;
    const game = stepSnake({
      ...runningGame(),
      body: body.reverse(),
      food: finalFood,
    });
    expect(game.status).toBe("won");
    expect(game.food).toBeNull();
    expect(game.body).toHaveLength(SNAKE_COLUMNS * SNAKE_ROWS);
  });
});
