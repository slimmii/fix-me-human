import { lessons } from "../content";
import type { GameController } from "../game/useGame";
import {
  campaignDone,
  endlessUnlocked,
  lessonDone,
  unlocked,
} from "../progression";
type Props = Pick<
  GameController,
  "save" | "setSave" | "setShowLessons" | "phase"
>;
export function LessonMenu({ save, setSave, setShowLessons, phase }: Props) {
  return (
    <div className="machine-lessons">
      <h2>More work. How thoughtful.</h2>
      <div>
        {lessons.map((l, i) => (
          <button
            key={l.title}
            disabled={!unlocked(save, i)}
            onClick={() => {
              setSave((s) => ({
                ...s,
                lesson: i,
                exercise: 0,
                phase: "briefing",
              }));
              setShowLessons(false);
            }}
          >
            {lessonDone(save, i) ? "✓" : String(i + 1).padStart(2, "0")}{" "}
            {l.title}
          </button>
        ))}
      </div>
      <button
        disabled={!campaignDone(save)}
        onClick={() => {
          phase(save.checkpoints.length === 5 ? "ending" : "finale");
          setShowLessons(false);
        }}
      >
        ⚑ Office Survival Dashboard
      </button>
      <button
        disabled={!endlessUnlocked(save)}
        onClick={() => {
          phase("endless");
          setShowLessons(false);
        }}
      >
        ∞ Endless Shift
      </button>
      <button onClick={() => setShowLessons(false)}>Back to my page</button>
    </div>
  );
}
