import type { SceneProps } from "../scene/types";
import type { StoryEvent } from "../game/story";
import { storyChapters } from "../game/storyScripts";
export function RobotDialogue({
  mood,
  quote,
  chapter,
  chapterTitle,
  event,
  canContinue,
  onContinue,
  continueLabel,
  onHint,
}: {
  mood: SceneProps["mood"];
  quote: string;
  chapter: number;
  chapterTitle: string;
  event: StoryEvent;
  canContinue: boolean;
  onContinue: () => void;
  continueLabel: string;
  onHint?: () => void;
}) {
  const Avatar = onHint ? "button" : "div";
  return (
    <section
      className="robot-dialogue"
      aria-label="Conversation with B.U.G."
      data-story-event={event}
    >
      <Avatar
        className={`robot-avatar ${mood}`}
        aria-hidden={onHint ? undefined : true}
        aria-label={onHint ? "Ask B.U.G. for a hint" : undefined}
        title={onHint ? "Ask B.U.G. for a hint" : undefined}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onHint}
      >
        <i />
        <i />
        <span />
      </Avatar>
      <div className="robot-speech">
        <b>
          B.U.G.
          <span>
            CHAPTER {chapter}/{storyChapters.length} · {chapterTitle}
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
