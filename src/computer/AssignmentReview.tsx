import type { GameController } from "../game/useGame";
type Props = Pick<GameController, "save" | "exercise">;
export function AssignmentReview({ save, exercise }: Props) {
  return (
    <div className="machine-review">
      <div>✓</div>
      <small>ONE LESS BUG. SAME SALARY.</small>
      <h1>
        {save.exercise === 0
          ? "You made a thing work."
          : "Assignment survived."}
      </h1>
      <p>
        You typed and ran <b>{exercise.title.toLowerCase()}</b>.
      </p>
    </div>
  );
}
