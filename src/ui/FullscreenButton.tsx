import { useEffect, useState } from "react";

export function FullscreenButton() {
  const [active, setActive] = useState(!!document.fullscreenElement);
  const [error, setError] = useState("");

  useEffect(() => {
    const sync = () => setActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  if (!document.fullscreenEnabled) return null;

  async function toggle() {
    setError("");
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setError("Fullscreen could not be changed. Please try again.");
    }
  }

  return (
    <>
      <button onClick={toggle} aria-pressed={active}>
        {active ? "Exit fullscreen" : "Fullscreen"}
      </button>
      {error && (
        <span role="alert" className="fullscreen-error">
          {error}
        </span>
      )}
    </>
  );
}
