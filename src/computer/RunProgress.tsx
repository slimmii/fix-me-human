import { useEffect, useState } from "react";

const messages = [
  "Reticulating the office spaghetti...",
  "Defragmenting the emotional support floppy...",
  "Teaching the pixels to walk in single file...",
  "Convincing the semicolons to unionize...",
  "Rehydrating the dehydrated megabytes...",
  "Polishing the load-bearing nonsense...",
  "Untangling the interdepartmental noodlebus...",
  "Faxing a permission slip to the motherboard...",
  "Calibrating the emergency waffle protocol...",
  "Asking the RAM if it remembers anything...",
  "Alphabetizing the quantum paperclips...",
  "Installing a tiny hat on every callback...",
];

export function RunProgress() {
  const [message, setMessage] = useState(() =>
    Math.floor(Math.random() * messages.length),
  );

  useEffect(() => {
    const timer = window.setInterval(
      () => setMessage((current) => (current + 1) % messages.length),
      2200,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="retro-run-loading">
      <div className="retro-run-dialog">
        <div className="retro-run-title">
          <b>▣ BUGSCAPE.EXE</b>
          <span>Please stand by</span>
        </div>
        <div className="retro-run-body">
          <h2>Processing your program</h2>
          <p className="retro-run-message">{messages[message]}</p>
          <div
            className="retro-run-track"
            role="progressbar"
            aria-label="Processing your program"
          >
            <div className="retro-run-blocks" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
          </div>
          <small>Stand by. The computer is doing its little best.</small>
        </div>
      </div>
    </div>
  );
}
