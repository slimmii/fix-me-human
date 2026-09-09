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
export type RetroEditorHandle = {
  focus: () => void;
  undo: () => void;
  redo: () => void;
  find: () => void;
  selectAll: () => void;
};
type Props = {
  initialSource: string;
  onChange: (source: string) => void;
  onRun: () => void;
  onHelp: () => void;
  onCursor: (line: number, column: number) => void;
};

// Keep numbers in the code rows. A separate gutter uses measured screen-space
// heights, which drift under the CRT's perspective transform.
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

const caretScrollKey = {};
function keepCaretVisible(view: EditorView) {
  view.requestMeasure({
    key: caretScrollKey,
    read(view) {
      const { node } = view.domAtPos(view.state.selection.main.head);
      const element = node instanceof Element ? node : node.parentElement;
      const row = element?.closest<HTMLElement>(".cm-line");
      if (!row || !view.scrollDOM.clientHeight) return null;
      return {
        top: view.contentDOM.offsetTop + row.offsetTop,
        height: row.offsetHeight,
      };
    },
    write(row, view) {
      if (!row) return;
      // Use layout coordinates, not the perspective-distorted screen rectangle.
      const viewport = view.scrollDOM;
      if (row.top < viewport.scrollTop) viewport.scrollTop = row.top;
      else if (
        row.top + row.height >
        viewport.scrollTop + viewport.clientHeight
      )
        viewport.scrollTop = row.top + row.height - viewport.clientHeight;
    },
  });
}
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
      const editor = new EditorView({
        parent: host.current,
        state: EditorState.create({
          doc: callbacks.current.initialSource,
          extensions: [
            // Native caret and selection follow the CRT's perspective transform exactly.
            // CodeMirror's separately measured selection layer drifts on a 3D surface.
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
                keepCaretVisible(update.view);
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
              ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
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
      return () => {
        editor.destroy();
        view.current = null;
      };
    }, []);
    return <div className="qbasic-editor" ref={host} />;
  },
);
