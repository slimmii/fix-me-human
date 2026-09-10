import { GRAPHICS_QUALITY, isGraphicsQuality } from "../graphics";
import type { Save } from "../progression";
type Settings = Save["settings"];
export function SettingsDialog({
  settings,
  onClose,
  onChange,
}: {
  settings: Settings;
  onClose: () => void;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}) {
  return (
    <div className="modal-backdrop">
      <section
        className="settings"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <button className="close" onClick={onClose} aria-label="Close settings">
          ×
        </button>
        <span className="eyebrow">HUMAN ACCOMMODATIONS</span>
        <h2>A few small mercies.</h2>
        {(["mute", "reducedMotion", "crt"] as const).map((k, i) => (
          <label key={k}>
            <input
              type="checkbox"
              checked={settings[k]}
              onChange={(e) => onChange(k, e.target.checked)}
            />
            {["Mute sound", "Reduce motion", "CRT scanlines"][i]}
          </label>
        ))}
        <div className="graphics-quality">
          <label htmlFor="graphics-quality">
            Graphics quality
            <output htmlFor="graphics-quality">
              {GRAPHICS_QUALITY[settings.graphicsQuality].label}
            </output>
          </label>
          <input
            id="graphics-quality"
            type="range"
            min="0"
            max="2"
            step="1"
            value={settings.graphicsQuality}
            aria-valuetext={GRAPHICS_QUALITY[settings.graphicsQuality].label}
            aria-describedby="graphics-quality-help"
            onChange={(event) => {
              const value = Number(event.target.value);
              if (isGraphicsQuality(value)) onChange("graphicsQuality", value);
            }}
          />
          <div className="quality-stops" aria-hidden="true">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
          <p id="graphics-quality-help">
            {GRAPHICS_QUALITY[settings.graphicsQuality].description}
          </p>
        </div>
        <p>
          Type your own React. Tab indents; F5 runs; F6 switches to your editor.
          Escape returns to the desk. No deadlines. No lost progress.
        </p>
        <button className="primary" onClick={onClose}>
          Back to work
        </button>
      </section>
    </div>
  );
}
