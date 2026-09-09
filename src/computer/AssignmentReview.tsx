import { curriculum } from "../curriculum";
import type { GameController } from "../game/useGame";
import { ContentScreen } from "./ContentScreen";
export function AssignmentReview({ game }: { game: GameController }) {
  const { save, lesson, assignment, dispatch } = game;
  const complete = save.phase === "complete";
  const moreAssignments =
    lesson.assignments.indexOf(assignment) < lesson.assignments.length - 1;
  const nextLesson = curriculum[curriculum.indexOf(lesson) + 1];
  return (
    <ContentScreen
      keyboardActive={game.focused && !game.settings}
      contentKey={save.phase}
      eyebrow="B.U.G. / ASSIGNMENT REVIEW"
      title={complete ? "Lesson complete" : "Assignment complete"}
      actions={
        <>
          {!complete && (
            <button onClick={() => dispatch({ type: "continue" })}>
              {moreAssignments ? "Next assignment →" : "Complete lesson →"}
            </button>
          )}
          {complete && nextLesson && (
            <button onClick={() => dispatch({ type: "continue" })}>
              Next lesson →
            </button>
          )}
          <button onClick={() => game.setShowTasks(true)}>Open task…</button>
          <button
            onClick={() => {
              game.setSave((current) => ({ ...current, phase: "coding" }));
              game.setHelpOpen(true);
            }}
          >
            Open editor & course material
          </button>
        </>
      }
    >
      <div className="lesson-markdown">
        <p className="lesson-success">
          ✓ {complete ? lesson.title : assignment.title}
        </p>
        <p>
          {complete
            ? "You completed all assignments in this lesson."
            : `You typed and ran ${assignment.title}. Your application passed all the assignment checks.`}
        </p>
        <blockquote>
          Your code works. My supervision was clearly indispensable. — B.U.G.
        </blockquote>
        {complete && (
          <>
            {!nextLesson && (
              <p>
                More lessons are coming. You can review what you learned or try
                an assignment again.
              </p>
            )}
            <p>
              Replay starts a fresh draft. Your earned completion stays saved.
            </p>
            {lesson.assignments.map((a) => (
              <button
                key={a.id}
                onClick={() => dispatch({ type: "replay", id: a.id })}
              >
                Replay {a.title}
              </button>
            ))}
          </>
        )}
      </div>
    </ContentScreen>
  );
}
