import type { GameController } from "../game/useGame";
type Props = Pick<GameController, "enter">;
export function BootScreen({ enter }: Props) {
  return (
    <div className="machine-screen machine-boot">
      <small>BUG INDUSTRIES™ / HUMAN RESOURCES</small>
      <h1>
        PLEASE FIX,
        <br />
        HUMAN<span>_</span>
      </h1>
      <p>A tiny React game. A suspiciously large workload.</p>
      <button onClick={enter}>▶ Start</button>
      <footer>INSERT HUMAN TO CONTINUE</footer>
    </div>
  );
}
