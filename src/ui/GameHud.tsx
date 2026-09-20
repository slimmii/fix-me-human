import { FullscreenButton } from "./FullscreenButton";
import type { ReactNode } from "react";

export function GameHud({
  mute,
  onDesk,
  onSettings,
  onToggleSound,
  focused,
  accountControls,
}: {
  mute: boolean;
  onDesk: () => void;
  onSettings: () => void;
  onToggleSound: () => void;
  focused: boolean;
  accountControls: ReactNode;
}) {
  return (
    <header className="hud">
      {!focused && (
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
      )}
      <div className="hud-right" style={{ marginLeft: "auto" }}>
        {!focused && (
          <>
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
          </>
        )}
        {accountControls}
      </div>
    </header>
  );
}
