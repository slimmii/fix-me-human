import { describe, expect, it } from "vitest";
import { curriculum } from "../src/curriculum";
import {
  assignmentProject,
  decode,
  fresh,
  transition,
} from "../src/progression";
import { compileCode } from "../src/typed-engine";
import { decodeProject, singleFileProject } from "../src/project";

const assignments = curriculum.flatMap((lesson) => lesson.assignments);
const columns = assignments[2];
describe("project persistence", () => {
  it("migrates Office.tsx projects and their local imports without overwriting App.tsx", () => {
    const legacy = {
      files: {
        "Office.tsx": "export const title = 'Sprint board';",
        "Card.tsx":
          'import { title } from "./Office"; export { title } from "./Office.tsx";',
      },
      activeFile: "Office.tsx",
    };
    const saved = fresh();
    saved.projects["board-shell"] = legacy;
    const project = assignmentProject(
      decode(JSON.stringify(saved)),
      "board-shell",
    );
    expect(project.activeFile).toBe("App.tsx");
    expect(project.files["App.tsx"]).toBe(legacy.files["Office.tsx"]);
    expect(project.files["Office.tsx"]).toBeUndefined();
    expect(project.files["Card.tsx"]).toBe(
      'import { title } from "./App"; export { title } from "./App.tsx";',
    );
    expect(
      decodeProject({
        files: { "App.tsx": "new", "Office.tsx": "old" },
        activeFile: "App.tsx",
      })?.files,
    ).toEqual({ "App.tsx": "new", "Office.tsx": "old" });
  });

  it("loads legacy drafts as App.tsx and preserves intentional empty files", () => {
    const legacy = {
      ...fresh(),
      phase: "coding",
      drafts: { "board-shell": "" },
    };
    const save = decode(JSON.stringify(legacy));
    expect(assignmentProject(save, "board-shell")).toEqual(
      singleFileProject(""),
    );
    expect(
      decodeProject({
        files: { "App.tsx": "", "Empty.tsx": "" },
        activeFile: "Missing.tsx",
      })?.activeFile,
    ).toBe("App.tsx");
    expect(
      decodeProject({
        files: { "../App.tsx": "bad" },
        activeFile: "../App.tsx",
      }),
    ).toBeUndefined();
  });
  it("carries every file forward, isolates revisits, restores selection and resets all files on replay", () => {
    let save = transition(fresh(), { type: "enter" });
    save = transition(transition(save, { type: "submit" }), { type: "submit" });
    const project = {
      files: { ...columns.solutionFiles!, "Empty.tsx": "" },
      activeFile: "TaskCard.tsx",
    };
    save = transition(save, { type: "project", project });
    save = transition(save, { type: "submit" });
    expect(assignmentProject(save, "task-state")).toEqual(project);
    save = transition(save, { type: "open-assignment", id: "board-columns" });
    save = transition(save, {
      type: "project",
      project: {
        ...project,
        files: { ...project.files, "TaskCard.tsx": "changed" },
      },
    });
    save = decode(JSON.stringify(save));
    expect(assignmentProject(save, "board-columns").activeFile).toBe(
      "TaskCard.tsx",
    );
    expect(assignmentProject(save, "task-state")).toEqual(project);
    save = transition(save, { type: "replay", id: "board-columns" });
    expect(assignmentProject(save, "board-columns").files).toEqual(
      columns.starterFiles,
    );
  });
});

describe("local module compiler", () => {
  it("runs isolated modules, named/default exports, shared types, and re-exports", () => {
    const result = compileCode(
      {
        "App.tsx":
          'import { answer } from "./barrel"; export default function App() { return answer; }',
        "barrel.ts": 'export { default as answer } from "./answer.ts";',
        "answer.ts":
          'import type { Answer } from "./types"; const answer: Answer = 42; export default answer;',
        "types.ts": "export type Answer = number;",
      },
      assignments[0],
    );
    expect(result.errors).toEqual([]);
    const exports: Record<string, () => number> = {};
    new Function("exports", "require", result.code)(exports, () => ({}));
    expect(exports.default()).toBe(42);
  });
  it("reports the module filename for syntax errors and rejects missing/external imports", () => {
    for (const source of [
      'import X from "./Missing";',
      'import X from "other-package";',
      'export { X } from "https://example.com/x";',
    ]) {
      expect(
        compileCode({ "App.tsx": source }, assignments[0]).errors.join(),
      ).toContain("App.tsx: Cannot find module");
    }
    expect(
      compileCode(
        {
          "App.tsx": 'import "./Broken";',
          "Broken.tsx": "export const broken = <div>;",
        },
        assignments[0],
      ).errors.join(),
    ).toContain("Broken.tsx: Line");
  });
  it("checks all connected modules but does not award credit for disconnected files", () => {
    const good = compileCode(columns.solutionFiles!, columns);
    expect(good.errors).toEqual([]);
    expect(good.checks.every((check) => check.pass)).toBe(true);
    const disconnected = compileCode(
      {
        ...columns.solutionFiles!,
        "App.tsx":
          "export default function App() { return <h1>Sprint board</h1>; }",
      },
      columns,
    );
    expect(
      disconnected.checks.filter((check) => !check.pass).length,
    ).toBeGreaterThanOrEqual(5);
  });
  it("recognizes component aliases in imports across module scopes", () => {
    const files = { ...columns.solutionFiles! };
    files["BoardColumn.tsx"] = files["BoardColumn.tsx"]
      .replace("import { TaskCard }", "import { TaskCard as Card }")
      .replace("<TaskCard ", "<Card ");
    expect(
      compileCode(files, columns).checks.every((check) => check.pass),
    ).toBe(true);
    files["TaskCard.tsx"] = files["TaskCard.tsx"].replace(
      "export function TaskCard",
      "export default function TaskCard",
    );
    files["BoardColumn.tsx"] = files["BoardColumn.tsx"].replace(
      "import { TaskCard as Card }",
      "import Card",
    );
    expect(
      compileCode(files, columns).checks.every((check) => check.pass),
    ).toBe(true);
  });
  it("retains sandbox restrictions inside imported modules", () => {
    const result = compileCode(
      {
        "App.tsx":
          'import "./Bad"; export default function App(){return <h1>Sprint board</h1>}',
        "Bad.ts": 'fetch("https://example.com");',
      },
      assignments[0],
    );
    expect(result.errors.join()).toContain(
      "Bad.ts: This office browser supports local React code only",
    );
  });
});
