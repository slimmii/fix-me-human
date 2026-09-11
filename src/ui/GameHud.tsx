import { FullscreenButton } from "./FullscreenButton";

export function GameHud({
  mute,
  onDesk,
  onSettings,
  onToggleSound,
}: {
  mute: boolean;
  onDesk: () => void;
  onSettings: () => void;
  onToggleSound: () => void;
}) {
  return (
    <header className="hud">
      <a
        className="brand"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onDesk();
        }}
      >
        <span className="brand-icon">▦</span>
        <span>
          PLEASE FIX, HUMAN<small>REACT JOB SIMULATOR</small>
        </span>
      </a>
      <div className="hud-right">
        <span className="shift-label">
          <i /> HUMAN OPERATED. FOR NOW.
        </span>
        <button onClick={() => onSettings()} aria-label="Settings">
          ⚙
        </button>
        <button onClick={onToggleSound}>
          {mute ? "Sound off" : "Sound on"}
        </button>
        <FullscreenButton />
      </div>
    </header>
  );
}
