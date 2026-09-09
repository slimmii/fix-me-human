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
    showLessons,
    speech,
    briefing,
    say,
    enter,
    explain,
    next,
  } = game;

  return (
    <main
      className={`game ${focused ? "focused" : ""} ${save.settings.reducedMotion ? "reduced" : ""}`}
      onClickCapture={(e) => {
        if (!focused || settings) return;
        const target = e.target;
        if (
          target instanceof Element &&
          target.closest(".crt-display,.fallback-computer,.hud,.robot-dialogue")
        )
          return;
        e.stopPropagation();
        setFocused(false);
      }}
    >
      <Scene
        mute={save.settings.mute}
        focused={focused}
        reduced={save.settings.reducedMotion}
        onComputer={enter}
        onProp={say}
        celebrate={save.phase === "ending"}
        mood={mood}
        computer={<GameComputer game={game} />}
      />
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
      <RobotDialogue mood={mood} quote={quote}>
        {!showLessons &&
          (briefing ? (
            <button className="primary" onClick={explain}>
              {speech < 2 ? "Go on, B.U.G. →" : "Let me type →"}
            </button>
          ) : save.phase === "review" ? (
            <button className="primary" onClick={next}>
              {save.exercise === 0
                ? "Try the independent repair"
                : save.lesson === 10
                  ? "Build my final project"
                  : "Next assignment"}{" "}
              →
            </button>
          ) : null)}
      </RobotDialogue>
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
