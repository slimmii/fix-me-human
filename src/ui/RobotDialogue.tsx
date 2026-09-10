import type { SceneProps } from "../scene/types";
import type { StoryEvent } from "../game/story";
export function RobotDialogue({
  mood,
  quote,
  chapter,
  chapterTitle,
  event,
  canContinue,
  onContinue,
  continueLabel,
}: {
  mood: SceneProps["mood"];
  quote: string;
  chapter: number;
  chapterTitle: string;
  event: StoryEvent;
  canContinue: boolean;
  onContinue: () => void;
  continueLabel: string;
}) {
  return (
    <section
      className="robot-dialogue"
      aria-label="Conversation with B.U.G."
      data-story-event={event}
    >
      <div className={`robot-avatar ${mood}`} aria-hidden="true">
        <i />
        <i />
        <span />
      </div>
      <div className="robot-speech">
        <b>
          B.U.G.
          <span>
            CHAPTER {chapter}/12 · {chapterTitle}
          </span>
        </b>
        <p role="status" aria-atomic="true">
          {quote}
        </p>
      </div>
      {canContinue && (
        <button
          className="robot-dialogue-next"
          aria-label={
            event === "aside" ? "BACK TO WORK" : "Continue B.U.G. dialogue"
          }
          title={continueLabel}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onContinue}
        >
          {continueLabel}
          <span aria-hidden="true"> →</span>
        </button>
      )}
    </section>
  );
}
