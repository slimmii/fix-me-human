import { useEffect, useRef, useState } from "react";
import type { Exercise } from "./content";
import { sourceFor } from "./content";
import RetroEditor, { type RetroEditorHandle } from "./RetroEditor";
import { browserDocument } from "./sandbox/document";
import type { Compiled } from "./typed-engine";
export const TAGS = [
  "div",
  "section",
  "h1",
  "h2",
  "p",
  "span",
  "button",
  "input",
  "label",
  "ul",
  "li",
];
export function starterFor(e: Exercise) {
  if (e.kind === "ordering")
    return "// B.U.G. misplaced the entire file. Type your component here.\n// Use the example and ask B.U.G. for a hint if you need one.\n";
  const values = Object.fromEntries(
    e.slots.map((s, i) => [
      s.name,
      e.kind === "repair"
        ? s.choices.find((c) => c.id !== s.answer)!.id
        : i === 0
          ? ""
          : s.answer,
    ]),
  );
  return sourceFor(e, values).replace(/\/\* ([A-Z]+) \*\//g, "/* TODO: $1 */");
}
type Props = {
  exercise: Exercise;
  source: string;
  onChange: (code: string) => void;
  onPass: () => void;
  onRobot: (text: string, mood?: "neutral" | "happy" | "confused") => void;
  onKey: () => void;
  reduced: boolean;
  onHelp: () => void;
  onExit: () => void;
};
type Menu = "File" | "Edit" | "Search" | "Run" | "Help";
export default function TypedComputer({
  exercise,
  source,
  onChange,
  onPass,
  onRobot,
  onKey,
  reduced,
  onHelp,
  onExit,
}: Props) {
  const [draft, setDraft] = useState(source);
  const [page, setPage] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [accepted, setAccepted] = useState(false);
  const [hint, setHint] = useState(0);
  const [active, setActive] = useState<"editor" | "browser">("editor");
  const [menu, setMenu] = useState<Menu | null>(null);
  const [position, setPosition] = useState({ line: 1, column: 1 });
  const [error, setError] = useState("");
  const editor = useRef<RetroEditorHandle>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const worker = useRef<Worker | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const token = useRef("");
  const pending = useRef<Compiled | null>(null);
  const generation = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latestSource = useRef(draft);
  latestSource.current = draft;
  useEffect(() => {
    worker.current = new Worker(
      new URL("./compiler.worker.ts", import.meta.url),
      { type: "module" },
    );
    return () => {
      worker.current?.terminate();
      clearTimeout(timeout.current);
    };
  }, []);
  useEffect(() => {
    menuPanel.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [menu]);
  function backToEditor() {
    setActive("editor");
    setMenu(null);
    requestAnimationFrame(() => editor.current?.focus());
  }
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.data?.channel !== "human-preview" ||
        event.data.token !== token.current
      )
        return;
      if (event.data.type === "editor") {
        backToEditor();
        return;
      }
      clearTimeout(timeout.current);
      setBusy(false);
      if (event.data.type === "error") {
        setAccepted(false);
        setError(String(event.data.detail));
        setStatus("Runtime error");
        onRobot(
          `Good news: the browser found the problem before management did. ${String(event.data.detail).slice(0, 400)}`,
          "confused",
        );
      }
      if (event.data.type === "rendered") {
        const checks = pending.current?.checks || [];
        const visible = JSON.parse(event.data.detail).valid;
        const ok = checks.length > 0 && checks.every((c) => c.pass) && visible;
        setAccepted(ok);
        setStatus(
          ok
            ? "Program ran successfully. Assignment checks passed."
            : "Program running. Assignment needs a repair.",
        );
        onRobot(
          ok
            ? "Your program works. I am updating my résumé to include “excellent supervision.” Try your page, then submit the repair."
            : `The page is alive! Now: ${
                checks
                  .filter((c) => !c.pass)
                  .map((c) => c.label)
                  .join(". ") ||
                "Return the elements requested in the assignment"
              }. Press F6 to return to your code.`,
          ok ? "happy" : "confused",
        );
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onRobot]);
  function run() {
    if (!worker.current || busy) return;
    onKey();
    setMenu(null);
    setActive("browser");
    setBusy(true);
    setAccepted(false);
    setError("");
    setStatus("Compiling Office.tsx ...");
    const id = ++generation.current;
    const submitted = draft;
    worker.current.onmessage = (e) => {
      if (e.data.id !== id || latestSource.current !== submitted) {
        setBusy(false);
        return;
      }
      const result = e.data.result as Compiled;
      pending.current = result;
      if (result.errors.length) {
        setBusy(false);
        setStatus("Compile error");
        setError(result.errors[0]);
        setPage("");
        onRobot(
          `I found a wrinkle. ${result.errors[0]} The browser is very literal. It gets that from me.`,
          "confused",
        );
        return;
      }
      token.current = `${exercise.id}-${id}-${Date.now()}`;
      setPage(
        browserDocument(result, token.current, exercise.variant, reduced),
      );
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        setBusy(false);
        setAccepted(false);
        setPage("");
        setError("Program did not respond. Check for endless recursion.");
        onRobot(
          "Your program has taken an unauthorized coffee break. Check for a function that calls itself forever.",
          "confused",
        );
      }, 6000);
    };
    worker.current.postMessage({ id, source: draft, exercise });
  }
  function edit(code: string) {
    setDraft(code);
    latestSource.current = code;
    token.current = "";
    clearTimeout(timeout.current);
    setBusy(false);
    setAccepted(false);
    setStatus("Modified — saved locally");
    onChange(code);
    onKey();
  }
  function getHint() {
    const index = Math.min(hint, exercise.hints.length - 1);
    setHint((h) => h + 1);
    setMenu(null);
    onRobot(
      `Hint ${index + 1}: ${exercise.hints[index]} I have generously refrained from invoicing you.`,
    );
  }
  const items: Record<
    Menu,
    { label: string; key?: string; action: () => void; disabled?: boolean }[]
  > = {
    File: [
      {
        label: "Save",
        key: "Ctrl+S",
        action: () => setStatus("Office.tsx saved on local disk."),
      },
      { label: "Return to desk", action: onExit },
    ],
    Edit: [
      { label: "Undo", key: "Ctrl+Z", action: () => editor.current?.undo() },
      { label: "Redo", key: "Ctrl+Y", action: () => editor.current?.redo() },
      {
        label: "Select all",
        key: "Ctrl+A",
        action: () => editor.current?.selectAll(),
      },
    ],
    Search: [
      {
        label: "Find / Replace...",
        key: "Ctrl+F",
        action: () => editor.current?.find(),
      },
    ],
    Run: [
      { label: "Start", key: "F5", action: run, disabled: busy },
      {
        label: "View output",
        key: "F6",
        action: () => setActive("browser"),
        disabled: !page,
      },
      { label: "Submit repair", action: onPass, disabled: !accepted },
    ],
    Help: [
      { label: "Ask B.U.G.", key: "F1", action: onHelp },
      { label: "Assignment hint", action: getHint },
      {
        label: "Allowed HTML tags",
        action: () =>
          onRobot(
            `The entire tag budget: ${TAGS.map((t) => `<${t}>`).join(", ")}. Capitalized components and fragments are also welcome. We spent the rest on beige plastic.`,
          ),
      },
    ],
  };
  return (
    <div
      className="qbasic-work"
      onKeyDownCapture={(e) => {
        if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && e.key === "Enter")) {
          e.preventDefault();
          e.stopPropagation();
          run();
        } else if (e.key === "F6") {
          e.preventDefault();
          e.stopPropagation();
          if (active === "browser") backToEditor();
          else if (page) setActive("browser");
        } else if (e.key === "F1") {
          e.preventDefault();
          e.stopPropagation();
          onHelp();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          setStatus("Office.tsx saved on local disk.");
        } else if (
          e.altKey &&
          ["f", "e", "s", "r", "h"].includes(e.key.toLowerCase())
        ) {
          e.preventDefault();
          e.stopPropagation();
          setMenu(
            (
              {
                f: "File",
                e: "Edit",
                s: "Search",
                r: "Run",
                h: "Help",
              } as const
            )[e.key.toLowerCase() as "f"],
          );
        } else if (e.key === "Escape" && (menu || active === "browser")) {
          e.preventDefault();
          e.stopPropagation();
          if (menu) {
            setMenu(null);
            editor.current?.focus();
          } else backToEditor();
        }
      }}
    >
      <div className="qbasic-menu" role="menubar" aria-label="Editor menu">
        {(["File", "Edit", "Search", "Run", "Help"] as Menu[]).map((name) => (
          <div className="qbasic-menu-anchor" key={name}>
            <button
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={menu === name}
              onClick={() => setMenu(menu === name ? null : name)}
            >
              <u>{name[0]}</u>
              {name.slice(1)}
            </button>
            {menu === name && (
              <div
                className="qbasic-dropdown"
                role="menu"
                ref={menuPanel}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const buttons = Array.from(
                      e.currentTarget.querySelectorAll<HTMLButtonElement>(
                        "button:not(:disabled)",
                      ),
                    );
                    const index = buttons.indexOf(
                      document.activeElement as HTMLButtonElement,
                    );
                    buttons[
                      (index +
                        (e.key === "ArrowDown" ? 1 : -1) +
                        buttons.length) %
                        buttons.length
                    ]?.focus();
                  }
                }}
              >
                {items[name].map((item) => (
                  <button
                    key={item.label}
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      setMenu(null);
                      item.action();
                    }}
                  >
                    <span>{item.label}</span>
                    <span>{item.key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <span className="qbasic-program">B.U.G. BASIC / React Edition</span>
      </div>
      <div className="qbasic-source" hidden={active !== "editor"}>
        <div className="qbasic-file">
          <span>[■]</span>
          <b>Office.tsx</b>
          <span>React / TSX</span>
        </div>
        <RetroEditor
          ref={editor}
          initialSource={source}
          onChange={edit}
          onRun={run}
          onHelp={onHelp}
          onCursor={(line, column) => setPosition({ line, column })}
        />
        <div className="qbasic-ruler">
          <span>─── {exercise.title} ───</span>
          <span>
            Ln {position.line}, Col {position.column}
          </span>
        </div>
      </div>
      <div className="retro-browser" hidden={active !== "browser"}>
        <div className="retro-browser-title">
          <b>▣ BUGSCAPE Navigator 1.0 — Local Intranet</b>
          <button onClick={backToEditor} aria-label="Close browser">
            [×]
          </button>
        </div>
        <div className="retro-browser-tools">
          <button onClick={backToEditor}>
            ← Editor <small>F6</small>
          </button>
          <button disabled={busy} onClick={run}>
            Reload <small>F5</small>
          </button>
          <span>Location:</span>
          <span className="retro-url">human://office/{exercise.preview}</span>
          <b>▦</b>
        </div>
        <div className="retro-browser-page">
          {error ? (
            <div className="retro-error" role="alert">
              <h2>[ {status.toUpperCase()} ]</h2>
              <p>{error}</p>
              <button onClick={backToEditor}>Return to editor</button>
            </div>
          ) : page ? (
            <iframe
              ref={frame}
              title="Your retro browser"
              sandbox="allow-scripts"
              srcDoc={page}
            />
          ) : (
            <div className="retro-loading">
              <pre>
                {busy
                  ? "Compiling program...\nLoading BUGSCAPE.EXE ...\nPlease enjoy this productive pause."
                  : "No page loaded.\nPress F5 to run your program."}
              </pre>
            </div>
          )}
        </div>
        <div className="retro-browser-status">
          <span>● {status}</span>
          {accepted && <button onClick={onPass}>Repair complete ✓</button>}
        </div>
      </div>
      <div className="qbasic-status">
        <button onClick={onHelp}>F1=Help</button>
        <button aria-label="Run my code" disabled={busy} onClick={run}>
          F5=Run
        </button>
        <button
          onClick={() =>
            active === "browser" ? backToEditor() : page && setActive("browser")
          }
        >
          F6={active === "browser" ? "Editor" : "Output"}
        </button>
        <button onClick={getHint}>Hint</button>
        <span>
          {busy
            ? "Compiling..."
            : active === "editor"
              ? status
              : "Program output"}
        </span>
        <b>INS</b>
      </div>
    </div>
  );
}
