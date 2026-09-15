export const SNAKE_COLUMNS = 24;
export const SNAKE_ROWS = 16;
export type Direction = "up" | "right" | "down" | "left";
export type Cell = { x: number; y: number };
export type SnakeGame = {
  body: Cell[];
  direction: Direction;
  turns: Direction[];
  food: Cell | null;
  score: number;
  status: "ready" | "running" | "paused" | "over" | "won";
};
const vectors: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};
const sameCell = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

export function placeFood(body: Cell[], random = Math.random): Cell | null {
  const empty: Cell[] = [];
  for (let y = 0; y < SNAKE_ROWS; y++)
    for (let x = 0; x < SNAKE_COLUMNS; x++)
      if (!body.some((cell) => sameCell(cell, { x, y }))) empty.push({ x, y });
  return empty[Math.floor(random() * empty.length)] ?? null;
}

export function newSnakeGame(): SnakeGame {
  return {
    body: [
      { x: 6, y: 8 },
      { x: 5, y: 8 },
      { x: 4, y: 8 },
      { x: 3, y: 8 },
    ],
    direction: "right",
    turns: [],
    food: { x: 12, y: 8 },
    score: 0,
    status: "ready",
  };
}

export function turnSnake(game: SnakeGame, direction: Direction): SnakeGame {
  if (game.status !== "running" || game.turns.length >= 2) return game;
  const previous = vectors[game.turns.at(-1) ?? game.direction];
  const next = vectors[direction];
  // Buffer quick corners, but never turn back into the snake's neck.
  if (previous.x === next.x || previous.y === next.y) return game;
  return { ...game, turns: [...game.turns, direction] };
}

export function stepSnake(game: SnakeGame, random = Math.random): SnakeGame {
  if (game.status !== "running") return game;
  const direction = game.turns[0] ?? game.direction;
  const vector = vectors[direction];
  const head = { x: game.body[0].x + vector.x, y: game.body[0].y + vector.y };
  const eating = game.food !== null && sameCell(head, game.food);
  const obstacles = eating ? game.body : game.body.slice(0, -1);
  if (
    head.x < 0 ||
    head.x >= SNAKE_COLUMNS ||
    head.y < 0 ||
    head.y >= SNAKE_ROWS ||
    obstacles.some((cell) => sameCell(cell, head))
  )
    return { ...game, status: "over", turns: [] };
  const body = [head, ...game.body];
  if (!eating) body.pop();
  const food = eating ? placeFood(body, random) : game.food;
  return {
    body,
    direction,
    turns: game.turns.slice(1),
    food,
    score: game.score + (eating ? 10 : 0),
    status: food ? "running" : "won",
  };
}
