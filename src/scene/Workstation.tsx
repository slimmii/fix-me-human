import { useHoverHighlight } from "./useHoverHighlight";
import { Box, cream } from "./primitives";
import type { SceneProps as Props } from "./types";
import { CRT, MONITOR } from "../monitor";

import { MonitorDisplay } from "./MonitorDisplay";
import { MonitorSurround } from "./MonitorSurround";
import { TissueBox } from "./TissueBox";
export function Workstation({
  focused,
  onComputer,
  onProp,
  computer,
  reduced,
}: Pick<Props, "focused" | "onComputer" | "onProp" | "computer" | "reduced">) {
  const highlight = useHoverHighlight(undefined, !focused);
  const keyboardHighlight = useHoverHighlight();
  return (
    <>
      {" "}
      <group
        {...highlight.mesh}
        onClick={(e) => {
          e.stopPropagation();
          onComputer();
        }}
      >
        <Box
          position={[0, 1.59, -0.55]}
          size={[1.3, 0.38, 0.95]}
          color={cream}
        />
        <group
          position={[
            MONITOR.pivot[0],
            MONITOR.pivot[1] + MONITOR.lift,
            MONITOR.pivot[2],
          ]}
          rotation={[MONITOR.tilt, 0, 0]}
        >
          <group
            position={[-MONITOR.pivot[0], -MONITOR.pivot[1], -MONITOR.pivot[2]]}
          >
            <Box
              position={[0, 2.28, -0.62]}
              size={[MONITOR.width, MONITOR.height, 1.35]}
              color={cream}
              radius={0.19}
            />
            <Box
              position={[0, CRT.centerY, CRT.surfaceZ - 0.028]}
              size={[CRT.width + 0.08, CRT.height + 0.08, 0.05]}
              color="#16251e"
              radius={CRT.radius}
            />
            <MonitorSurround />
            <MonitorDisplay
              hoverHandlers={highlight.html}
              focused={focused}
              computer={computer}
              onComputer={onComputer}
            />
          </group>
        </group>
      </group>
      <group
        {...keyboardHighlight.mesh}
        // Tilt around the keyboard itself so its lower edge rests on the desk.
        position={[0, 1.52, 1.02]}
        rotation={[0.08, 0, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onProp("Keyboard: CLACK. A highly productive noise.");
        }}
      >
        <Box position={[0, 0, 0]} size={[2.45, 0.17, 0.82]} color={cream} />
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 12 }, (_, col) => (
            <Box
              key={`${row}-${col}`}
              position={[-1.07 + col * 0.19, 0.115, -0.3 + row * 0.17]}
              size={[0.155, 0.07, 0.13]}
              color={col === 11 ? "#db8157" : "#f5e9c8"}
              radius={0.017}
            />
          )),
        )}
      </group>
      <TissueBox reduced={reduced} focused={focused} onProp={onProp} />
    </>
  );
}
