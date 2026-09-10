import { useEffect, useRef, useState } from "react";
import {
  ENTRY_FILE,
  MAX_FILES,
  validFileName,
  type CodeProject,
} from "../project";

type Props = {
  mode: "new" | "open";
  project: CodeProject;
  onSelect: (name: string) => void;
  onDelete: (name: string) => void;
  onClose: () => void;
};
export function FileDialog({
  mode,
  project,
  onSelect,
  onDelete,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(project.activeFile);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const panel = useRef<HTMLFormElement>(null);
  const names = Object.keys(project.files).sort();
  useEffect(() => {
    panel.current
      ?.querySelector<HTMLElement>(
        deleting ? "[data-cancel-delete]" : "input, select",
      )
      ?.focus();
  }, [deleting]);
  function confirmDelete() {
    if (!deleting || deleting === ENTRY_FILE) return;
    onDelete(deleting);
    setSelected(
      deleting === project.activeFile ? ENTRY_FILE : project.activeFile,
    );
    setDeleting(null);
  }
  function submit() {
    if (mode === "open") {
      onSelect(selected);
      return;
    }
    const fileName = /\.[^.]+$/.test(name.trim())
      ? name.trim()
      : `${name.trim()}.tsx`;
    if (!validFileName(fileName)) {
      setError(
        "Start with a letter. Use letters, numbers, - or _ and .ts, .tsx, .js or .jsx.",
      );
    } else if (
      names.some((file) => file.toLowerCase() === fileName.toLowerCase())
    ) {
      setError("That file already exists. Choose Open to edit it.");
    } else if (names.length >= MAX_FILES) {
      setError(`This project already has ${MAX_FILES} files.`);
    } else onSelect(fileName);
  }
  return (
    <div
      className="qbasic-dialog-shade"
      onKeyDown={(event) => {
        event.stopPropagation();
        if (
          (event.ctrlKey || event.metaKey) &&
          ["n", "o", "s"].includes(event.key.toLowerCase())
        )
          event.preventDefault();
        if (event.key === "Escape") {
          event.preventDefault();
          if (deleting) setDeleting(null);
          else onClose();
        }
        if (deleting && !event.ctrlKey && !event.metaKey && !event.altKey) {
          if (event.key.toLowerCase() === "y") {
            event.preventDefault();
            confirmDelete();
          } else if (event.key.toLowerCase() === "n") {
            event.preventDefault();
            setDeleting(null);
          }
        }
        if (event.key === "Tab") {
          const controls = Array.from(
            panel.current!.querySelectorAll<HTMLElement>(
              "input, select, button:not(:disabled)",
            ),
          );
          const index = controls.indexOf(document.activeElement as HTMLElement);
          if (
            (event.shiftKey && index <= 0) ||
            (!event.shiftKey && index === controls.length - 1)
          ) {
            event.preventDefault();
            controls[event.shiftKey ? controls.length - 1 : 0]?.focus();
          }
        }
      }}
    >
      <form
        ref={panel}
        role={deleting ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby="file-dialog-title"
        aria-describedby={deleting ? "delete-file-message" : undefined}
        className="qbasic-file-dialog"
        onSubmit={(event) => {
          event.preventDefault();
          if (!deleting) submit();
        }}
      >
        <h2 id="file-dialog-title">
          {deleting ? "Delete file" : mode === "new" ? "New file" : "Open file"}
        </h2>
        {deleting ? (
          <>
            <div id="delete-file-message">
              <p>Delete C:\REACT\{deleting}?</p>
              <p>
                This file and its contents will be lost. This cannot be undone.
              </p>
            </div>
            <div className="qbasic-dialog-actions">
              <button type="button" onClick={confirmDelete}>
                <u>Y</u>es
              </button>
              <button
                type="button"
                data-cancel-delete
                onClick={() => setDeleting(null)}
              >
                <u>N</u>o
              </button>
            </div>
            <small>Y=Yes · N=No · Esc=Cancel</small>
          </>
        ) : (
          <>
            <p>Directory: C:\REACT</p>
            {mode === "new" ? (
              <>
                <label htmlFor="new-file-name">File name:</label>
                <input
                  id="new-file-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  placeholder="BoardColumn.tsx"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby="file-dialog-note"
                />
                <p id="file-dialog-note">
                  No extension? .tsx is added automatically.
                </p>
              </>
            ) : (
              <>
                <label htmlFor="open-file-name">Files:</label>
                <select
                  id="open-file-name"
                  size={Math.min(8, Math.max(4, names.length))}
                  value={selected}
                  onChange={(event) => setSelected(event.target.value)}
                  onDoubleClick={submit}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      submit();
                    }
                  }}
                >
                  {names.map((file) => (
                    <option key={file} value={file}>
                      {file}
                      {file === project.activeFile ? "  ◄ open" : ""}
                    </option>
                  ))}
                </select>
              </>
            )}
            {error && <p role="alert">{error}</p>}
            <p>One file open at a time. Changes save automatically.</p>
            <div className="qbasic-dialog-actions">
              <button type="submit">
                {mode === "new" ? "Create" : "Open"}
              </button>
              {mode === "open" && (
                <button
                  type="button"
                  onClick={() => {
                    if (selected === ENTRY_FILE) onDelete(selected);
                    else setDeleting(selected);
                  }}
                >
                  Delete
                </button>
              )}
              <button type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
            <small>Enter=OK · Esc=Cancel</small>
          </>
        )}
      </form>
    </div>
  );
}
