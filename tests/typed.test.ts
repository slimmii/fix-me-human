import { expect, it } from "vitest";
import { compileCode } from "../src/typed-engine";
import { assignment } from "./fixtures/curriculum";
const valid = [
  assignment.solution,
  "export function Welcome(){ return <h1>Hello B.U.G.</h1>; }",
  "export const App = () => <h1>Hello B.U.G.</h1>;",
  "const App = () => <h1>Hello B.U.G.</h1>; export default App;",
  "const App = () => <h1>Hello B.U.G.</h1>; export { App };",
  "function App(){return <h1>Hello B.U.G.</h1>} export { App as default };",
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
    "// export function App(){ return <h1>Hello B.U.G.</h1> }",
    "function App(){return <h1>Hello B.U.G.</h1>}",
    "export default function app(){return <h1>Hello B.U.G.</h1>}",
    "export default 42;",
    "export default 42; export function App(){return <h1>Hello B.U.G.</h1>}",
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
it("fails closed for an unregistered source rule", () => {
  const invalid = structuredClone(assignment);
  invalid.validation.source[0].type = "missing" as never;
  expect(compileCode(assignment.solution, invalid).checks[0].pass).toBe(false);
});
