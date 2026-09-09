import type { ReactNode } from "react";
import type { SceneProps } from "../scene/types";
export function RobotDialogue({
  mood,
  quote,
  children,
}: {
  mood: SceneProps["mood"];
  quote: string;
  children?: ReactNode;
}) {
  return (
    <section className="robot-dialogue" aria-label="Conversation with B.U.G.">
      <div className={`robot-avatar ${mood}`}>
        <i />
        <i />
        <span />
      </div>
      <div className="robot-speech">
        <b>
          B.U.G.<span>YOUR EXTREMELY QUALIFIED SUPERVISOR</span>
        </b>
        <p role="status">{quote}</p>
        {children}
      </div>
    </section>
  );
}
