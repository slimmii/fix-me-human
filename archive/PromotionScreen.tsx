import type { GameController } from "../game/useGame";
type Props = Pick<GameController, "setFocused" | "say" | "phase">;
export function PromotionScreen({ setFocused, say, phase }: Props) {
  return (
    <div className="machine-ending">
      <div className="tiny-certificate">
        <small>BUG INDUSTRIES · OFFICIAL PRINTER OUTPUT</small>
        <h1>
          CERTIFICATE OF
          <br />
          TOLERABLE COMPETENCE
        </h1>
        <p>HUMAN #042</p>
        <span>React survived. Dashboard assembled. Promotion approved.</span>
        <b>UNLIMITED EMPLOYMENT.</b>
        <i>Signed, B.U.G. / Salary unchanged.</i>
      </div>
      <button className="primary" onClick={() => phase("endless")}>
        Begin Endless Shift ∞
      </button>
      <button
        onClick={() => {
          setFocused(false);
          say(
            "Confetti! Each piece has been deducted from your benefits.",
            "happy",
          );
        }}
      >
        Replay celebration
      </button>
    </div>
  );
}
