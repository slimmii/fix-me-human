import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { curriculum, validateCurriculum } from "../src/curriculum";
import { courseTopics, unlockedTopics, validateCourse } from "../src/course";
import {
  availableAssignments,
  decode,
  fresh,
  lessonDone,
  transition,
  unlocked,
} from "../src/progression";
import {
  assignment,
  codingSave,
  fixtureCurriculum as lessons,
} from "./fixtures/curriculum";

describe("independent tasks and course topics", () => {
  it("provides readable task briefs and a separate topic library", () => {
    expect(assignment.starterCode).toBeUndefined();
    for (const lesson of curriculum) {
      expect(lesson).not.toHaveProperty("screens");
      for (const task of lesson.assignments)
        expect(
          readFileSync(`src/curriculum/${task.brief}`, "utf8").trim().length,
        ).toBeGreaterThan(30);
    }
    for (const topic of courseTopics)
      for (const page of topic.pages)
        expect(
          readFileSync(`src/${page.markdown}`, "utf8").trim().length,
        ).toBeGreaterThan(30);
  });
  it("rejects invalid task definitions", () => {
    expect(() => validateCurriculum(lessons)).not.toThrow();
    for (const change of [
      (c: typeof lessons) => {
        c.push(c[0]);
      },
      (c: typeof lessons) => {
        c[0].title = "";
      },
      (c: typeof lessons) => {
        c[0].assignments = [];
      },
      (c: typeof lessons) => {
        c[1].assignments[0].id = c[0].assignments[0].id;
      },
      (c: typeof lessons) => {
        c[0].assignments[0].validation.source[0].type = "missing" as never;
      },
      (c: typeof lessons) => {
        c[0].assignments[0].validation.runtime[0].type = "missing" as never;
      },
    ]) {
      const copy = structuredClone(lessons);
      change(copy);
      expect(() => validateCurriculum(copy)).toThrow();
    }
  });
  it("rejects missing prerequisites, duplicate IDs, and empty topics", () => {
    expect(() => validateCourse(courseTopics)).not.toThrow();
    for (const change of [
      (c: typeof courseTopics) => {
        c[1].unlockAfter = ["not-a-task"];
      },
      (c: typeof courseTopics) => {
        c[1].id = c[0].id;
      },
      (c: typeof courseTopics) => {
        c[1].pages[0].id = c[0].pages[0].id;
      },
      (c: typeof courseTopics) => {
        c[1].pages = [];
      },
      (c: typeof courseTopics) => {
        c[1].pages[0].markdown = "";
      },
    ]) {
      const copy = structuredClone(courseTopics);
      change(copy);
      expect(() => validateCourse(copy)).toThrow();
    }
  });
  it("grows Help through task completion, and never relocks it when revisiting or replaying", () => {
    let save = transition(fresh(), { type: "enter" });
    expect(unlockedTopics(save.completed).map((t) => t.id)).toEqual([
      "react-basics",
    ]);
    save = transition(save, { type: "pass" });
    expect(unlockedTopics(save.completed).map((t) => t.id)).toEqual([
      "react-basics",
      "component-props",
    ]);
    save = transition(save, { type: "open-assignment", id: "task-card" });
    save = transition(save, { type: "pass" });
    const earned = unlockedTopics(save.completed);
    expect(earned).toHaveLength(3);
    save = transition(save, { type: "open-assignment", id: "board-shell" });
    save = transition(save, { type: "replay", id: "board-shell" });
    expect(unlockedTopics(save.completed)).toEqual(earned);
    expect(unlockedTopics(decode(JSON.stringify(save)).completed)).toEqual(
      earned,
    );
  });
});

describe("task progression", () => {
  it("pins submitted work through saved completion and automatically starts the next unfinished task", () => {
    let save = transition(fresh(lessons), { type: "enter" }, lessons);
    save = transition(save, { type: "submit" }, lessons);
    expect(save.completed).toEqual([assignment.id]);
    expect(save.assignmentId).toBe("with-skeleton");
    expect(save.phase).toBe("coding");
    save = decode(JSON.stringify(save), lessons);
    expect(save.completed).toEqual([assignment.id]);
    save = transition(save, { type: "submit" }, lessons);
    expect(save.assignmentId).toBe("another-assignment");
    save = transition(save, { type: "submit" }, lessons);
    expect(save.phase).toBe("complete");
    expect(save.completed).toEqual([
      assignment.id,
      "with-skeleton",
      "another-assignment",
    ]);
    expect(transition(save, { type: "submit" }, lessons)).toBe(save);
  });
  it("opens directly in the editor and unlocks tasks through completion", () => {
    let save = fresh(lessons);
    expect(unlocked(save, "second-lesson", lessons)).toBe(false);
    expect(
      availableAssignments(save, lessons).map((t) => t.assignment.id),
    ).toEqual([assignment.id]);
    save = transition(save, { type: "enter" }, lessons);
    expect(save.phase).toBe("coding");
    save = transition(save, { type: "pass" }, lessons);
    expect(lessonDone(save, lessons[0])).toBe(true);
    save = transition(save, { type: "continue" }, lessons);
    expect(save.phase).toBe("complete");
    save = transition(save, { type: "continue" }, lessons);
    expect(save.lessonId).toBe("second-lesson");
    expect(save.phase).toBe("coding");
    expect(save.assignmentId).toBe("with-skeleton");
    save = transition(save, { type: "pass" }, lessons);
    expect(lessonDone(save, lessons[1])).toBe(false);
    save = transition(save, { type: "continue" }, lessons);
    expect(save.assignmentId).toBe("another-assignment");
    save = transition(save, { type: "pass" }, lessons);
    save = transition(save, { type: "continue" }, lessons);
    expect(lessonDone(save, lessons[1])).toBe(true);
    expect(transition(save, { type: "continue" }, lessons)).toEqual(save);
  });
  it("opens previous tasks across lessons without erasing any saved code or completion", () => {
    let save = transition(fresh(lessons), { type: "enter" }, lessons);
    save = transition(
      save,
      { type: "draft", code: assignment.solution },
      lessons,
    );
    save = transition(save, { type: "pass" }, lessons);
    save = transition(
      save,
      { type: "open-assignment", id: "with-skeleton" },
      lessons,
    );
    save = transition(
      save,
      { type: "draft", code: "unfinished second task" },
      lessons,
    );
    const drafts = save.drafts;
    save = transition(
      save,
      { type: "open-assignment", id: assignment.id },
      lessons,
    );
    expect(save.phase).toBe("coding");
    expect(save.lessonId).toBe(lessons[0].id);
    expect(save.completed).toEqual([assignment.id]);
    expect(save.drafts).toEqual(drafts);
    save = decode(JSON.stringify(save), lessons);
    save = transition(
      save,
      { type: "open-assignment", id: "with-skeleton" },
      lessons,
    );
    expect(save.drafts).toEqual(drafts);
  });
  it("blocks unknown and future tasks, including later tasks in an unlocked lesson", () => {
    let save = fresh(lessons);
    for (const id of ["not-a-task", "with-skeleton", "another-assignment"])
      expect(transition(save, { type: "open-assignment", id }, lessons)).toBe(
        save,
      );
    save = transition(
      transition(save, { type: "enter" }, lessons),
      { type: "pass" },
      lessons,
    );
    expect(
      transition(
        save,
        { type: "open-assignment", id: "another-assignment" },
        lessons,
      ),
    ).toBe(save);
  });
  it("replay is explicitly different from Open: only replay resets the selected draft", () => {
    let save = codingSave("unfinished code");
    save = transition(save, { type: "pass" });
    save = transition(save, { type: "open-assignment", id: assignment.id });
    expect(save.drafts[assignment.id]).toBe("unfinished code");
    save = transition(save, { type: "replay", id: assignment.id });
    expect(save.drafts[assignment.id]).toBe("");
    expect(save.completed).toContain(assignment.id);
  });
});

describe("v4 saves", () => {
  it("resumes the next unfinished task when an old save still selects completed work", () => {
    const save = codingSave("saved solution");
    save.completed = [assignment.id];
    save.collectedAssignments = [assignment.id];
    save.readAssignments = [assignment.id];
    for (const phase of ["coding", "review", "complete"] as const) {
      const restored = decode(JSON.stringify({ ...save, phase }));
      expect(restored.assignmentId).toBe("task-card");
      expect(restored.phase).toBe("coding");
      expect(restored.completed).toEqual(save.completed);
      expect(restored.drafts).toEqual(save.drafts);
      expect(restored.collectedAssignments).toEqual(save.collectedAssignments);
      expect(restored.readAssignments).toEqual(save.readAssignments);
      expect(restored.collectedAssignments).not.toContain(
        restored.assignmentId,
      );
    }
  });
  it("preserves deliberately reopened completed tasks across reloads", () => {
    let save = transition(codingSave(), { type: "submit" });
    save = transition(save, { type: "open-assignment", id: assignment.id });
    expect(decode(JSON.stringify(save))).toEqual(save);
    expect(save.revisitingAssignment).toBe(true);
  });
  it("does not invent a new printout when every task is completed", () => {
    const save = fresh();
    save.completed = curriculum.flatMap((lesson) =>
      lesson.assignments.map((task) => task.id),
    );
    expect(decode(JSON.stringify(save)).phase).toBe("complete");
  });
  it("restores collected paper and whether it has been read", () => {
    const save = codingSave("unfinished code");
    save.collectedAssignments = [assignment.id];
    const unread = decode(JSON.stringify(save));
    expect(unread.collectedAssignments).toEqual([assignment.id]);
    expect(unread.readAssignments).toEqual([]);
    save.readAssignments = [assignment.id];
    expect(decode(JSON.stringify(save))).toEqual(save);
  });
  it("loads older saves without paper history and preserves their progress", () => {
    const { collectedAssignments, readAssignments, ...old } =
      codingSave("saved code");
    expect(decode(JSON.stringify(old))).toEqual({
      ...old,
      collectedAssignments: [],
      readAssignments: [],
    });
  });
  it("ignores invalid paper history and only restores read sheets that were collected", () => {
    const save = fresh();
    expect(
      decode(
        JSON.stringify({
          ...save,
          collectedAssignments: [
            assignment.id,
            assignment.id,
            "missing",
            "task-card",
            null,
          ],
          readAssignments: [assignment.id, "task-card", 12],
        }),
      ),
    ).toEqual({
      ...save,
      collectedAssignments: [assignment.id],
      readAssignments: [assignment.id],
    });
    expect(
      decode(
        JSON.stringify({
          ...save,
          collectedAssignments: "invalid",
          readAssignments: [assignment.id],
        }),
      ),
    ).toEqual(save);
  });
  it("migrates old teaching metadata without losing drafts, completion, or settings", () => {
    for (const phase of ["onboarding", "teaching", "brief"] as const) {
      const old = {
        ...fresh(),
        phase,
        screenId: "tsx",
        taught: ["hello-react"],
        reviewReturn: "coding",
        completed: [assignment.id],
        drafts: { [assignment.id]: "unfinished" },
        settings: { mute: true, reducedMotion: true, crt: true },
      };
      const loaded = transition(decode(JSON.stringify(old)), { type: "enter" });
      expect(loaded.phase).toBe("coding");
      expect(loaded.drafts[assignment.id]).toBe("unfinished");
      expect(loaded.completed).toEqual([assignment.id]);
      expect(loaded.settings).toEqual(old.settings);
      expect(loaded).not.toHaveProperty("screenId");
    }
  });
  it("round trips settings, current task, drafts and completion", () => {
    const save = codingSave(assignment.solution);
    save.settings.crt = true;
    expect(decode(JSON.stringify(save))).toEqual(save);
  });
  it("starts fresh for old and corrupt saves", () => {
    for (const raw of [
      null,
      "{",
      "null",
      "[]",
      '{"version":2,"settings":{"mute":true}}',
      '{"version":99}',
    ])
      expect(decode(raw)).toEqual(fresh());
  });
  it("rejects impossible progress, removed IDs and invalid phases", () => {
    const save = {
      ...fresh(lessons),
      lessonId: "second-lesson",
      assignmentId: "another-assignment",
      phase: "complete",
      completed: ["another-assignment"],
    };
    const result = decode(JSON.stringify(save), lessons);
    expect(result.lessonId).toBe(lessons[0].id);
    expect(result.completed).toEqual([]);
    expect(result.phase).toBe("coding");
    expect(
      decode(JSON.stringify({ ...codingSave(), phase: "review" })).phase,
    ).toBe("coding");
    expect(unlockedTopics(result.completed)).toHaveLength(1);
  });
});
