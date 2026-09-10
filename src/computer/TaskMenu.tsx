import type { GameController } from "../game/useGame";
import { availableAssignments } from "../progression";
import { ContentScreen } from "./ContentScreen";

export function TaskMenu({ game }: { game: GameController }) {
  return (
    <ContentScreen
      title="Open task"
      eyebrow="ASSIGNMENTS"
      contentKey="open-task"
      keyboardActive={game.focused && !game.settings}
      actions={
        <button onClick={() => game.setShowTasks(false)}>Cancel · Esc</button>
      }
    >
      <div className="lesson-markdown">
        <p>
          Open a previous task or continue with the next available task. Each
          task keeps its own saved project.
        </p>
      </div>
      <ul className="terminal-list" aria-label="Available tasks">
        {availableAssignments(game.save).map(({ lesson, assignment }) => (
          <li key={assignment.id}>
            <button
              aria-label={`Open task: ${assignment.title}`}
              onClick={() => {
                game.dispatch({ type: "open-assignment", id: assignment.id });
                game.setShowTasks(false);
              }}
            >
              <span>
                <b>{assignment.title}</b>
                <small>{lesson.title}</small>
              </span>
              <span>
                {game.save.completed.includes(assignment.id)
                  ? "Completed"
                  : assignment.id === game.save.assignmentId
                    ? "Current"
                    : "Ready"}{" "}
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </ContentScreen>
  );
}
