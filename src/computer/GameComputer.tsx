import TypedComputer from "../TypedComputer";
import { sound } from "../audio";
import { assignmentSource } from "../progression";
import type { GameController } from "../game/useGame";
import { AssignmentReview } from "./AssignmentReview";
import { TaskMenu } from "./TaskMenu";

export function GameComputer({ game }: { game: GameController }) {
  const { save, assignment, dispatch } = game;
  const reviewing = save.phase === "review" || save.phase === "complete";
  return (
    <div className={`machine-screen ${save.settings.crt ? "scanlines" : ""}`}>
      {game.showTasks && <TaskMenu game={game} />}
      {reviewing && !game.showTasks && <AssignmentReview game={game} />}
      {!reviewing && (
        <div className="assignment-workspace" hidden={game.showTasks}>
          <TypedComputer
            exercise={assignment}
            focused={game.focused && !game.settings && !game.showTasks}
            completed={save.completed}
            onOpenTasks={() => game.setShowTasks(true)}
            key={assignment.id}
            source={assignmentSource(save, assignment.id)}
            onChange={(code) => dispatch({ type: "draft", code })}
            onPass={() => dispatch({ type: "submit" })}
            onExit={() => game.setFocused(false)}
            onActivity={game.activity}
            onKey={() => sound(save.settings.mute)}
            reduced={save.settings.reducedMotion}
            helpOpen={game.helpOpen}
            onHelp={game.openHelp}
            onCloseHelp={() => game.setHelpOpen(false)}
          />
        </div>
      )}
      <div className="machine-status">
        ●{" "}
        {game.saved
          ? "All changes saved locally"
          : "This session only · storage unavailable"}
        <span>TypeScript JSX · UTF-8 · Spaces: 2</span>
      </div>
    </div>
  );
}
