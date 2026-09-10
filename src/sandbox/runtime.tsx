import { evaluateRuntimeRules } from "../validation/runtime";
import type { RuntimeRule } from "../validation/types";
import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createRuntimeErrorFormatter } from "./errors";
import type { CompiledSource, GeneratedLocation } from "./source-location";
let failed = false;
let checking = false;
const notify = (type: string, detail = "") => {
  if (type === "error") failed = true;
  parent.postMessage(
    { channel: "human-preview", type, detail, token: window.__TOKEN },
    "*",
  );
};
declare global {
  interface Window {
    __TOKEN: string;
    __RULES: RuntimeRule[];
    __REACT: typeof React;
    __mount: (component: React.ComponentType) => void;
    __SOURCES: CompiledSource[];
    __SCRIPT_OFFSET: number;
    __reportError: (
      error: unknown,
      fallback?: GeneratedLocation,
      componentStack?: string,
    ) => void;
  }
}
const formatError = createRuntimeErrorFormatter(
  window.__SOURCES,
  window.__SCRIPT_OFFSET,
);
window.__reportError = (error, fallback, componentStack) =>
  notify("error", formatError(error, fallback, componentStack));
const allowed = [
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
window.__REACT = {
  ...React,
  createElement: (
    type: React.ElementType,
    props: Record<string, unknown> | null,
    ...children: React.ReactNode[]
  ) => {
    if (type == null)
      throw Error(
        `React could not render a component because its value is ${String(type)}. Check the component name in your JSX and its import/export: spelling and capital letters must match exactly. Named exports use braces in the import; default exports do not.`,
      );
    if (typeof type === "string" && !allowed.includes(type))
      throw Error(`<${type}> is not in our tiny toolbox.`);
    if (
      props &&
      [
        "dangerouslySetInnerHTML",
        "src",
        "srcDoc",
        "href",
        "action",
        "formAction",
      ].some((key) => key in props)
    )
      throw Error("That attribute is outside the little browser toolbox.");
    return React.createElement(type, props, ...children);
  },
} as typeof React;
window.addEventListener("keydown", (e) => {
  if (e.key === "F6" || e.key === "Escape") {
    e.preventDefault();
    notify("editor");
  }
});
window.addEventListener("error", (e) =>
  window.__reportError(e.error ?? e.message, {
    fileName: e.filename,
    line: e.lineno,
    column: e.colno,
  }),
);
window.addEventListener("unhandledrejection", (e) =>
  window.__reportError(e.reason),
);
class Boundary extends React.Component<
  { children: React.ReactNode },
  { error: string }
> {
  state = { error: "" };
  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }
  componentDidCatch(e: Error, info: React.ErrorInfo) {
    window.__reportError(e, undefined, info.componentStack ?? "");
  }
  render() {
    return this.state.error ? (
      <p>Oops. {this.state.error}</p>
    ) : (
      this.props.children
    );
  }
}
const output = (text: string) => {
  if (checking) return;
  const box = document.getElementById("browser-console");
  if (box) box.textContent = text;
};
window.alert = (message) => output("📬 " + String(message));
console.log = (...items: unknown[]) =>
  output("BROWSER SAYS: " + items.map(String).join(" "));
window.__mount = (Component) => {
  if (typeof Component !== "function") {
    notify(
      "error",
      "Export a function component so the browser knows what to display.",
    );
    return;
  }
  const reactRoot = createRoot(document.getElementById("app")!);
  let mount = 0;
  const reset = async () => {
    document.title = "";
    flushSync(() =>
      reactRoot.render(
        <Boundary key={mount++}>
          <Component />
        </Boundary>,
      ),
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 25));
  };
  void reset();
  setTimeout(async () => {
    if (failed) return;
    const root = document.getElementById("app")!;
    checking = true;
    let checks;
    try {
      checks = await evaluateRuntimeRules(root, window.__RULES, reset);
    } finally {
      checking = false;
    }
    if (failed) return;
    notify(
      "rendered",
      JSON.stringify({
        text: root.innerText,
        checks,
        valid: checks.length > 0 && checks.every((check) => check.pass),
      }),
    );
  }, 150);
};
