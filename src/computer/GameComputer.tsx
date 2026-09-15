import TypedComputer from "../TypedComputer";
import { sound } from "../audio";
import { assignmentProject } from "../progression";
import type { GameController } from "../game/useGame";
import { AssignmentReview } from "./AssignmentReview";
import { TaskMenu } from "./TaskMenu";
import { Desktop } from "./Desktop";
import { Snake } from "./Snake";
import type { CSSProperties } from "react";

export function GameComputer({ game }: { game: GameController }) {
  const { save, assignment, dispatch } = game;
  const reviewing = save.phase === "review" || save.phase === "complete";
  const basicOpen = game.computerApp === "basic";
  const keyboardActive = game.focused && !game.settings;
  function exitBasic() {
    game.setShowTasks(false);
    game.setHelpOpen(false);
    game.setComputerApp("desktop");
  }
  return (
    <div
      className={`machine-screen ${save.settings.crt ? "scanlines" : ""}`}
      style={
        {
          "--screen-font-size": `${save.settings.screenFontSize}px`,
        } as CSSProperties
      }
    >
      {!basicOpen && (
        <Desktop
          active={keyboardActive && game.computerApp === "desktop"}
          onOpen={game.setComputerApp}
        >
          {game.computerApp === "snake" && (
            <Snake
              active={keyboardActive && !game.assignmentOpen}
              onExit={() => game.setComputerApp("desktop")}
            />
          )}
        </Desktop>
      )}
      {basicOpen && game.showTasks && <TaskMenu game={game} />}
      {basicOpen && reviewing && !game.showTasks && (
        <AssignmentReview game={game} />
      )}
      {!reviewing && (
        <div
          className="assignment-workspace"
          hidden={!basicOpen || game.showTasks}
          inert={!basicOpen}
        >
          <TypedComputer
            exercise={assignment}
            focused={basicOpen && keyboardActive && !game.showTasks}
            completed={save.completed}
            onOpenTasks={() => game.setShowTasks(true)}
            key={`${assignment.id}:${game.editorRevision}`}
            project={assignmentProject(save, assignment.id)}
            onChange={(project) => dispatch({ type: "project", project })}
            onPass={() => dispatch({ type: "submit" })}
            onExit={exitBasic}
            onActivity={game.activity}
            onBug={game.reportBug}
            onKey={() => sound(save.settings.mute)}
            reduced={save.settings.reducedMotion}
            fontSize={save.settings.screenFontSize}
            helpOpen={game.helpOpen}
            onHelp={game.openHelp}
            onCloseHelp={() => game.setHelpOpen(false)}
          />
        </div>
      )}
      {basicOpen && (
        <div className="machine-status" data-saved={game.saved}>
          <span className="terminal-save">
            <i aria-hidden="true" />
            {game.saved
              ? "All changes saved locally"
              : "This session only · storage unavailable"}
          </span>
          <span>TypeScript JSX · UTF-8 · Spaces: 2</span>
        </div>
      )}
    </div>
  );
}
