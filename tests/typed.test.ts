import { expect, it } from "vitest";
import { compileCode } from "../src/typed-engine";
import { assignment } from "./fixtures/curriculum";
const valid = [
  assignment.solution,
  "export function Welcome(){ return <h1>Sprint board</h1>; }",
  "export const App = () => <h1>Sprint board</h1>;",
  "const App = () => <h1>Sprint board</h1>; export default App;",
  "const App = () => <h1>Sprint board</h1>; export { App };",
  "function App(){return <h1>Sprint board</h1>} export { App as default };",
];
for (const source of valid)
  it(`accepts component export: ${source}`, () => {
    const result = compileCode(source, assignment);
    expect(result.errors).toEqual([]);
    expect(result.checks.every((c) => c.pass)).toBe(true);
  });
it("rejects missing and lowercase exports, non-functions, comments, and a bad default before a good named export", () => {
  for (const source of [
    "",
    "// export function App(){ return <h1>Sprint board</h1> }",
    "function App(){return <h1>Sprint board</h1>}",
    "export default function app(){return <h1>Sprint board</h1>}",
    "export default 42;",
    "export default 42; export function App(){return <h1>Sprint board</h1>}",
  ])
    expect(compileCode(source, assignment).checks.some((c) => !c.pass)).toBe(
      true,
    );
});
it("rejects syntax errors and preserves the sandbox toolbox", () => {
  for (const source of [
    "export default function App(){return <h1>broken}",
    "export default function App(){return <script>bad</script>}",
    'import x from "https://example.com/x"; export default function App(){return <p/>}',
    'export default function App(){return <iframe src="https://example.com"/>}',
    'export default function App(){return <div dangerouslySetInnerHTML={{__html:"bad"}}/>}',
    'export default function App(){fetch("/secret");return <p/>}',
    "export default function App(){while(true){} return <p/>}",
  ])
    expect(compileCode(source, assignment).errors.length).toBeGreaterThan(0);
});
it("allows standard JavaScript constructors in local modules and preserves their behavior", () => {
  const result = compileCode(
    {
      "App.tsx": `import { summarize } from "./board";
export default function App() { return summarize(["Todo", "Todo", "Done"]); }`,
      "board.ts": `export function summarize(titles: string[]) {
  const statuses = new Set(titles);
  const counts = new Map([["unique", statuses.size]]);
  const date = new (Date)("2026-09-10T00:00:00Z");
  const pattern = new RegExp("^Todo$");
  return [counts.get("unique"), date.getUTCFullYear(), pattern.test(titles[0])];
}`,
    },
    assignment,
  );
  expect(result.errors).toEqual([]);
  const exports: Record<string, () => unknown> = {};
  new Function("exports", "require", result.code)(exports, () => ({}));
  expect(exports.default()).toEqual([2, 2026, true]);
});
it("allows a custom context hook to throw new Error with a useful message", () => {
  const result = compileCode(
    `import { createContext, useContext } from "react";
const BoardContext = createContext(null);
function useBoard() {
  const board = useContext(BoardContext);
  if (board === null) throw new Error("useBoard needs a BoardProvider");
  return board;
}
export default function App() { return useBoard(); }`,
    assignment,
  );
  expect(result.errors).toEqual([]);
  const exports: Record<string, () => unknown> = {};
  new Function("exports", "require", result.code)(exports, () => ({
    createContext: () => null,
    useContext: () => null,
  }));
  expect(() => exports.default()).toThrow("useBoard needs a BoardProvider");
});
it.each([
  'new Function("return 1")',
  'new WebSocket("wss://example.com")',
  "new XMLHttpRequest()",
  'new Worker("worker.js")',
  'new EventSource("https://example.com")',
  "new Image()",
  'new (Error.constructor)("return 1")',
])("keeps unsupported constructors blocked: %s", (expression) => {
  const result = compileCode(
    `export default function App(){ ${expression}; return <p/>; }`,
    assignment,
  );
  expect(result.errors.join()).toContain("is not available");
  expect(result.errors.join()).toContain("App.tsx:");
});
it("fails closed for an unregistered source rule", () => {
  const invalid = structuredClone(assignment);
  invalid.validation.source[0].type = "missing" as never;
  expect(compileCode(assignment.solution, invalid).checks[0].pass).toBe(false);
});
