import { Html } from "@react-three/drei";
import { useMemo, type CSSProperties } from "react";
import * as THREE from "three";
import { CRT, DISPLAY } from "../monitor";
import type { SceneProps as Props } from "./types";
export function MonitorDisplay({
  focused,
  computer,
  onComputer,
}: Pick<Props, "focused" | "computer" | "onComputer">) {
  const glass = useMemo(() => {
    const w = CRT.width / 2,
      h = CRT.height / 2,
      r = CRT.radius;
    const shape = new THREE.Shape();
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);
    return shape;
  }, []);
  const size = {
    "--display-width": `${DISPLAY.width}px`,
    "--display-height": `${DISPLAY.height}px`,
    "--display-radius": `${DISPLAY.radius}px`,
  } as CSSProperties;
  return (
    <group position={[0, CRT.centerY, CRT.surfaceZ]}>
      <mesh position={[0, 0, -0.001]}>
        <shapeGeometry args={[glass, 24]} />
        <meshBasicMaterial color="#101f19" />
      </mesh>
      <Html
        transform
        distanceFactor={DISPLAY.distanceFactor}
        zIndexRange={[20, 10]}
      >
        <div
          className="crt-display"
          data-surface="crt-glass"
          style={size}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (!focused) onComputer();
          }}
        >
          <div className="crt-contents" inert={!focused}>
            {computer}
          </div>
          <div className="crt-glass-finish" aria-hidden="true" />
        </div>
      </Html>
    </group>
  );
}
