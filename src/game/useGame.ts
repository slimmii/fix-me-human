import { useCallback, useEffect, useState } from "react";
import { sound } from "../audio";
import { curriculum } from "../curriculum";
import {
  lessonDone,
  loadSave,
  persist,
  transition,
  type Action,
  type Save,
} from "../progression";
import {
  canContinueStory,
  continueStory,
  dialogueLines,
  finishPrinting,
  initialStory,
  tellStory,
  type StoryContext,
  type StoryEvent,
  type StoryMood,
} from "./story";
import { storyChapters } from "./storyScripts";

const assignments = curriculum.flatMap((lesson) => lesson.assignments);
function contextFor(save: Save): StoryContext {
  const chapter = assignments.findIndex(
    (assignment) => assignment.id === save.assignmentId,
  );
  return {
    chapter,
    assignment: assignments[chapter],
    collected: save.collectedAssignments.includes(save.assignmentId),
    completed: save.completed.includes(save.assignmentId),
  };
}
function storyFor(save: Save) {
  const context = contextFor(save);
  const story = save.story[save.assignmentId] ?? initialStory(context);
  if (
    save.phase === "complete" &&
    !save.revisitingAssignment &&
    !save.story[save.assignmentId]
  )
    return {
      ...story,
      current: { event: "finale" as const, page: 0 },
      pending: [],
    };
  return story;
}
function record(
  save: Save,
  event: StoryEvent,
  detail?: string,
  mood?: StoryMood,
): Save {
  const story = storyFor(save);
  const next = tellStory(story, event, contextFor(save), detail, mood);
  return story === next
    ? save
    : { ...save, story: { ...save.story, [save.assignmentId]: next } };
}
export function useGame() {
  const [save, setSave] = useState(loadSave);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [settings, setSettings] = useState(false);
  const [saved, setSaved] = useState(true);
  const [showTasks, setShowTasks] = useState(false);
  const context = contextFor(save);
  const { assignment, chapter } = context;
  const lesson = curriculum.find((item) => item.id === save.lessonId)!;
  const story = storyFor(save);
  const dialogue = story.aside ?? story.current;
  const quote = dialogueLines(dialogue, context)[dialogue.page];
  const mood: StoryMood =
    dialogue.mood ??
    (["passed", "finale", "typing"].includes(dialogue.event)
      ? "happy"
      : dialogue.event === "retry"
        ? "confused"
        : "neutral");
  const assignmentCollected = !context.completed && context.collected;
  const assignmentPrintRequested =
    !context.completed && story.delivery !== "waiting";
  const assignmentReady = assignmentCollected || story.delivery === "ready";
  const assignmentUnread = !save.readAssignments.includes(assignment.id);

  function continueDialogue() {
    setSave((current) => {
      const previous = storyFor(current);
      const next = continueStory(previous, contextFor(current));
      return previous === next
        ? current
        : {
            ...current,
            story: { ...current.story, [current.assignmentId]: next },
          };
    });
    sound(save.settings.mute, "talk");
  }
  const openAssignment = useCallback(() => {
    if (!assignmentCollected) return;
    setSave((current) =>
      current.assignmentId !== assignment.id
        ? current
        : record(
            {
              ...current,
              readAssignments: [
                ...new Set([...current.readAssignments, assignment.id]),
              ],
            },
            "paper",
          ),
    );
    setAssignmentOpen(true);
  }, [assignment.id, assignmentCollected]);
  const markAssignmentReady = useCallback(() => {
    setSave((current) => {
      if (current.assignmentId !== assignment.id) return current;
      const previous = storyFor(current);
      const next = finishPrinting(previous, contextFor(current));
      return next === previous
        ? current
        : { ...current, story: { ...current.story, [assignment.id]: next } };
    });
  }, [assignment.id]);
  const collectAssignment = useCallback(() => {
    setSave((current) => {
      if (
        current.assignmentId !== assignment.id ||
        current.completed.includes(assignment.id) ||
        current.collectedAssignments.includes(assignment.id) ||
        storyFor(current).delivery !== "ready"
      )
        return current;
      return record(
        {
          ...current,
          collectedAssignments: [
            ...current.collectedAssignments,
            assignment.id,
          ],
        },
        "collected",
      );
    });
  }, [assignment.id]);
  useEffect(() => {
    setSaved(persist(save));
  }, [save]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== "Escape") return;
      if (settings) {
        setSettings(false);
        return;
      }
      if (showTasks) {
        setShowTasks(false);
        return;
      }
      if (assignmentOpen) {
        setAssignmentOpen(false);
        return;
      }
      setFocused(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [assignmentOpen, settings, showTasks]);
  useEffect(() => {
    setAssignmentOpen(false);
    setHelpOpen(false);
  }, [assignment.id]);
  function activity(event: StoryEvent, detail?: string) {
    setSave((current) => record(current, event, detail));
    sound(save.settings.mute, "talk");
  }
  function say(text: string, nextMood: StoryMood = "neutral") {
    setSave((current) => record(current, "aside", text, nextMood));
    sound(save.settings.mute, "talk");
  }
  function openHelp() {
    setHelpOpen(true);
    activity("help");
  }
  function dispatch(action: Action) {
    setSave((current) => {
      let next = transition(current, action);
      if (next === current) return current;
      if (
        (action.type === "draft" && action.code.trim()) ||
        (action.type === "project" &&
          Object.entries(action.project.files).some(
            ([name, code]) =>
              code.trim() &&
              code !== current.projects[current.assignmentId]?.files[name],
          ))
      )
        next = record(next, "typing");
      if (action.type === "submit") {
        const previousChapter = contextFor(current).chapter;
        if (next.phase === "complete") {
          const end = storyFor(next);
          next = {
            ...next,
            story: {
              ...next.story,
              [next.assignmentId]: {
                ...end,
                current: { event: "finale", page: 0 },
                pending: [],
              },
            },
          };
        } else {
          const upcoming = storyFor(next);
          if (upcoming.delivery === "waiting")
            next = {
              ...next,
              story: {
                ...next.story,
                [next.assignmentId]: {
                  ...upcoming,
                  current: {
                    event: "handoff",
                    page: 0,
                    detail: storyChapters[previousChapter].handoff,
                  },
                  pending: [],
                },
              },
            };
        }
      } else if (
        (action.type === "open-assignment" || action.type === "replay") &&
        next.completed.includes(next.assignmentId)
      ) {
        const previous = storyFor(next);
        next = {
          ...next,
          story: {
            ...next.story,
            [next.assignmentId]: {
              ...previous,
              delivery: "ready",
              current: { event: "return", page: 0 },
              pending: [],
            },
          },
        };
      }
      return next;
    });
    if (action.type !== "draft")
      sound(
        save.settings.mute,
        action.type === "pass" || action.type === "submit" ? "win" : undefined,
      );
    if (action.type === "submit") {
      setFocused(false);
      setAssignmentOpen(false);
      setHelpOpen(false);
    }
  }
  function enter() {
    setFocused(true);
    setSave((current) =>
      current.phase === "complete"
        ? current
        : record(
            transition(current, { type: "enter" }),
            current.completed.includes(current.assignmentId)
              ? "return"
              : "monitor",
          ),
    );
  }
  return {
    save,
    setSave,
    assignmentOpen,
    setAssignmentOpen,
    assignmentReady,
    assignmentPrintRequested,
    assignmentCollected,
    markAssignmentReady,
    assignmentUnread,
    openAssignment,
    collectAssignment,
    helpOpen,
    setHelpOpen,
    openHelp,
    focused,
    setFocused,
    settings,
    setSettings,
    saved,
    quote,
    mood,
    showTasks,
    setShowTasks,
    lesson,
    assignment,
    say,
    activity,
    dispatch,
    enter,
    continueDialogue,
    canContinueDialogue: canContinueStory(story, context),
    continueLabel: story.aside
      ? "BACK TO WORK"
      : story.current.event === "briefing" && story.delivery === "waiting"
        ? "Print assignment"
        : "Next",
    storyEvent: dialogue.event,
    chapter: chapter + 1,
    chapterTitle: storyChapters[chapter].title,
    count: curriculum.filter((item) => lessonDone(save, item)).length,
  };
}
export type GameController = ReturnType<typeof useGame>;
