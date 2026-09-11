import { useMemo } from "react";
import * as THREE from "three";
import { CRT } from "../monitor";
import { Box } from "./primitives";

function roundedRectangle(width: number, height: number, radius: number) {
  const w = width / 2;
  const h = height / 2;
  const path = new THREE.Shape();
  path.moveTo(-w + radius, -h);
  path.lineTo(w - radius, -h);
  path.quadraticCurveTo(w, -h, w, -h + radius);
  path.lineTo(w, h - radius);
  path.quadraticCurveTo(w, h, w - radius, h);
  path.lineTo(-w + radius, h);
  path.quadraticCurveTo(-w, h, -w, h - radius);
  path.lineTo(-w, -h + radius);
  path.quadraticCurveTo(-w, -h, -w + radius, -h);
  return path;
}

export function MonitorSurround() {
  const shape = useMemo(() => {
    // A real opening exposes recessed glass; the rounded housing remains visible
    // around this compact insert instead of being covered by a flat front plate.
    const frame = roundedRectangle(CRT.width + 0.28, CRT.height + 0.28, 0.15);
    const opening = roundedRectangle(
      CRT.width + 0.07,
      CRT.height + 0.07,
      CRT.radius + 0.025,
    );
    frame.holes.push(new THREE.Path(opening.getPoints(8).reverse()));
    return frame;
  }, []);

  return (
    <>
      <mesh position={[0, CRT.centerY, 0.06]} castShadow receiveShadow>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.1,
              bevelEnabled: true,
              bevelSize: 0.018,
              bevelThickness: 0.018,
              bevelSegments: 2,
              steps: 1,
              curveSegments: 8,
            },
          ]}
        />
        <meshStandardMaterial color="#b9ad84" roughness={0.8} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => (
        <Box
          key={index}
          position={[-0.82 + index * 0.08, 1.56, 0.06]}
          size={[0.036, 0.045, 0.015]}
          color="#8b8266"
          radius={0.008}
        />
      ))}
      <Box
        position={[0.8, 1.56, 0.068]}
        size={[0.19, 0.095, 0.035]}
        color="#ae9f77"
        radius={0.018}
      />
      <Box
        position={[0.8, 1.56, 0.09]}
        size={[0.07, 0.026, 0.012]}
        color="#96ed88"
        radius={0.008}
      />
    </>
  );
}
