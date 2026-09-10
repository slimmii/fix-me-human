import { describe, expect, it } from "vitest";
import ts from "typescript";
import { curriculum } from "../src/curriculum";
import {
  assignmentSource,
  decode,
  fresh,
  transition,
} from "../src/progression";
import { fixtureCurriculum } from "./fixtures/curriculum";

const assignments = curriculum.flatMap((lesson) => lesson.assignments);

describe("starter code", () => {
  it("inherits the player's code across lessons and preserves it after revisits and reloads", () => {
    const code = assignments[0].solution.replace("Sprint board", "My board");
    let save = transition(fresh(), { type: "enter" });
    save = transition(save, { type: "draft", code });
    save = transition(save, { type: "submit" });
    expect(save.drafts[assignments[1].id]).toBe(code);
    save = transition(save, { type: "open-assignment", id: assignments[0].id });
    save = transition(save, { type: "draft", code: "changed earlier work" });
    save = transition(save, { type: "open-assignment", id: assignments[1].id });
    expect(
      assignmentSource(decode(JSON.stringify(save)), assignments[1].id),
    ).toBe(code);
    save = transition(save, { type: "draft", code: "" });
    expect(assignmentSource(save, assignments[1].id)).toBe("");
  });

  it("inherits code through Continue within a lesson", () => {
    let save = transition(
      fresh(fixtureCurriculum),
      { type: "enter" },
      fixtureCurriculum,
    );
    save = transition(save, { type: "submit" }, fixtureCurriculum);
    save = transition(
      save,
      { type: "draft", code: "player code" },
      fixtureCurriculum,
    );
    save = transition(save, { type: "pass" }, fixtureCurriculum);
    save = transition(save, { type: "continue" }, fixtureCurriculum);
    expect(save.drafts["another-assignment"]).toBe("player code");
  });

  it("uses authored fallbacks only when the preceding completed draft is unavailable", () => {
    const save = fresh();
    const second = assignments[1];
    expect(assignmentSource(save, assignments[0].id)).toBe("");
    expect(assignmentSource(save, second.id)).toBe(second.starterCode);
    save.drafts[assignments[0].id] = "uncompleted work";
    expect(assignmentSource(save, second.id)).toBe(second.starterCode);
    save.completed.push(assignments[0].id);
    expect(assignmentSource(save, second.id)).toBe("uncompleted work");
    save.drafts[assignments[0].id] = "";
    expect(assignmentSource(save, second.id)).toBe("");
  });

  it("uses interfaces and multiline JSX in every authored checkpoint", () => {
    for (const assignment of assignments) {
      expect(assignment.solution).not.toMatch(/return\s+</);
      const ast = ts.createSourceFile(
        "starter.tsx",
        assignment.solution,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      );
      function visit(node: ts.Node) {
        if (ts.isTypeAliasDeclaration(node)) {
          expect(node.name.text).toBe("TaskStatus");
          expect(ts.isUnionTypeNode(node.type)).toBe(true);
        }
        if (ts.isJsxElement(node)) {
          const opening = ast.getLineAndCharacterOfPosition(
            node.openingElement.end,
          ).line;
          const closing = ast.getLineAndCharacterOfPosition(
            node.closingElement.getStart(ast),
          ).line;
          if (
            node.children.some(
              (child) =>
                ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child),
            )
          ) {
            expect(closing).toBeGreaterThan(opening);
          }
        }
        ts.forEachChild(node, visit);
      }
      visit(ast);
    }
  });
});
