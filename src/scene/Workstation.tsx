import { useHoverHighlight } from "./useHoverHighlight";
import { Box, cream } from "./primitives";
import type { SceneProps as Props } from "./types";

import { MonitorDisplay } from "./MonitorDisplay";
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
        <Box
          position={[0, 2.28, -0.62]}
          size={[2.45, 1.7, 1.35]}
          color={cream}
          radius={0.19}
        />
        <Box
          position={[0, 2.35, 0.085]}
          size={[2.13, 1.3, 0.1]}
          color="#ae9f77"
          radius={0.13}
        />
        <Box
          position={[0, 2.35, 0.15]}
          size={[1.94, 1.12, 0.07]}
          color="#163c31"
          radius={0.1}
        />
        <MonitorDisplay
          hoverHandlers={highlight.html}
          focused={focused}
          computer={computer}
          onComputer={onComputer}
        />
        <Box
          position={[0.85, 1.6, 0.105]}
          size={[0.09, 0.05, 0.03]}
          color="#96ed88"
          radius={0.01}
        />
      </group>
      <group
        {...keyboardHighlight.mesh}
        rotation={[-0.08, 0, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onProp("Keyboard: CLACK. A highly productive noise.");
        }}
      >
        <Box
          position={[0, 1.52, 1.02]}
          size={[2.45, 0.17, 0.82]}
          color={cream}
        />
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 12 }, (_, col) => (
            <Box
              key={`${row}-${col}`}
              position={[-1.07 + col * 0.19, 1.635, 0.72 + row * 0.17]}
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
