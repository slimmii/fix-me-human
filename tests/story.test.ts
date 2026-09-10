import { describe, expect, it } from "vitest";
import { curriculum } from "../src/curriculum";
import {
  canContinueStory,
  continueStory,
  decodeStory,
  dialogueLines,
  finishPrinting,
  initialStory,
  tellStory,
  type StoryContext,
} from "../src/game/story";
import { storyChapters } from "../src/game/storyScripts";
import { decode, fresh } from "../src/progression";
const assignments = curriculum.flatMap((lesson) => lesson.assignments);
const context: StoryContext = {
  assignment: assignments[0],
  chapter: 0,
  collected: false,
  completed: false,
};

describe("B.U.G. story director", () => {
  it("only the player's continuation of a briefing requests printing", () => {
    let story = initialStory(context);
    expect(story.delivery).toBe("waiting");
    expect(finishPrinting(story, context)).toBe(story);
    for (const event of ["help", "typing", "run", "passed"] as const)
      story = tellStory(story, event, context);
    expect(story.current.event).toBe("briefing");
    expect(story.delivery).toBe("waiting");
    story = continueStory(story, context);
    expect(story.delivery).toBe("printing");
    story = finishPrinting(story, context);
    expect(story.delivery).toBe("ready");
    expect(story.current.event).toBe("ready");
    expect(finishPrinting(story, context)).toBe(story);
  });
  it("reminds early computer visitors to collect the paper without consuming the monitor tutorial", () => {
    for (const delivery of ["waiting", "printing", "ready"] as const) {
      const story = { ...initialStory(context), delivery };
      const reminded = tellStory(story, "monitor", context);
      expect(reminded.aside?.event).toBe("missing-paper");
      expect(dialogueLines(reminded.aside!, context)[0]).toMatch(
        /pick up the paper/i,
      );
      expect(reminded.current).toEqual(story.current);
      expect(reminded.delivery).toBe(delivery);
      expect(reminded.seen).not.toContain("monitor");
      expect(reminded.pending).toEqual(story.pending);
      expect(decodeStory(reminded, context).aside).toEqual(reminded.aside);
      expect(continueStory(reminded, context)).toEqual(story);
      expect(tellStory(reminded, "monitor", context)).toEqual(reminded);
      const collected = { ...context, collected: true };
      const pickedUp = tellStory(
        { ...reminded, delivery: "ready" },
        "collected",
        collected,
      );
      expect(pickedUp.aside).toBeUndefined();
      const entered = tellStory(
        { ...pickedUp, delivery: "ready" },
        "monitor",
        collected,
      );
      expect(entered.current.event).toBe("monitor");
    }
    const completed = { ...context, completed: true };
    expect(
      tellStory(initialStory(completed), "monitor", completed).aside,
    ).toBeUndefined();
  });
  it("plays a handoff and briefing before every subsequent print", () => {
    for (const [chapter, assignment] of assignments.entries()) {
      const ctx = { ...context, assignment, chapter };
      let story = initialStory(ctx);
      if (chapter > 0) {
        story.current = {
          event: "handoff",
          page: 0,
          detail: storyChapters[chapter - 1].handoff,
        };
        story = continueStory(story, ctx);
        expect(story.current.event).toBe("briefing");
        expect(story.delivery).toBe("waiting");
      }
      expect(dialogueLines(story.current, ctx)).toEqual([
        assignment.robot!.intro,
      ]);
      expect(canContinueStory(story, ctx)).toBe(true);
      story = continueStory(story, ctx);
      expect(story.delivery).toBe("printing");
    }
  });
  it("encourages typing once and preserves the rest of the interrupted tutorial", () => {
    const ctx = { ...context, collected: true };
    let story = tellStory(initialStory(ctx), "monitor", ctx);
    story = tellStory(story, "typing", ctx);
    expect(story.current.event).toBe("typing");
    expect(story.pending).toEqual([{ event: "monitor", page: 1 }]);
    expect(tellStory(story, "typing", ctx)).toBe(story);
    story = continueStory(story, ctx);
    expect(dialogueLines(story.current, ctx)[story.current.page]).toContain(
      "F1",
    );
    expect(tellStory(story, "monitor", ctx)).toBe(story);
  });
  it("restores the exact dialogue cursor and ready paper without printing again", () => {
    const save = fresh();
    let story = continueStory(initialStory(context), context);
    story = finishPrinting(story, context);
    save.story[save.assignmentId] = story;
    expect(decode(JSON.stringify(save))).toEqual(save);
    const ctx = { ...context, collected: true };
    save.collectedAssignments = [save.assignmentId];
    story = tellStory(story, "help", ctx);
    story = continueStory(story, ctx);
    save.story[save.assignmentId] = story;
    expect(decode(JSON.stringify(save))).toEqual(save);
  });
  it("safely restores old saves and invalid story metadata", () => {
    expect(initialStory({ ...context, collected: true }).current.event).toBe(
      "collected",
    );
    const { story, ...old } = fresh();
    expect(decode(JSON.stringify(old)).story).toEqual({});
    const repaired = decodeStory(
      {
        delivery: "invalid",
        current: { event: "missing", page: 900 },
        pending: [null],
        seen: ["unknown"],
      },
      context,
    );
    expect(repaired).toEqual(initialStory(context));
    const completed = decodeStory(
      { delivery: "printing", current: { event: "briefing", page: 0 } },
      { ...context, completed: true },
    );
    expect(completed.delivery).toBe("ready");
    expect(completed.current.event).toBe("return");
    expect(
      continueStory(completed, { ...context, completed: true }).delivery,
    ).toBe("ready");
  });
  it("authors distinct reactions for every chapter and a finite finale", () => {
    expect(storyChapters).toHaveLength(12);
    for (const event of [
      "collected",
      "monitor",
      "help",
      "typing",
      "paper",
      "run",
    ] as const) {
      const scripts = assignments.map((assignment, chapter) =>
        dialogueLines(
          { event, page: 0 },
          { ...context, assignment, chapter },
        ).join(" "),
      );
      expect(new Set(scripts).size).toBe(12);
      expect(scripts.every((script) => script.trim().length > 30)).toBe(true);
    }
    const ctx = {
      ...context,
      assignment: assignments[11],
      chapter: 11,
      completed: true,
    };
    let story = initialStory(ctx);
    story.current = { event: "finale", page: 0 };
    const interrupted = tellStory(story, "aside", ctx, "A coffee mug.");
    expect(interrupted.current.event).toBe("finale");
    expect(interrupted.aside?.event).toBe("aside");
    expect(continueStory(interrupted, ctx)).toEqual(story);
    story = continueStory(continueStory(story, ctx), ctx);
    expect(canContinueStory(story, ctx)).toBe(false);
    expect(story.delivery).toBe("ready");
  });
  it("dismisses every prop remark back to the exact script page and queue", () => {
    const ctx = { ...context, collected: true };
    for (const event of [
      "briefing",
      "handoff",
      "monitor",
      "help",
      "passed",
      "finale",
    ] as const) {
      const script = {
        ...initialStory(ctx),
        current: {
          event,
          page: event === "monitor" || event === "help" ? 1 : 0,
        },
        pending: [{ event: "run" as const, page: 0 }],
      };
      let interrupted = tellStory(script, "aside", ctx, "Coffee.");
      interrupted = tellStory(interrupted, "aside", ctx, "Fan.", "happy");
      expect(interrupted.aside?.detail).toBe("Fan.");
      expect(canContinueStory(interrupted, ctx)).toBe(true);
      expect(continueStory(interrupted, ctx)).toEqual(script);
    }
  });
  it("never prints when dismissing a remark, and preserves background delivery progress", () => {
    const script = initialStory(context);
    const interrupted = tellStory(script, "aside", context, "Radio.");
    expect(continueStory(interrupted, context)).toEqual(script);
    const printing = continueStory(script, context);
    const ready = finishPrinting(
      tellStory(printing, "aside", context, "Coffee."),
      context,
    );
    expect(ready.aside?.detail).toBe("Coffee.");
    expect(continueStory(ready, context).current.event).toBe("ready");
  });
  it("restores remarks with their script cursor and repairs old off-script saves", () => {
    const ctx = { ...context, collected: true };
    let script = tellStory(initialStory(ctx), "monitor", ctx);
    script = continueStory(script, ctx);
    const interrupted = tellStory(script, "aside", ctx, "Keyboard.");
    expect(decodeStory(interrupted, ctx)).toEqual(interrupted);
    expect(continueStory(decodeStory(interrupted, ctx), ctx)).toEqual(script);
    const legacy = decodeStory(
      {
        ...script,
        current: { event: "aside", page: 0, detail: "Old remark." },
        pending: [{ event: "aside", page: 0 }],
      },
      ctx,
    );
    expect(legacy.aside?.detail).toBe("Old remark.");
    expect(continueStory(legacy, ctx).current.event).toBe("collected");
    expect(legacy.pending).toEqual([]);
  });
});
