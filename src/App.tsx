import { PrintedAssignment } from "./ui/PrintedAssignment";
import Scene from "./Scene";
import { GameComputer } from "./computer/GameComputer";
import { useGame } from "./game/useGame";
import { GameHud } from "./ui/GameHud";
import { RobotDialogue } from "./ui/RobotDialogue";
import { SettingsDialog } from "./ui/SettingsDialog";
export default function App() {
  const game = useGame();
  const {
    save,
    setSave,
    focused,
    setFocused,
    settings,
    setSettings,
    quote,
    mood,
    say,
    enter,
  } = game;

  return (
    <main
      className={`game ${focused ? "focused" : ""} ${game.assignmentOpen ? "paper-open" : ""} ${save.settings.reducedMotion ? "reduced" : ""}`}
      onClickCapture={(e) => {
        if (!focused || settings) return;
        const target = e.target;
        if (
          target instanceof Element &&
          target.closest(
            ".crt-display,.fallback-computer,.hud,.robot-dialogue,.assignment-dock,.assignment-paper",
          )
        )
          return;
        e.stopPropagation();
        setFocused(false);
      }}
    >
      <Scene
        completedAssignments={save.completed}
        assignment={game.assignment}
        assignmentOpen={game.assignmentOpen}
        assignmentReady={game.assignmentReady}
        assignmentPrintRequested={game.assignmentPrintRequested}
        assignmentCollected={game.assignmentCollected}
        assignmentUnread={game.assignmentUnread}
        onAssignmentReady={game.markAssignmentReady}
        onAssignmentCollected={game.collectAssignment}
        onAssignment={game.openAssignment}
        mute={save.settings.mute}
        focused={focused}
        reduced={save.settings.reducedMotion}
        graphicsQuality={save.settings.graphicsQuality}
        onComputer={enter}
        onProp={say}
        celebrate={false}
        mood={mood}
        computer={<GameComputer game={game} />}
      />
      {game.assignmentCollected && (
        <PrintedAssignment
          assignment={game.assignment}
          open={game.assignmentOpen}
          onClose={() => game.setAssignmentOpen(false)}
        />
      )}
      {!focused && (
        <GameHud
          mute={save.settings.mute}
          onDesk={() => setFocused(false)}
          onSettings={() => setSettings(true)}
          onToggleSound={() =>
            setSave((s) => ({
              ...s,
              settings: { ...s.settings, mute: !s.settings.mute },
            }))
          }
        />
      )}
      {!focused && (
        <>
          <div className="desk-label">
            <span>BUG INDUSTRIES™</span>
            <h1>
              One human.
              <br />
              Several bugs.
            </h1>
          </div>
          <div className="desk-index">
            <span>WORKSTATION</span>
            <b>H–042</b>
            <small>
              YOUR COFFEE IS
              <br />
              PROBABLY COLD.
            </small>
          </div>
        </>
      )}
      <RobotDialogue
        mood={mood}
        quote={quote}
        chapter={game.chapter}
        chapterTitle={game.chapterTitle}
        event={game.storyEvent}
        canContinue={game.canContinueDialogue}
        onContinue={game.continueDialogue}
        continueLabel={game.continueLabel}
      />
      {settings && (
        <SettingsDialog
          settings={save.settings}
          onClose={() => setSettings(false)}
          onChange={(key, value) =>
            setSave((s) => ({
              ...s,
              settings: { ...s.settings, [key]: value },
            }))
          }
        />
      )}
    </main>
  );
}
