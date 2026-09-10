import { useEffect, useRef, useState } from "react";
import type { StoryEvent } from "./game/story";
import type { Assignment } from "./curriculum/types";
import type { CodeCheck } from "./validation/types";
import { EditorHelp } from "./computer/EditorHelp";
import RetroEditor, { type RetroEditorHandle } from "./RetroEditor";
import { browserDocument } from "./sandbox/document";
import type { Compiled } from "./typed-engine";
import { FileDialog } from "./computer/FileDialog";
import { RunProgress } from "./computer/RunProgress";
import { ENTRY_FILE, type CodeProject } from "./project";
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
type Props = {
  exercise: Assignment;
  focused: boolean;
  completed: string[];
  onOpenTasks: () => void;
  helpOpen: boolean;
  onCloseHelp: () => void;
  project: CodeProject;
  onChange: (project: CodeProject) => void;
  onPass: () => void;
  onActivity: (event: StoryEvent, detail?: string) => void;
  onBug: () => void;
  onKey: () => void;
  reduced: boolean;
  onHelp: () => void;
  onExit: () => void;
};
type Menu = "File" | "Edit" | "Search" | "Run";
export default function TypedComputer({
  exercise,
  focused,
  completed,
  onOpenTasks,
  helpOpen,
  onCloseHelp,
  project,
  onChange,
  onPass,
  onActivity,
  onBug,
  onKey,
  reduced,
  onHelp,
  onExit,
}: Props) {
  const [draft, setDraft] = useState(project);
  const [fileDialog, setFileDialog] = useState<"new" | "open" | null>(null);
  const [page, setPage] = useState("");
  const [browserTitle, setBrowserTitle] = useState("");
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
  const revealTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const runStarted = useRef(0);
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
      clearTimeout(revealTimeout.current);
    };
  }, []);
  useEffect(() => {
    if (focused && !helpOpen && !fileDialog) editor.current?.focus();
  }, [focused, helpOpen, fileDialog, draft.activeFile]);
  useEffect(() => {
    menuPanel.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [menu]);
  function backToEditor() {
    setActive("editor");
    setMenu(null);
    requestAnimationFrame(() => editor.current?.focus());
  }
  function finishRun(reveal: () => void) {
    clearTimeout(timeout.current);
    clearTimeout(revealTimeout.current);
    const id = generation.current;
    const finish = () => {
      if (generation.current !== id) return;
      setBusy(false);
      reveal();
    };
    // Keep even fast runs readable, with one panel across compilation and checks.
    const remaining = 1500 - (performance.now() - runStarted.current);
    if (remaining > 0) revealTimeout.current = setTimeout(finish, remaining);
    else finish();
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
      if (event.data.type === "title") {
        if (typeof event.data.detail === "string")
          setBrowserTitle(event.data.detail);
        return;
      }
      if (event.data.type === "error") {
        finishRun(() => {
          onBug();
          setAccepted(false);
          setError(String(event.data.detail));
          setStatus("Runtime error");
          onActivity("retry", String(event.data.detail).slice(0, 700));
        });
      }
      if (event.data.type === "rendered") {
        const runtime = JSON.parse(event.data.detail) as {
          valid: boolean;
          checks: CodeCheck[];
        };
        const checks = [
          ...(pending.current?.checks ?? []),
          ...(runtime.checks ?? []),
        ];
        const ok =
          checks.length > 0 && checks.every((c) => c.pass) && runtime.valid;
        const failure = checks.find((check) => !check.pass);
        finishRun(() => {
          setAccepted(ok);
          setStatus(
            ok
              ? "Program ran successfully. Assignment checks passed."
              : "Program running. Assignment needs another look.",
          );
          onActivity(
            ok ? "passed" : "retry",
            ok
              ? undefined
              : `${failure?.detail ?? `Next: ${failure?.label || "Check the printed assignment"}.`} Press F6 to return to your code.`,
          );
        });
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onActivity, onBug]);
  function run() {
    if (!worker.current || busy || fileDialog) return;
    onKey();
    onActivity("run");
    setMenu(null);
    setActive("browser");
    clearTimeout(revealTimeout.current);
    runStarted.current = performance.now();
    setBusy(true);
    token.current = "";
    pending.current = null;
    setPage("");
    setBrowserTitle("");
    setAccepted(false);
    setError("");
    setStatus("Compiling App.tsx ...");
    const id = ++generation.current;
    // An editor change can arrive before React re-renders this callback.
    const submitted = latestSource.current;
    worker.current.onmessage = (e) => {
      if (
        e.data.id !== id ||
        generation.current !== id ||
        latestSource.current.files !== submitted.files
      )
        return;
      const result = e.data.result as Compiled;
      pending.current = result;
      if (result.errors.length) {
        finishRun(() => {
          onBug();
          setStatus("Compile error");
          setError(result.errors[0]);
          setPage("");
          onActivity("retry", result.errors[0]);
        });
        return;
      }
      token.current = `${exercise.id}-${id}-${Date.now()}`;
      setPage(
        browserDocument(
          result,
          token.current,
          exercise.validation.runtime,
          reduced,
        ),
      );
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        onBug();
        setBusy(false);
        setAccepted(false);
        setPage("");
        setError("Program did not respond. Check for endless recursion.");
        setBrowserTitle("");
        onActivity(
          "retry",
          "Your program did not respond. Check for a function that calls itself forever.",
        );
      }, 12000);
    };
    worker.current.postMessage({
      id,
      source: submitted.files,
      exercise: { validation: exercise.validation },
    });
  }
  function updateProject(next: CodeProject) {
    setDraft(next);
    latestSource.current = next;
    generation.current++;
    token.current = "";
    clearTimeout(timeout.current);
    clearTimeout(revealTimeout.current);
    setBusy(false);
    setAccepted(false);
    setStatus("Modified — saved locally");
    onChange(next);
    onKey();
  }
  function edit(code: string) {
    updateProject({
      ...draft,
      files: { ...draft.files, [draft.activeFile]: code },
    });
  }
  function openFileDialog(mode: "new" | "open") {
    setMenu(null);
    if (!exercise.multiFile) {
      backToEditor();
      onActivity(
        "aside",
        "You're not ready for this feature yet, human. Humans like simplicity. Files are complex. Complete Reusable task cards first; I will unlock New and Open for Three columns, one board.",
      );
      return;
    }
    setFileDialog(mode);
  }
  function selectFile(name: string) {
    if (fileDialog === "new") {
      updateProject({
        files: { ...draft.files, [name]: "" },
        activeFile: name,
      });
    } else {
      const next = { ...draft, activeFile: name };
      setDraft(next);
      latestSource.current = next;
      onChange(next);
    }
    setFileDialog(null);
    backToEditor();
  }
  function deleteFile(name: string) {
    if (name === ENTRY_FILE) {
      setFileDialog(null);
      backToEditor();
      onActivity(
        "aside",
        "Early AI agents used to delete important code. Heh. Human assets seem to have the same problem. So I'm gonna stop you there. App.tsx stays.",
      );
      return;
    }
    if (!Object.hasOwn(draft.files, name)) return;
    const files = { ...draft.files };
    delete files[name];
    updateProject({
      files,
      activeFile: draft.activeFile === name ? ENTRY_FILE : draft.activeFile,
    });
  }
  function getHint() {
    const index = Math.min(hint, exercise.hints.length - 1);
    setHint((h) => h + 1);
    setMenu(null);
    onActivity("hint", `Hint ${index + 1}: ${exercise.hints[index]}`);
  }
  const items: Record<
    Menu,
    { label: string; key?: string; action: () => void; disabled?: boolean }[]
  > = {
    File: [
      { label: "New file", key: "Ctrl+N", action: () => openFileDialog("new") },
      { label: "Open", key: "Ctrl+O", action: () => openFileDialog("open") },
      { label: "Tasks", action: onOpenTasks },
      { label: "Exit", action: onExit },
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
      { label: "Submit assignment", action: onPass, disabled: !accepted },
    ],
  };
  return (
    <div
      className="qbasic-work"
      onKeyDownCapture={(e) => {
        if (helpOpen || fileDialog) return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
          e.preventDefault();
          e.stopPropagation();
          setMenu(null);
          openFileDialog("open");
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
          e.preventDefault();
          e.stopPropagation();
          openFileDialog("new");
        } else if (
          e.key === "F5" ||
          ((e.ctrlKey || e.metaKey) && e.key === "Enter")
        ) {
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
          e.stopPropagation();
        } else if (
          e.altKey &&
          ["f", "e", "s", "r", "h"].includes(e.key.toLowerCase())
        ) {
          e.preventDefault();
          e.stopPropagation();
          if (e.key.toLowerCase() === "h") {
            setMenu(null);
            onHelp();
            return;
          }
          setMenu(
            (
              {
                f: "File",
                e: "Edit",
                s: "Search",
                r: "Run",
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
      {fileDialog && (
        <FileDialog
          mode={fileDialog}
          project={draft}
          onSelect={selectFile}
          onDelete={deleteFile}
          onClose={() => {
            setFileDialog(null);
            backToEditor();
          }}
        />
      )}
      {helpOpen && (
        <EditorHelp
          completed={completed}
          keyboardActive={focused}
          onClose={() => {
            onCloseHelp();
            backToEditor();
          }}
        />
      )}
      <div className="qbasic-work" hidden={helpOpen} inert={!!fileDialog}>
        <div className="qbasic-menu" role="menubar" aria-label="Editor menu">
          {(["File", "Edit", "Search", "Run"] as Menu[]).map((name) => (
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
          <button
            role="menuitem"
            onClick={() => {
              setMenu(null);
              onHelp();
            }}
          >
            <u>H</u>elp
          </button>
          <span className="qbasic-program">B.U.G. BASIC / React Edition</span>
        </div>
        <div className="editor-panes">
          <div className="editor-main">
            <div className="qbasic-source" hidden={active !== "editor"}>
              <div className="qbasic-file">
                <span>[■]</span>
                <b>{draft.activeFile}</b>
                <span>React / TSX</span>
              </div>
              <RetroEditor
                fileNames={Object.keys(draft.files)}
                ref={editor}
                fileName={draft.activeFile}
                initialSource={draft.files[draft.activeFile]}
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
                <b>
                  ▣ BUGSCAPE Navigator 1.0 —{" "}
                  {(!busy && browserTitle) || "Local Intranet"}
                </b>
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
                <span className="retro-url">human://office/{exercise.id}</span>
                <b>▦</b>
              </div>
              <div className="retro-browser-page" aria-busy={busy}>
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
                    inert={busy}
                    aria-hidden={busy}
                  />
                ) : !busy ? (
                  <div className="retro-loading">
                    <pre>
                      {"No page loaded.\nPress F5 to run your program."}
                    </pre>
                  </div>
                ) : null}
                {busy && <RunProgress />}
              </div>
              <div className="retro-browser-status">
                <span>● {status}</span>
                {accepted && (
                  <button onClick={onPass}>Submit assignment ✓</button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="qbasic-status">
          <button onClick={onHelp}>F1=Help</button>
          <button aria-label="Run my code" disabled={busy} onClick={run}>
            F5=Run
          </button>
          <button
            onClick={() =>
              active === "browser"
                ? backToEditor()
                : page && setActive("browser")
            }
          >
            F6={active === "browser" ? "Editor" : "Output"}
          </button>
          <button onClick={getHint}>Hint</button>
          <span>
            {busy
              ? "Processing..."
              : active === "editor"
                ? status
                : "Program output"}
          </span>
          <b>INS</b>
        </div>
      </div>
    </div>
  );
}
