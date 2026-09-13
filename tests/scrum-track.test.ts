import { describe, expect, it } from "vitest";
import { curriculum, validateCurriculum } from "../src/curriculum";
import { courseTopics, unlockedTopics } from "../src/course";
import { compileCode } from "../src/typed-engine";
import { decode, fresh, transition } from "../src/progression";
import { validRuntimeRule, type RuntimeRule } from "../src/validation/types";

const assignments = curriculum.flatMap((lesson) => lesson.assignments);
describe("complete Scrum board course", () => {
  it("introduces search after inputs and carries it through callbacks, editing and context", () => {
    expect(assignments.slice(5).map((assignment) => assignment.id)).toEqual([
      "task-input",
      "board-search",
      "task-callbacks",
      "task-editing",
      "board-context",
      "board-effects",
    ]);
    const completed = assignments
      .slice(0, 6)
      .map((assignment) => assignment.id);
    expect(unlockedTopics(completed).at(-1)?.id).toBe("derived-state");
    expect(unlockedTopics([...completed, "board-search"]).at(-1)?.id).toBe(
      "component-callbacks",
    );
    const search = assignments[6];
    expect(search.solutionFiles!["App.tsx"]).toContain("[query, setQuery]");
    expect(Object.keys(search.solutionFiles!)).not.toContain(
      "TasksContext.tsx",
    );
    expect(search.validation.source).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "useContext" })]),
    );
    for (const assignment of assignments.slice(6)) {
      expect(assignment.validation.runtime.map((rule) => rule.label)).toContain(
        "Search stays active while additions update visible cards and full totals",
      );
    }
  });
  it("preserves earlier completion credits across the moved search checkpoint and reloads", () => {
    const completed = assignments
      .slice(0, 9)
      .filter((assignment) => assignment.id !== "board-search")
      .map((assignment) => assignment.id);
    const project = {
      files: assignments[8].solutionFiles!,
      activeFile: "TaskCard.tsx",
    };
    const restored = decode(
      JSON.stringify({
        ...fresh(),
        curriculumRevision: 1,
        phase: "coding",
        lessonId: "sprint-9",
        assignmentId: "board-context",
        completed,
        collectedAssignments: completed,
        readAssignments: completed,
        projects: { "task-editing": project },
      }),
    );
    expect(restored.assignmentId).toBe("board-search");
    expect(restored.completed).toEqual(completed);
    expect(restored.collectedAssignments).toEqual(completed);
    expect(restored.readAssignments).toEqual(completed);
    expect(restored.projects["task-editing"]).toEqual(project);
    expect(decode(JSON.stringify(restored))).toEqual(restored);
    const continued = decode(
      JSON.stringify(transition(restored, { type: "submit" })),
    );
    expect(continued.assignmentId).toBe("board-context");
    expect(continued.completed).toEqual(
      assignments.slice(0, 9).map((a) => a.id),
    );
    expect(continued.curriculumRevision).toBe(2);
  });
  it("provides 11 incremental checkpoints with material available before each task", () => {
    expect(assignments).toHaveLength(11);
    expect(courseTopics.flatMap((topic) => topic.pages)).toHaveLength(22);
    let save = transition(fresh(), { type: "enter" });
    for (const [index, assignment] of assignments.entries()) {
      expect(save.assignmentId).toBe(assignment.id);
      expect(Object.values(assignment.solutionFiles!).join("\n")).not.toMatch(
        /className\s*=|style\s*=|useTaskBoard|useTasks/,
      );
      expect(assignment.starterCode).toBe(assignments[index - 1]?.solution);
      expect(assignment.multiFile).toBe(index >= 3);
      if (index < 3)
        expect(Object.keys(assignment.solutionFiles!)).toEqual(["App.tsx"]);
      expect(unlockedTopics(save.completed)).toHaveLength(index + 1);
      expect(
        compileCode(assignment.solutionFiles!, assignment).checks.every(
          (check) => check.pass,
        ),
      ).toBe(true);
      save = transition(save, {
        type: "project",
        project: { files: assignment.solutionFiles!, activeFile: "App.tsx" },
      });
      save = transition(save, { type: "submit" });
      expect(save.completed).toHaveLength(index + 1);
      save = decode(JSON.stringify(save));
    }
    expect(save.phase).toBe("complete");
    expect(Object.keys(save.drafts)).toHaveLength(11);
  });
  it("requires distinct introductions, success and retry reactions for every exercise", () => {
    for (const kind of ["intro", "success", "retry"] as const) {
      expect(
        new Set(assignments.map((assignment) => assignment.robot?.[kind])).size,
      ).toBe(11);
      const broken = structuredClone(curriculum);
      broken[0].assignments[0].robot![kind] = "";
      expect(() => validateCurriculum(broken)).toThrow("Incomplete assignment");
    }
  });
  it("unlocks modules after columns and requires files only in the fourth assignment", () => {
    const beforeColumns = assignments
      .slice(0, 2)
      .map((assignment) => assignment.id);
    expect(
      unlockedTopics(beforeColumns).map((topic) => topic.id),
    ).not.toContain("modules");
    const afterColumns = [...beforeColumns, "board-columns"];
    expect(unlockedTopics(afterColumns).map((topic) => topic.id)).toContain(
      "modules",
    );
    expect(unlockedTopics(afterColumns).map((topic) => topic.id)).not.toContain(
      "react-state",
    );
    expect(
      unlockedTopics([...afterColumns, "board-modules"]).map(
        (topic) => topic.id,
      ),
    ).toContain("react-state");
    const singleFile = assignments[2].solutionFiles!;
    expect(
      compileCode(singleFile, assignments[2]).checks.every(
        (check) => check.pass,
      ),
    ).toBe(true);
    expect(
      compileCode(singleFile, assignments[3])
        .checks.filter((check) => !check.pass)
        .map((check) => check.label),
    ).toEqual([
      "Import TaskCard.tsx into the project",
      "Import BoardColumn.tsx into the project",
      "Share task types from tasks.ts",
    ]);
    expect(assignments[3].starterFiles).toEqual(singleFile);
  });
  it("credits previously completed combined columns work once without skipping modules for new saves", () => {
    const legacy = {
      ...fresh(),
      curriculumRevision: undefined,
      phase: "complete",
      lessonId: "sprint-11",
      assignmentId: "board-effects",
      completed: assignments
        .filter((assignment) => assignment.id !== "board-modules")
        .map((assignment) => assignment.id),
      projects: {
        "board-columns": {
          files: assignments[3].solutionFiles!,
          activeFile: "TaskCard.tsx",
        },
      },
      collectedAssignments: ["board-columns"],
      readAssignments: ["board-columns"],
    };
    const restored = decode(JSON.stringify(legacy));
    expect(restored.completed).toHaveLength(11);
    expect(restored.phase).toBe("complete");
    expect(restored.projects["board-modules"]).toEqual(
      legacy.projects["board-columns"],
    );
    expect(decode(JSON.stringify(restored))).toEqual(restored);
    let save = transition(fresh(), { type: "enter" });
    for (let index = 0; index < 3; index++)
      save = transition(save, { type: "submit" });
    const current = decode(JSON.stringify(save));
    expect(current.assignmentId).toBe("board-modules");
    expect(current.completed).not.toContain("board-modules");
  });
  it("starts a separate course for old example saves rather than awarding unrelated completion", () => {
    expect(
      decode(
        JSON.stringify({ ...fresh(), version: 3, completed: ["hello-bug"] }),
      ),
    ).toEqual(fresh());
  });
  it("finishes saves on the retired layout assignment while preserving their latest project", () => {
    for (const phase of ["coding", "complete"] as const) {
      const save = fresh();
      const files = {
        ...assignments.at(-1)!.solutionFiles!,
        "Notes.ts": "// My final notes",
      };
      Object.assign(save, {
        phase,
        lessonId: "sprint-12",
        assignmentId: "scrum-board",
        completed: [
          ...assignments.map((assignment) => assignment.id),
          ...(phase === "complete" ? ["scrum-board"] : []),
        ],
        collectedAssignments: [
          ...assignments.map((assignment) => assignment.id),
          "scrum-board",
        ],
        revisitingAssignment: phase === "complete",
        projects: { "scrum-board": { files, activeFile: "Notes.ts" } },
      });
      const restored = decode(JSON.stringify(save));
      expect(restored.phase).toBe("complete");
      expect(restored.assignmentId).toBe("board-effects");
      expect(restored.lessonId).toBe("sprint-11");
      expect(restored.completed).toHaveLength(11);
      expect(restored.projects["board-effects"].files).toEqual(files);
      expect(restored.collectedAssignments).not.toContain("scrum-board");
      expect(decode(JSON.stringify(restored))).toEqual(restored);
    }
  });
  it("resumes retired hook work at context without awarding context completion", () => {
    const files = {
      ...assignments[8].solutionFiles!,
      "Notes.ts": "// Keep my edits",
    };
    const save = {
      ...fresh(),
      phase: "coding",
      lessonId: "sprint-8",
      assignmentId: "use-task-board",
      completed: [
        ...assignments.slice(0, 9).map((assignment) => assignment.id),
        "use-task-board",
      ],
      projects: { "use-task-board": { files, activeFile: "Notes.ts" } },
    };
    const restored = decode(JSON.stringify(save));
    expect(restored.assignmentId).toBe("board-context");
    expect(restored.phase).toBe("coding");
    expect(restored.completed).toEqual(
      assignments.slice(0, 9).map((assignment) => assignment.id),
    );
    expect(restored.projects["board-context"].files).toEqual(files);
    expect(
      unlockedTopics(restored.completed).map((topic) => topic.id),
    ).toContain("react-context");
    expect(decode(JSON.stringify(restored))).toEqual(restored);
  });
  it("keeps later completed work and existing context drafts when removing the hook checkpoint", () => {
    const projects = Object.fromEntries(
      assignments.map((assignment) => [
        assignment.id,
        { files: assignment.solutionFiles!, activeFile: "App.tsx" },
      ]),
    );
    const restored = decode(
      JSON.stringify({
        ...fresh(),
        phase: "complete",
        lessonId: "sprint-11",
        assignmentId: "board-effects",
        completed: [
          ...assignments.map((assignment) => assignment.id),
          "use-task-board",
        ],
        projects,
      }),
    );
    expect(restored.phase).toBe("complete");
    expect(restored.completed).toHaveLength(11);
    expect(restored.projects).toEqual(projects);
  });
  it("ignores hook and component names mentioned only in comments or strings", () => {
    const assignment = assignments[9];
    const fake = `// createContext(); useContext(); useState();\nconst words = "TaskCard BoardColumn AddTask";\nexport default function App(){return <h1>Sprint board</h1>}`;
    expect(
      compileCode(fake, assignment).checks.filter((check) => !check.pass),
    ).toHaveLength(assignment.validation.source.length - 1);
  });
  it("rejects malformed runtime scenarios and layout rules", () => {
    for (const rule of [
      { type: "interaction", label: "Empty", steps: [] },
      {
        type: "interaction",
        label: "Invalid step",
        steps: [{ action: "hover", selector: "button" }],
      },
      {
        type: "interaction",
        label: "Negative count",
        steps: [{ action: "expect", selector: "li", count: -1 }],
      },
      {
        type: "column-layout",
        label: "Missing dimensions",
        selector: "section",
        count: 3,
      },
    ])
      expect(validRuntimeRule(rule as RuntimeRule)).toBe(false);
  });
});
