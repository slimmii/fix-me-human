import { useCallback, useEffect, useState } from "react";
import { sound } from "../audio";
import { curriculum } from "../curriculum";
import {
  lessonDone,
  loadSave,
  persist,
  transition,
  type Action,
} from "../progression";
export function useGame() {
  const [save, setSave] = useState(loadSave);
  const [readyAssignments, setReadyAssignments] = useState<string[]>([]);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [settings, setSettings] = useState(false);
  const [saved, setSaved] = useState(true);
  const [showTasks, setShowTasks] = useState(false);
  const [quote, setQuote] = useState(
    "I’m printing your new assignment. Grab it from the printer when it’s ready.",
  );
  const [mood, setMood] = useState<"neutral" | "happy" | "confused">("neutral");
  const lesson = curriculum.find((l) => l.id === save.lessonId)!;
  const assignment = lesson.assignments.find(
    (a) => a.id === save.assignmentId,
  )!;
  const assignmentCollected =
    !save.completed.includes(assignment.id) &&
    save.collectedAssignments.includes(assignment.id);
  const assignmentReady =
    assignmentCollected || readyAssignments.includes(assignment.id);
  const assignmentUnread = !save.readAssignments.includes(assignment.id);
  const openAssignment = useCallback(() => {
    if (!assignmentCollected) return;
    setSave((current) =>
      current.readAssignments.includes(assignment.id)
        ? current
        : {
            ...current,
            readAssignments: [...current.readAssignments, assignment.id],
          },
    );
    setAssignmentOpen(true);
  }, [assignment.id, assignmentCollected]);
  const markAssignmentReady = useCallback(() => {
    setReadyAssignments((ids) =>
      ids.includes(assignment.id) ? ids : [...ids, assignment.id],
    );
  }, [assignment.id]);
  const collectAssignment = useCallback(() => {
    if (!assignmentReady) return;
    setSave((current) =>
      current.collectedAssignments.includes(assignment.id)
        ? current
        : {
            ...current,
            collectedAssignments: [
              ...current.collectedAssignments,
              assignment.id,
            ],
          },
    );
  }, [assignment.id, assignmentReady]);
  useEffect(() => {
    setSaved(persist(save));
  }, [save]);
  useEffect(() => {
    setMood(
      save.phase === "review" || save.phase === "complete"
        ? "happy"
        : "neutral",
    );
    const pickupPrompt = assignmentReady
      ? `Your new assignment, ${assignment.title}, is ready. Grab the paper from the printer, human. It won’t walk to your desk.`
      : `${save.completed.length ? "Your finished work is pinned on the right wall. " : ""}I’m printing your new assignment, ${assignment.title}${/[.!?]$/.test(assignment.title) ? "" : "."} Grab it from the printer when it’s ready.`;
    const completedPrompt =
      "This assignment is already complete and pinned on the right wall. You can review its code, or use File > Open to choose an unfinished task.";
    const messages = {
      onboarding: save.completed.includes(assignment.id)
        ? completedPrompt
        : assignmentCollected
          ? "Your assignment is beside the monitor. Click the paper to read it, then click the computer to begin."
          : pickupPrompt,
      coding: save.completed.includes(assignment.id)
        ? completedPrompt
        : assignmentCollected
          ? "Your assignment is beside the monitor. Click it to read while you code. F5 runs your application; F6 brings you back. Help explains the concepts."
          : pickupPrompt,
      review:
        "Your code works. I am updating my résumé to include excellent supervision.",
      complete:
        "All assignments complete! Your finished work is pinned on the right wall. I am experiencing an unfamiliar feeling. It might be pride.",
    };
    setQuote(messages[save.phase]);
  }, [
    save.phase,
    assignment.id,
    assignment.title,
    assignmentReady,
    assignmentCollected,
    save.completed,
  ]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
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
        setSettings(false);
        setShowTasks(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [assignmentOpen, settings, showTasks]);
  useEffect(() => {
    setAssignmentOpen(false);
    setHelpOpen(false);
  }, [assignment.id]);
  function say(text: string, nextMood: typeof mood = "neutral") {
    setQuote(text);
    setMood(nextMood);
    sound(save.settings.mute, "talk");
  }
  function dispatch(action: Action) {
    setSave((s) => transition(s, action));
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
    dispatch({ type: "enter" });
  }
  return {
    save,
    setSave,
    assignmentOpen,
    setAssignmentOpen,
    assignmentReady,
    assignmentCollected,
    markAssignmentReady,
    assignmentUnread,
    openAssignment,
    collectAssignment,
    helpOpen,
    setHelpOpen,
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
    dispatch,
    enter,
    count: curriculum.filter((l) => lessonDone(save, l)).length,
  };
}
export type GameController = ReturnType<typeof useGame>;
