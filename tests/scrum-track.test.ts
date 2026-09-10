import { describe, expect, it } from "vitest";
import { curriculum, validateCurriculum } from "../src/curriculum";
import { courseTopics, unlockedTopics } from "../src/course";
import { compileCode } from "../src/typed-engine";
import { decode, fresh, transition } from "../src/progression";
import { validRuntimeRule, type RuntimeRule } from "../src/validation/types";

const assignments = curriculum.flatMap((lesson) => lesson.assignments);
describe("complete Scrum board course", () => {
  it("provides 12 incremental checkpoints with material available before each task", () => {
    expect(assignments).toHaveLength(12);
    expect(courseTopics.flatMap((topic) => topic.pages)).toHaveLength(26);
    let save = transition(fresh(), { type: "enter" });
    for (const [index, assignment] of assignments.entries()) {
      expect(save.assignmentId).toBe(assignment.id);
      expect(assignment.starterCode).toBe(assignments[index - 1]?.solution);
      expect(unlockedTopics(save.completed)).toHaveLength(
        index + 1 + (index >= 2 ? 1 : 0),
      );
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
    expect(Object.keys(save.drafts)).toHaveLength(12);
  });
  it("requires distinct introductions, success and retry reactions for every exercise", () => {
    for (const kind of ["intro", "success", "retry"] as const) {
      expect(
        new Set(assignments.map((assignment) => assignment.robot?.[kind])).size,
      ).toBe(12);
      const broken = structuredClone(curriculum);
      broken[0].assignments[0].robot![kind] = "";
      expect(() => validateCurriculum(broken)).toThrow("Incomplete assignment");
    }
  });
  it("starts a separate course for old example saves rather than awarding unrelated completion", () => {
    expect(
      decode(
        JSON.stringify({ ...fresh(), version: 3, completed: ["hello-bug"] }),
      ),
    ).toEqual(fresh());
  });
  it("ignores hook and component names mentioned only in comments or strings", () => {
    const assignment = assignments[7];
    const fake = `// useTaskBoard(); useState();\nconst words = "TaskCard BoardColumn AddTask";\nexport default function App(){return <h1>Sprint board</h1>}`;
    expect(
      compileCode(fake, assignment).checks.filter((check) => !check.pass),
    ).toHaveLength(8);
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
