import TypedComputer, { starterFor } from "../TypedComputer";
import { sound } from "../audio";
import { finale } from "../content";
import { lessonIntroductions } from "../game/dialogue";
import type { GameController } from "../game/useGame";
import { AssignmentReview } from "./AssignmentReview";
import { BootScreen } from "./BootScreen";
import { EndlessControls } from "./EndlessControls";
import { LessonBriefing } from "./LessonBriefing";
import { LessonMenu } from "./LessonMenu";
import { PromotionScreen } from "./PromotionScreen";
export function GameComputer({ game }: { game: GameController }) {
  const {
    save,
    setSave,
    setFocused,
    saved,
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
    pass,
    count,
  } = game;
  return save.phase === "onboarding" ? (
    <BootScreen enter={enter} />
  ) : (
    <div className={`machine-screen ${save.settings.crt ? "scanlines" : ""}`}>
      <div className="machine-menubar">
        <b>B.U.G. BASIC</b>
        <button onClick={() => setShowLessons(!showLessons)}>
          {isFinal
            ? "Final project"
            : isEndless
              ? "Endless Shift"
              : `Lesson ${save.lesson + 1} · ${lesson.title}`}{" "}
          ▾
        </button>
        <span>{count}/11</span>
        <button onClick={() => setFocused(false)}>Back to desk ↙</button>
      </div>
      {showLessons ? (
        <LessonMenu
          save={save}
          setSave={setSave}
          setShowLessons={setShowLessons}
          phase={phase}
        />
      ) : briefing ? (
        <LessonBriefing speech={speech} lesson={lesson} />
      ) : save.phase === "review" ? (
        <AssignmentReview save={save} exercise={exercise} />
      ) : save.phase === "ending" ? (
        <PromotionScreen setFocused={setFocused} say={say} phase={phase} />
      ) : (
        <>
          {isFinal && (
            <div className="tiny-checkpoints">
              {finale.map((e, i) => (
                <span key={e.id}>
                  {save.checkpoints.includes(e.id) ? "✓" : i + 1}{" "}
                  {e.title.split("/ ")[1]}
                </span>
              ))}
            </div>
          )}
          {isEndless && <EndlessControls save={save} setSave={setSave} />}
          <TypedComputer
            exercise={exercise}
            key={exercise.id}
            source={save.answers[exercise.id]?.code ?? starterFor(exercise)}
            onChange={(code) =>
              setSave((s) => ({
                ...s,
                answers: { ...s.answers, [exercise.id]: { code } },
              }))
            }
            onPass={pass}
            onExit={() => setFocused(false)}
            onRobot={say}
            onKey={() => sound(save.settings.mute)}
            reduced={save.settings.reducedMotion}
            onHelp={() =>
              say(
                `${lessonIntroductions[exercise.topic]} Your task: ${exercise.prompt}`,
              )
            }
          />
        </>
      )}
      <div className="machine-status">
        ●{" "}
        {saved
          ? "Saved on this computer"
          : "Storage unavailable · this session only"}
        <span>HAND-TYPED BY A REAL HUMAN™</span>
      </div>
    </div>
  );
}
