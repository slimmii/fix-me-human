import type { Save } from "../progression";
type Settings = Save["settings"];
export function SettingsDialog({
  settings,
  onClose,
  onChange,
}: {
  settings: Settings;
  onClose: () => void;
  onChange: (key: keyof Settings, value: boolean) => void;
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
        <p>
          Type your own React. Tab indents; F5 runs; F6 switches to your editor.
          Escape returns to the desk. No timers. No lost progress.
        </p>
        <button className="primary" onClick={onClose}>
          Back to work
        </button>
      </section>
    </div>
  );
}
