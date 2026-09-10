import type { Assignment } from "../curriculum/types";
import { chapterLines } from "./storyScripts";

export const storyEvents = [
  "briefing",
  "handoff",
  "printing",
  "ready",
  "collected",
  "monitor",
  "missing-paper",
  "paper",
  "help",
  "typing",
  "run",
  "passed",
  "retry",
  "hint",
  "return",
  "finale",
  "aside",
] as const;
export type StoryEvent = (typeof storyEvents)[number];
export type StoryMood = "neutral" | "happy" | "confused";
export type StoryCue = {
  event: StoryEvent;
  page: number;
  detail?: string;
  mood?: StoryMood;
};
export type AssignmentStory = {
  delivery: "waiting" | "printing" | "ready";
  seen: StoryEvent[];
  current: StoryCue;
  pending: StoryCue[];
  aside?: StoryCue;
};
export type StoryContext = {
  assignment: Assignment;
  chapter: number;
  collected: boolean;
  completed: boolean;
};
const once: StoryEvent[] = ["monitor", "paper", "help", "typing", "run"];

export function initialStory(context: StoryContext): AssignmentStory {
  return {
    delivery: context.collected || context.completed ? "ready" : "waiting",
    seen: [],
    current: {
      event: context.completed
        ? "return"
        : context.collected
          ? "collected"
          : "briefing",
      page: 0,
    },
    pending: [],
  };
}
export function dialogueLines(cue: StoryCue, context: StoryContext): string[] {
  return chapterLines(
    cue.event,
    context.assignment,
    context.chapter,
    cue.detail,
  );
}
const isGate = (story: AssignmentStory) =>
  story.delivery === "waiting" &&
  (story.current.event === "briefing" || story.current.event === "handoff");

/** Events may advance the scene, but never bypass the player's print decision. */
export function tellStory(
  story: AssignmentStory,
  event: StoryEvent,
  context: StoryContext,
  detail?: string,
  mood?: StoryMood,
): AssignmentStory {
  if (event === "monitor" && !context.collected && !context.completed)
    return {
      ...story,
      aside: {
        event: "missing-paper",
        page: 0,
        detail: story.delivery,
      },
    };
  if (event === "collected" && story.aside?.event === "missing-paper") {
    const { aside, ...script } = story;
    story = script;
  }
  if (once.includes(event) && story.seen.includes(event)) return story;
  const cue: StoryCue = {
    event,
    page: 0,
    ...(detail ? { detail: detail.slice(0, 1800) } : {}),
    ...(mood ? { mood } : {}),
  };
  // Prop remarks temporarily cover the script without replacing its cursor.
  // Repeated remarks replace each other, so one dismissal always returns to work.
  if (event === "aside") return { ...story, aside: cue };
  const seen = [...new Set([...story.seen, event])];
  const pending = story.pending.filter(
    (item) =>
      item.event !== event &&
      !(event === "passed" && (item.event === "retry" || item.event === "run")),
  );
  const readingTutorial =
    ["monitor", "help"].includes(story.current.event) &&
    story.current.page + 1 < dialogueLines(story.current, context).length;
  if (
    isGate(story) ||
    (story.current.event === "finale" &&
      story.current.page + 1 < dialogueLines(story.current, context).length)
  )
    return { ...story, seen, pending: [...pending, cue] };
  if (event === "typing" && readingTutorial)
    return {
      ...story,
      seen,
      current: cue,
      pending: [{ ...story.current, page: story.current.page + 1 }, ...pending],
    };
  return { ...story, seen, current: cue, pending };
}
export function canContinueStory(
  story: AssignmentStory,
  context: StoryContext,
): boolean {
  return (
    !!story.aside ||
    isGate(story) ||
    story.pending.length > 0 ||
    story.current.page + 1 < dialogueLines(story.current, context).length
  );
}
export function continueStory(
  story: AssignmentStory,
  context: StoryContext,
): AssignmentStory {
  if (story.aside) {
    const { aside, ...script } = story;
    return script;
  }
  if (story.current.page + 1 < dialogueLines(story.current, context).length)
    return {
      ...story,
      current: { ...story.current, page: story.current.page + 1 },
    };
  if (isGate(story) && !context.completed) {
    if (story.current.event === "handoff")
      return { ...story, current: { event: "briefing", page: 0 } };
    return {
      ...story,
      delivery: "printing",
      current: { event: "printing", page: 0 },
    };
  }
  if (story.pending.length)
    return {
      ...story,
      current: story.pending[0],
      pending: story.pending.slice(1),
    };
  return story;
}
export function finishPrinting(
  story: AssignmentStory,
  context: StoryContext,
): AssignmentStory {
  if (story.delivery !== "printing" || context.completed || context.collected)
    return story;
  return tellStory({ ...story, delivery: "ready" }, "ready", context);
}

/** Validate persisted cursors without trusting delivery flags for completed work. */
export function decodeStory(
  raw: unknown,
  context: StoryContext,
): AssignmentStory {
  const fallback = initialStory(context);
  if (!raw || typeof raw !== "object") return fallback;
  const data = raw as Partial<AssignmentStory>;
  const cue = (value: unknown): StoryCue | undefined => {
    if (!value || typeof value !== "object") return undefined;
    const item = value as StoryCue;
    if (!storyEvents.includes(item.event)) return undefined;
    const result: StoryCue = { event: item.event, page: 0 };
    if (typeof item.detail === "string")
      result.detail = item.detail.slice(0, 1800);
    if (["neutral", "happy", "confused"].includes(item.mood ?? ""))
      result.mood = item.mood;
    const pages = dialogueLines(result, context).length;
    result.page = Number.isInteger(item.page)
      ? Math.max(0, Math.min(item.page, pages - 1))
      : 0;
    return result;
  };
  const delivery =
    context.collected || context.completed
      ? "ready"
      : data.delivery === "ready" || data.delivery === "printing"
        ? data.delivery
        : "waiting";
  let current = cue(data.current) ?? fallback.current;
  const remark = cue(data.aside);
  const aside =
    remark?.event === "aside" || remark?.event === "missing-paper"
      ? remark
      : current.event === "aside"
        ? current
        : undefined;
  // Older saves stored prop remarks as the script itself. Recover a task cue.
  if (current.event === "aside")
    current = {
      event:
        context.collected || context.completed || delivery === "waiting"
          ? fallback.current.event
          : delivery === "printing"
            ? "printing"
            : "ready",
      page: 0,
    };
  if (
    context.completed &&
    ["briefing", "handoff", "printing", "ready", "collected"].includes(
      current.event,
    )
  )
    current = { event: "return", page: 0 };
  else if (
    context.collected &&
    ["briefing", "handoff", "printing", "ready"].includes(current.event)
  )
    current = { event: "collected", page: 0 };
  else if (
    delivery === "waiting" &&
    !context.completed &&
    !context.collected &&
    !["briefing", "handoff"].includes(current.event)
  )
    current = { event: "briefing", page: 0 };
  const seen = Array.isArray(data.seen)
    ? [...new Set(data.seen.filter((event) => storyEvents.includes(event)))]
    : [];
  const pending = Array.isArray(data.pending)
    ? data.pending
        .map(cue)
        .filter(
          (item): item is StoryCue =>
            !!item &&
            ![
              "briefing",
              "handoff",
              "printing",
              "ready",
              "collected",
              "finale",
              "aside",
              "missing-paper",
            ].includes(item.event),
        )
        .slice(0, 12)
    : [];
  return { delivery, current, seen, pending, ...(aside ? { aside } : {}) };
}
