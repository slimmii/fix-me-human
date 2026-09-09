import { useEffect, useRef } from "react";
import type { Assignment } from "../curriculum/types";
import { LessonMarkdown } from "../computer/ContentScreen";

export function PrintedAssignment({
  assignment,
  open,
  onClose,
}: {
  assignment: Assignment;
  open: boolean;
  onClose: () => void;
}) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    close.current?.focus({ preventScroll: true });
    return () => {
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="assignment-dock is-open">
      <aside
        className="printed-assignment"
        aria-label="Printed assignment"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            event.preventDefault();
            onClose();
          }
        }}
      >
        <header>
          <span>
            BUG INDUSTRIES™
            <br />
            <b>ASSIGNMENT / HUMAN H–042</b>
          </span>
          <button
            ref={close}
            onClick={onClose}
            aria-label="Put assignment down"
          >
            ×
          </button>
        </header>
        <div className="printed-assignment-content" tabIndex={0}>
          <h2>{assignment.title}</h2>
          <LessonMarkdown path={assignment.brief} />
        </div>
        <footer>Keep this sheet open while you code.</footer>
      </aside>
    </div>
  );
}
