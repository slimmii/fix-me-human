import { useEffect, useRef, type ReactNode } from "react";
import "./desktop.css";

function ApplicationIcon({ app }: { app: "basic" | "snake" }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" shapeRendering="crispEdges">
      {app === "basic" ? (
        <>
          <path fill="#172e29" d="M4 3h40v32H4zM20 35h8v5h10v5H10v-5h10z" />
          <path fill="#ece7c9" d="M6 5h36v28H6zM12 41h24v2H12z" />
          <path fill="#263e35" d="M10 9h28v20H10z" />
          <path fill="#f5bd68" d="m14 13 6 5-6 5-2-2 4-3-4-3zM23 22h9v2h-9z" />
        </>
      ) : (
        <>
          <path fill="#172e29" d="M7 3h34v42H7z" />
          <path fill="#ece7c9" d="M9 5h30v38H9z" />
          <path fill="#a7b878" d="M12 9h24v28H12z" />
          <path
            fill="#263b21"
            d="M16 13h16v5H21v5h11v10H16v-5h11v-1H16zM16 30h2v2h-2z"
          />
          <path fill="#a7b878" d="M29 14h2v2h-2z" />
          <path fill="#263b21" d="M14 39h6v2h-6zM28 39h6v2h-6z" />
        </>
      )}
    </svg>
  );
}

export function Desktop({
  active,
  onOpen,
  children,
}: {
  active: boolean;
  onOpen: (app: "basic" | "snake") => void;
  children?: ReactNode;
}) {
  const firstIcon = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (active) firstIcon.current?.focus({ preventScroll: true });
  }, [active]);

  return (
    <section className="bug-desktop" aria-label="B.U.G. OS desktop">
      <div className="desktop-surface" inert={!!children}>
        <header className="desktop-menubar">
          <b>
            <span aria-hidden="true">▦</span> B.U.G. OS
          </b>
          <span>Desktop</span>
          <small>Version 1.0</small>
        </header>
        <nav className="desktop-icons" aria-label="Applications">
          <button ref={firstIcon} onClick={() => onOpen("basic")}>
            <ApplicationIcon app="basic" />
            <span>B.U.G. Basic</span>
          </button>
          <button onClick={() => onOpen("snake")}>
            <ApplicationIcon app="snake" />
            <span>Snake</span>
          </button>
        </nav>
        <div className="desktop-watermark" aria-hidden="true">
          <span>▦</span>
          <b>B.U.G. OS</b>
          <small>A little room to think.</small>
        </div>
        <footer className="desktop-status">
          <span>2 applications</span>
          <span>Click an icon to open · Tab + Enter</span>
        </footer>
      </div>
      {children}
    </section>
  );
}
