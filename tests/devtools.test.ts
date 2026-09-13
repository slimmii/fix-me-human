import { describe, expect, it } from "vitest";
import { assignments, prepareAssignment } from "../src/devtools/state";
import { decode, fresh } from "../src/progression";

describe("development checkpoints", () => {
  it("unlocks every checkpoint with complete solution files and survives save decoding", () => {
    for (const [index, { assignment }] of assignments.entries()) {
      const save = prepareAssignment(fresh(), index + 1, "solution");
      expect(save.completed).toEqual(
        assignments.slice(0, index).map(({ assignment }) => assignment.id),
      );
      expect(save.projects[assignment.id].files).toEqual(
        assignment.solutionFiles ?? { "App.tsx": assignment.solution },
      );
      expect(save.completed).not.toContain(assignment.id);
      expect(decode(JSON.stringify(save))).toEqual(save);
    }
  });

  it("preserves existing work, including empty legacy drafts, when jumping", () => {
    const save = fresh();
    save.drafts[assignments[0].assignment.id] = "";
    save.projects[assignments[2].assignment.id] = {
      files: { "App.tsx": "// my code", "Notes.ts": "// notes" },
      activeFile: "Notes.ts",
    };
    const before = structuredClone(save);
    const next = prepareAssignment(save, 3);
    expect(next.projects[next.assignmentId]).toEqual(
      save.projects[next.assignmentId],
    );
    expect(next.drafts[assignments[0].assignment.id]).toBe("");
    expect(next.projects[assignments[1].assignment.id].files).toEqual(
      assignments[1].assignment.solutionFiles,
    );
    expect(save).toEqual(before);
  });

  it("restores an exact starter, removes extra files, and can revisit completed work", () => {
    let save = prepareAssignment(fresh(), assignments.length, "solution");
    save = prepareAssignment(save, 3, "starter");
    expect(save.projects[save.assignmentId].files).toEqual(
      assignments[2].assignment.starterFiles,
    );
    expect(save.revisitingAssignment).toBe(true);
    const restored = decode(JSON.stringify(save));
    expect(restored).toEqual({
      ...save,
      collectedAssignments: expect.arrayContaining(save.collectedAssignments),
    });
  });

  it("rejects invalid targets without modifying the save", () => {
    const save = fresh();
    for (const target of [
      0,
      -1,
      1.5,
      NaN,
      assignments.length + 1,
      "missing",
      "toString",
    ]) {
      expect(() => prepareAssignment(save, target)).toThrow(
        "Unknown assignment",
      );
    }
    expect(save).toEqual(fresh());
  });
});
