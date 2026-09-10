import { describe, expect, it } from "vitest";
import { compileCode } from "../src/typed-engine";
import { readableRuntimeError } from "../src/sandbox/errors";

const assignment = { validation: { source: [], runtime: [] } };

describe("player-facing import errors", () => {
  it.each([
    ["TasksProvider", "TaskProvider"],
    ["TaskProvider", "TasksProvider"],
    ["TasksProvider", "tasksProvider"],
  ])("explains importing %s when the file exports %s", (imported, exported) => {
    const result = compileCode(
      {
        "App.tsx": `// My board\nimport { ${imported} } from "./TasksContext";\nexport default function App() { return <${imported}><h1>Sprint board</h1></${imported}>; }`,
        "TasksContext.tsx": `export function ${exported}({ children }) { return children; }`,
      },
      assignment,
    );
    expect(result.errors).toEqual([
      `App.tsx: Line 2: "TasksContext.tsx" does not export "${imported}". Did you mean "${exported}"? Named imports and exports must use exactly the same spelling, including capital letters.`,
    ]);
  });

  it("explains named versus default imports in both directions", () => {
    expect(
      compileCode(
        {
          "App.tsx": 'import TasksProvider from "./TasksContext";',
          "TasksContext.tsx": "export function TasksProvider() {}",
        },
        assignment,
      ).errors[0],
    ).toContain('import { TasksProvider } from "./TasksContext"');
    expect(
      compileCode(
        {
          "App.tsx":
            'import { TasksProvider as Provider } from "./TasksContext";',
          "TasksContext.tsx": "export default function TasksProvider() {}",
        },
        assignment,
      ).errors[0],
    ).toContain('import Provider from "./TasksContext"');
  });

  it("reports missing exports and misspelled re-exports at their source", () => {
    expect(
      compileCode(
        {
          "App.tsx": 'import { TasksProvider } from "./TasksContext";',
          "TasksContext.tsx": "function TasksProvider() {}",
        },
        assignment,
      ).errors[0],
    ).toContain('Add an export for "TasksProvider" in "TasksContext.tsx"');
    expect(
      compileCode(
        {
          "App.tsx": 'import { TasksProvider } from "./barrel";',
          "barrel.ts":
            'export { TaskProvider as TasksProvider } from "./TasksContext";',
          "TasksContext.tsx": "export function TasksProvider() {}",
        },
        assignment,
      ).errors,
    ).toEqual([
      'barrel.ts: Line 1: "TasksContext.tsx" does not export "TaskProvider". Did you mean "TasksProvider"? Named imports and exports must use exactly the same spelling, including capital letters.',
    ]);
  });

  it("accepts aliases, type exports, namespace imports and chained re-exports", () => {
    const result = compileCode(
      {
        "App.tsx": `import Provider, { TasksProvider as BoardProvider } from "./barrel";
import * as Context from "./TasksContext";
import type { Props, BoardProps } from "./barrel";
import { createContext } from "react";
export default function App() { return <Provider><BoardProvider><Context.TasksProvider /></BoardProvider></Provider>; }`,
        "barrel.ts":
          'export * from "./other"; export { TasksProvider as default } from "./TasksContext";',
        "other.ts":
          'export * from "./TasksContext"; export type { Props as BoardProps } from "./TasksContext";',
        "TasksContext.tsx":
          "export interface Props { children: unknown } export const TasksProvider = ({ children }: Props) => children;",
      },
      assignment,
    );
    expect(result.errors).toEqual([]);
  });

  it("resolves export-star cycles and JavaScript modules", () => {
    expect(
      compileCode(
        {
          "App.tsx": 'import { TasksProvider } from "./one";',
          "one.js": 'export * from "./two";',
          "two.jsx":
            'export * from "./one"; export function TasksProvider() { return <div />; }',
        },
        assignment,
      ).errors,
    ).toEqual([]);
  });
});

it("replaces React's invalid-component error code with guidance and preserves other errors", () => {
  const message = readableRuntimeError(
    "Minified React error #130; visit https://react.dev/errors/130?args[]=undefined&args[]=",
  );
  expect(message).toContain("React could not render a component");
  expect(message).toContain("Named exports use braces");
  expect(message).not.toContain("Minified");
  expect(readableRuntimeError("useTasks needs a TasksProvider")).toBe(
    "useTasks needs a TasksProvider",
  );
});
