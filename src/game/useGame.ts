import { useEffect, useMemo, useState } from "react";
import { sound } from "../audio";
import { finale, generate, lessons } from "../content";
import { lessonDone, loadSave, persist, type Save } from "../progression";
import { lessonIntroductions } from "./dialogue";
export function useGame() {
  const [save, setSave] = useState(loadSave);
  const [focused, setFocused] = useState(false);
  const [settings, setSettings] = useState(false);
  const [saved, setSaved] = useState(true);
  const [quote, setQuote] = useState(
    "Click the computer to begin. We tried training humans through osmosis. Lost three interns.",
  );
  const [mood, setMood] = useState<"neutral" | "happy" | "confused">("neutral");
  const [showLessons, setShowLessons] = useState(false);
  const [speech, setSpeech] = useState(0);
  const lesson = lessons[save.lesson];
  const isFinal = save.phase === "finale";
  const isEndless = save.phase === "endless";
  const endlessExercise = useMemo(
    () =>
      generate(
        save.endless.seed,
        save.endless.topic,
        save.endless.difficulty,
        save.endless.previousFamily,
      ),
    [
      save.endless.seed,
      save.endless.topic,
      save.endless.difficulty,
      save.endless.previousFamily,
    ],
  );
  const exercise = isFinal
    ? finale[Math.min(save.checkpoints.length, 4)]
    : isEndless
      ? endlessExercise
      : lesson.exercises[save.exercise];
  const briefing = save.phase === "briefing" || save.phase === "example";
  useEffect(() => {
    setSaved(persist(save));
  }, [save]);
  useEffect(() => {
    if (briefing) {
      setSpeech(0);
      setMood("neutral");
      setQuote(lessonIntroductions[save.lesson]);
    }
  }, [save.phase, save.lesson, briefing]);
  useEffect(() => {
    if (isFinal || isEndless) {
      setMood("neutral");
      setQuote(
        `${isFinal ? "Project checkpoint." : "Fresh work, freshly questionable management."} ${exercise.prompt}`,
      );
    }
  }, [exercise.id, isFinal, isEndless]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFocused(false);
        setSettings(false);
        setShowLessons(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  function say(
    text: string,
    nextMood: "neutral" | "happy" | "confused" = "neutral",
  ) {
    setQuote(text);
    setMood(nextMood);
    sound(save.settings.mute, "talk");
  }
  function phase(p: Save["phase"]) {
    setSave((s) => ({ ...s, phase: p }));
    sound(save.settings.mute);
  }
  function enter() {
    setFocused(true);
    if (save.phase === "onboarding") phase("briefing");
    sound(save.settings.mute);
  }
  function explain() {
    if (speech === 0) {
      setSpeech(1);
      say(lesson.explanation);
    } else if (speech === 1) {
      setSpeech(2);
      say(
        `${lesson.reminder} Study the example on your screen. It’s the one piece of code I am willing to take responsibility for.`,
      );
    } else {
      phase("exercise");
      say(
        `${exercise.prompt} Type your repair in the editor. Use Run > Start, or press F5, to open your program in BUGSCAPE. F6 returns to the editor.`,
      );
    }
  }
  function pass() {
    sound(save.settings.mute, "win");
    if (isEndless) {
      setSave((s) => ({
        ...s,
        endless: {
          ...s.endless,
          solved: s.endless.solved + 1,
          seed: s.endless.seed + 1,
          previousFamily: ["completion", "repair", "ordering"].indexOf(
            exercise.kind,
          ),
        },
      }));
      say("Another bug fixed. The backlog has celebrated by growing.", "happy");
    } else if (isFinal) {
      const checkpoints = [...new Set([...save.checkpoints, exercise.id])];
      setSave((s) => ({
        ...s,
        checkpoints,
        phase: checkpoints.length === 5 ? "ending" : "finale",
      }));
      say(
        checkpoints.length === 5
          ? "Promotion approved! Your reward is UNLIMITED EMPLOYMENT. The printer is making it legally disappointing."
          : "Checkpoint saved. A suspicious amount of competence detected.",
        "happy",
      );
    } else {
      setSave((s) => ({
        ...s,
        completed: [...new Set([...s.completed, exercise.id])],
        phase: "review",
      }));
      say(
        "Your code works. I am experiencing an unfamiliar feeling. It might be pride. Or a firmware update.",
        "happy",
      );
    }
  }
  function next() {
    if (save.exercise === 0) {
      setSave((s) => ({ ...s, exercise: 1, phase: "exercise" }));
      say(
        `Now fix this one yourself. ${lesson.exercises[1].prompt} I’ll be over here, looking essential.`,
      );
    } else if (save.lesson < 10)
      setSave((s) => ({
        ...s,
        lesson: s.lesson + 1,
        exercise: 0,
        phase: "briefing",
      }));
    else {
      phase("finale");
      say(
        "Time to build the Office Survival Dashboard. Five checkpoints. I’ll keep each one. Unlike your annual leave.",
      );
    }
  }
  const count = lessons.filter((_, i) => lessonDone(save, i)).length;

  return {
    save,
    setSave,
    focused,
    setFocused,
    settings,
    setSettings,
    saved,
    quote,
    mood,
    showLessons,
    setShowLessons,
    speech,
    lesson,
    isFinal,
    isEndless,
    exercise,
    briefing,
    say,
    phase,
    enter,
    explain,
    pass,
    next,
    count,
  };
}
export type GameController = ReturnType<typeof useGame>;
