import { useEffect, useRef, useState } from "react";
import {
  newSnakeGame,
  SNAKE_COLUMNS,
  SNAKE_ROWS,
  stepSnake,
  turnSnake,
  type Direction,
} from "./snake-game";

export const SNAKE_BEST_KEY = "bug-os-snake-best";
const directionKeys: Record<string, Direction> = {
  ArrowUp: "up",
  w: "up",
  "2": "up",
  ArrowRight: "right",
  d: "right",
  "6": "right",
  ArrowDown: "down",
  s: "down",
  "8": "down",
  ArrowLeft: "left",
  a: "left",
  "4": "left",
};
function readBest() {
  try {
    const best = Number(localStorage.getItem(SNAKE_BEST_KEY));
    return Number.isSafeInteger(best) && best > 0 ? best : 0;
  } catch {
    return 0;
  }
}

export function Snake({
  active,
  onExit,
}: {
  active: boolean;
  onExit: () => void;
}) {
  const [game, setGame] = useState(newSnakeGame);
  const [best, setBest] = useState(readBest);
  const windowRef = useRef<HTMLElement>(null);
  const running = game.status === "running";
  const speed = Math.max(80, 180 - Math.floor(game.score / 50) * 15);

  function togglePlay() {
    setGame((current) =>
      current.status === "running"
        ? { ...current, status: "paused" }
        : current.status === "paused"
          ? { ...current, status: "running" }
          : { ...newSnakeGame(), status: "running" },
    );
  }
  function steer(direction: Direction) {
    setGame((current) =>
      turnSnake(
        current.status === "ready"
          ? { ...current, status: "running" }
          : current,
        direction,
      ),
    );
  }
  function restart() {
    setGame({ ...newSnakeGame(), status: "running" });
  }

  useEffect(() => {
    if (active) windowRef.current?.focus({ preventScroll: true });
    else
      setGame((current) =>
        current.status === "running"
          ? { ...current, status: "paused" }
          : current,
      );
  }, [active]);
  useEffect(() => {
    if (!active || !running) return;
    const timer = window.setInterval(
      () => setGame((current) => stepSnake(current)),
      speed,
    );
    return () => window.clearInterval(timer);
  }, [active, running, speed]);
  useEffect(() => {
    const pause = () =>
      setGame((current) =>
        current.status === "running"
          ? { ...current, status: "paused" }
          : current,
      );
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  useEffect(() => {
    if (game.score <= best) return;
    setBest(game.score);
    try {
      localStorage.setItem(SNAKE_BEST_KEY, String(game.score));
    } catch {
      /* Snake remains playable without browser storage. */
    }
  }, [game.score, best]);
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Tab") {
        const buttons = Array.from(
          windowRef.current?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          ) ?? [],
        );
        const index = buttons.indexOf(
          document.activeElement as HTMLButtonElement,
        );
        if (
          index === -1 ||
          (event.shiftKey ? index === 0 : index === buttons.length - 1)
        ) {
          event.preventDefault();
          buttons[event.shiftKey ? buttons.length - 1 : 0]?.focus();
        }
        return;
      }
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const direction = directionKeys[key];
      const enter =
        key === "Enter" &&
        !(event.target instanceof Element && event.target.closest("button"));
      if (!direction && ![" ", "p", "r", "Escape"].includes(key) && !enter)
        return;
      event.preventDefault();
      event.stopPropagation();
      if (direction) steer(direction);
      else if (!event.repeat) {
        if (key === "Escape") onExit();
        else if (key === "r") restart();
        else togglePlay();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [active, onExit]);

  const message = {
    ready: "SNAKE",
    running: "Playing",
    paused: "PAUSED",
    over: "GAME OVER",
    won: "YOU WIN!",
  }[game.status];
  const playLabel = running
    ? "Pause"
    : game.status === "paused"
      ? "Resume"
      : game.status === "ready"
        ? "Start game"
        : "Play again";

  return (
    <div className="desktop-window-layer">
      <section
        className="snake-window"
        role="dialog"
        aria-modal="true"
        aria-label="Snake"
        aria-describedby="snake-instructions"
        ref={windowRef}
        tabIndex={-1}
      >
        <header className="snake-titlebar">
          <b>
            <span aria-hidden="true">▦</span> Snake
          </b>
          <small>B.U.G. Games</small>
          <button onClick={onExit} aria-label="Close Snake">
            ×
          </button>
        </header>
        <div className="snake-content">
          <div className="snake-lcd">
            <div className="snake-scoreboard">
              <span aria-label={`Score: ${game.score}`}>
                SCORE <b>{String(game.score).padStart(3, "0")}</b>
              </span>
              <span aria-label={`Best score: ${best}`}>
                BEST <b>{String(best).padStart(3, "0")}</b>
              </span>
            </div>
            <div className="snake-board">
              <svg
                viewBox={`0 0 ${SNAKE_COLUMNS * 10} ${SNAKE_ROWS * 10}`}
                role="img"
                aria-label="Snake playing field"
                shapeRendering="crispEdges"
              >
                <defs>
                  <pattern
                    id="snake-pixels"
                    width="10"
                    height="10"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      width="9"
                      height="9"
                      fill="currentColor"
                      opacity="0.045"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#snake-pixels)" />
                {game.food && (
                  <path
                    data-snake-food=""
                    transform={`translate(${game.food.x * 10} ${game.food.y * 10})`}
                    d="M3 1h3v2h2v4H6v2H3V7H1V3h2z"
                    fill="currentColor"
                  />
                )}
                {game.body.map((cell, index) => (
                  <rect
                    key={`${cell.x}:${cell.y}`}
                    data-snake-head={index === 0 ? "" : undefined}
                    x={cell.x * 10}
                    y={cell.y * 10}
                    width="9"
                    height="9"
                    fill="currentColor"
                  />
                ))}
              </svg>
              {!running && (
                <div className="snake-overlay">
                  <strong>{message}</strong>
                  <span>
                    {game.status === "ready"
                      ? "Eat the dots. Avoid the walls and your tail."
                      : game.status === "paused"
                        ? "Take your time."
                        : `Final score: ${game.score}`}
                  </span>
                  <button onClick={togglePlay}>{playLabel}</button>
                  <small>or press Space</small>
                </div>
              )}
            </div>
            <div className="snake-lcd-footer" role="status" aria-live="polite">
              {running
                ? "Eat. Grow. Repeat."
                : message === "SNAKE"
                  ? "Ready when you are."
                  : message}
            </div>
          </div>
          <aside className="snake-controls" aria-label="Snake controls">
            <div className="snake-wordmark">
              SNAKE<small>CLASSIC / 01</small>
            </div>
            <div className="snake-dpad">
              {(
                [
                  ["up", "↑"],
                  ["left", "←"],
                  ["down", "↓"],
                  ["right", "→"],
                ] as const
              ).map(([direction, label]) => (
                <button
                  key={direction}
                  className={`snake-${direction}`}
                  aria-label={`Move ${direction}`}
                  onClick={() => steer(direction)}
                >
                  {label}
                </button>
              ))}
            </div>
            <small id="snake-instructions">
              ↑↓←→ / WASD
              <br />
              2 · 4 · 6 · 8
            </small>
            <button
              onClick={togglePlay}
              disabled={!active || !["running", "paused"].includes(game.status)}
            >
              {game.status === "paused" ? "Resume" : "Pause"}
            </button>
            <button onClick={restart} disabled={!active}>
              New game
            </button>
            <small>
              Space: pause
              <br />
              Esc: desktop
            </small>
          </aside>
        </div>
      </section>
    </div>
  );
}
