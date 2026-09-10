import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  redo,
  selectAll,
  undo,
} from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import {
  HighlightStyle,
  bracketMatching,
  indentUnit,
  syntaxHighlighting,
} from "@codemirror/language";
import {
  highlightSelectionMatches,
  openSearchPanel,
  searchKeymap,
} from "@codemirror/search";
import { EditorState, RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  highlightActiveLine,
  keymap,
  type ViewUpdate,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import terminalControls from "./terminal-controls.css?inline";
export type RetroEditorHandle = {
  focus: () => void;
  undo: () => void;
  redo: () => void;
  find: () => void;
  selectAll: () => void;
};
type Props = {
  initialSource: string;
  fileName: string;
  fileNames: string[];
  onChange: (source: string) => void;
  onRun: () => void;
  onHelp: () => void;
  onCursor: (line: number, column: number) => void;
};

// Keep line numbers in the code rows so they scroll together horizontally.
function numberRows(view: EditorView) {
  const rows = new RangeSetBuilder<Decoration>();
  let previous = -1;
  for (const { from, to } of view.visibleRanges) {
    let line = view.state.doc.lineAt(from);
    while (line.from <= to) {
      if (line.from > previous) {
        rows.add(
          line.from,
          line.from,
          Decoration.line({
            attributes: { "data-line-number": String(line.number) },
          }),
        );
        previous = line.from;
      }
      if (line.to >= view.state.doc.length) break;
      line = view.state.doc.line(line.number + 1);
    }
  }
  return rows.finish();
}
const rowNumbers = ViewPlugin.fromClass(
  class {
    decorations;
    constructor(view: EditorView) {
      this.decorations = numberRows(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged)
        this.decorations = numberRows(update.view);
    }
  },
  { decorations: (plugin) => plugin.decorations },
);

const colors = HighlightStyle.define([
  {
    tag: [tags.keyword, tags.controlKeyword, tags.operatorKeyword],
    color: "#ffffff",
    fontWeight: "bold",
  },
  { tag: [tags.string, tags.attributeValue], color: "#ffff55" },
  { tag: [tags.tagName, tags.typeName], color: "#55ffff" },
  { tag: [tags.attributeName, tags.propertyName], color: "#aaaaaa" },
  { tag: [tags.number, tags.bool, tags.null], color: "#ff55ff" },
  { tag: tags.comment, color: "#55aaaa" },
  { tag: [tags.punctuation, tags.operator], color: "#ffffff" },
]);
export default forwardRef<RetroEditorHandle, Props>(
  function RetroEditor(props, ref) {
    const buffers = useRef(new Map<string, EditorState>());
    const host = useRef<HTMLDivElement>(null);
    const view = useRef<EditorView | null>(null);
    const callbacks = useRef(props);
    callbacks.current = props;
    useImperativeHandle(
      ref,
      () => ({
        focus: () => view.current?.focus(),
        undo: () => {
          if (view.current) undo(view.current);
        },
        redo: () => {
          if (view.current) redo(view.current);
        },
        find: () => {
          if (view.current) openSearchPanel(view.current);
        },
        selectAll: () => {
          if (view.current) {
            selectAll(view.current);
            view.current.focus();
          }
        },
      }),
      [],
    );
    useEffect(() => {
      if (!host.current) return;
      // An iframe keeps the editor's viewport, text measurements, and input
      // coordinates in one flat space while the CRT projects the whole frame.
      const container = host.current;
      const frame = document.createElement("iframe");
      frame.title = "Code editor";
      frame.style.cssText = "display:block;width:100%;height:100%;border:0";
      container.appendChild(frame);
      const doc = frame.contentDocument!;
      doc.open();
      doc.write(
        "<!doctype html><html><head><style>html,body{height:100%;margin:0;overflow:hidden;background:#000080}</style></head><body></body></html>",
      );
      doc.close();
      const controls = doc.createElement("style");
      controls.textContent = terminalControls;
      doc.head.appendChild(controls);
      doc.body.className = "machine-screen";
      const syncFont = () => {
        const style = getComputedStyle(container);
        for (const name of ["--terminal-font-size", "--terminal-line-height"])
          doc.documentElement.style.setProperty(
            name,
            style.getPropertyValue(name),
          );
      };
      syncFont();
      const resize = new ResizeObserver(syncFont);
      resize.observe(container);
      // Keyboard events do not bubble across frames. Preserve the computer's
      // menu shortcuts and Escape handling before CodeMirror processes the key.
      const forwardKey = (event: KeyboardEvent) => {
        const forwarded = new KeyboardEvent("keydown", {
          key: event.key,
          code: event.code,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          altKey: event.altKey,
          shiftKey: event.shiftKey,
          repeat: event.repeat,
          isComposing: event.isComposing,
          bubbles: true,
          cancelable: true,
        });
        if (!container.dispatchEvent(forwarded)) event.preventDefault();
      };
      doc.addEventListener("keydown", forwardKey, true);
      const editor = new EditorView({
        parent: doc.body,
        state:
          buffers.current.get(props.fileName) ??
          EditorState.create({
            doc: callbacks.current.initialSource,
            extensions: [
              rowNumbers,
              EditorView.editorAttributes.compute(["doc"], (state) => ({
                style: `--line-number-width: ${Math.max(3, String(state.doc.lines).length) + 2}ch`,
              })),
              history(),
              highlightActiveLine(),
              bracketMatching(),
              closeBrackets(),
              highlightSelectionMatches(),
              indentUnit.of("  "),
              javascript({ jsx: true, typescript: true }),
              syntaxHighlighting(colors),
              EditorView.contentAttributes.of({
                "aria-label": "Your React code",
                spellcheck: "false",
                autocapitalize: "off",
              }),
              keymap.of([
                {
                  key: "F5",
                  run: () => {
                    callbacks.current.onRun();
                    return true;
                  },
                },
                {
                  key: "Mod-Enter",
                  run: () => {
                    callbacks.current.onRun();
                    return true;
                  },
                },
                {
                  key: "F1",
                  run: () => {
                    callbacks.current.onHelp();
                    return true;
                  },
                },
                indentWithTab,
                ...closeBracketsKeymap,
                ...defaultKeymap,
                ...historyKeymap,
                ...searchKeymap,
              ]),
              EditorView.updateListener.of((update) => {
                if (update.docChanged)
                  callbacks.current.onChange(update.state.doc.toString());
                if (update.docChanged || update.selectionSet) {
                  const pos = update.state.selection.main.head;
                  const line = update.state.doc.lineAt(pos);
                  callbacks.current.onCursor(line.number, pos - line.from + 1);
                }
              }),
              EditorView.theme({
                "&": {
                  height: "100%",
                  backgroundColor: "#000080",
                  color: "#aaaaaa",
                  fontSize: "var(--terminal-font-size)",
                },
                "&.cm-focused": { outline: "none" },
                ".cm-scroller": {
                  fontFamily: '"Courier New", monospace',
                  lineHeight: "var(--terminal-line-height)",
                  overflow: "scroll",
                },
                ".cm-content": {
                  padding: "4px 0",
                  caretColor: "#ffff55",
                  caretShape: "block",
                },
                ".cm-line": {
                  position: "relative",
                  padding: "0 8px 0 calc(var(--line-number-width) + 24px)",
                },
                ".cm-line::before": {
                  content: "attr(data-line-number)",
                  position: "absolute",
                  left: "0",
                  top: "0",
                  width: "var(--line-number-width)",
                  paddingRight: "12px",
                  textAlign: "right",
                  color: "#5555aa",
                  borderRight: "1px solid #5555aa",
                  userSelect: "none",
                  pointerEvents: "none",
                },
                ".cm-activeLine::before": { color: "#ffff55" },
                ".cm-dropCursor": { borderLeft: "2px solid #ffff55" },
                ".cm-activeLine": { backgroundColor: "#ffffff08" },
                ".cm-selectionBackground, &.cm-focused .cm-selectionBackground":
                  {
                    backgroundColor: "#5555aa!important",
                  },
                ".cm-matchingBracket": {
                  backgroundColor: "#00aaaa",
                  color: "#000080",
                },
                ".cm-panels": {
                  backgroundColor: "#aaaaaa",
                  color: "#000000",
                  fontFamily: '"Courier New", monospace',
                  fontSize: "var(--terminal-font-size)",
                },
                ".cm-textfield": {
                  borderRadius: "0",
                  backgroundColor: "#000080",
                  color: "#ffff55",
                  border: "1px solid #ffffff",
                },
                ".cm-button": {
                  backgroundImage: "none",
                  backgroundColor: "#aaaaaa",
                  color: "#000000",
                  borderRadius: "0",
                  border: "2px outset #dddddd",
                  fontFamily: "inherit",
                },
                ".cm-searchMatch": {
                  backgroundColor: "#aa5500",
                  outline: "1px solid #ffff55",
                },
              }),
            ],
          }),
      });
      view.current = editor;
      const cursor = editor.state.selection.main.head;
      const line = editor.state.doc.lineAt(cursor);
      callbacks.current.onCursor(line.number, cursor - line.from + 1);
      return () => {
        if (callbacks.current.fileNames.includes(props.fileName))
          buffers.current.set(props.fileName, editor.state);
        editor.destroy();
        doc.removeEventListener("keydown", forwardKey, true);
        resize.disconnect();
        frame.remove();
        view.current = null;
      };
    }, [props.fileName]);
    useEffect(() => {
      for (const name of buffers.current.keys()) {
        if (!props.fileNames.includes(name)) buffers.current.delete(name);
      }
    }, [props.fileNames]);
    return (
      <div
        className="qbasic-editor"
        style={{ position: "relative" }}
        ref={host}
      />
    );
  },
);
