import { TAGS } from "../TypedComputer";
import type { GameController } from "../game/useGame";
type Props = Pick<GameController, "speech" | "lesson">;
export function LessonBriefing({ speech, lesson }: Props) {
  return (
    <div className="machine-briefing">
      <div className="briefing-intro">
        <small>B.U.G. HAS THE FLOOR. UNFORTUNATELY.</small>
        <h1>{lesson.assignment}</h1>
        <p>
          {speech === 0
            ? "Your supervisor is explaining the basics. Listen with your eyes."
            : speech === 1
              ? "A little React. A little questionable leadership."
              : "One working example. Then it’s your turn to type."}
        </p>
        <div className="mini-bug">
          <i />
          <i />
          <b />
        </div>
      </div>
      <div className="worked-card">
        <span>
          {speech < 2 ? "A PEEK AT WHAT YOU’LL LEARN" : "YOUR WORKED EXAMPLE"}
        </span>
        <pre>{lesson.example}</pre>
        <div className="tag-note">
          <b>Small toolbox. Big ambitions.</b>
          <p>
            Only {TAGS.map((t) => `<${t}>`).join(" ")}. Capitalized React
            components are welcome too.
          </p>
        </div>
      </div>
    </div>
  );
}
