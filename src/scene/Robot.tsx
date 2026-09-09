import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { Box, cream, dark } from "./primitives";
import type { SceneProps as Props } from "./types";
export function Robot({
  reduced,
  onProp,
  celebrate,
  mood,
}: Pick<Props, "reduced" | "onProp" | "celebrate" | "mood">) {
  const body = useRef<THREE.Group>(null);
  const [excited, setExcited] = useState(0);
  useFrame(({ clock }) => {
    if (body.current && !reduced) {
      body.current.position.y = 2.9 + Math.sin(clock.elapsedTime * 1.6) * 0.1;
      body.current.rotation.z =
        Math.sin(clock.elapsedTime) * 0.04 +
        (excited > performance.now() / 1000 ? 0.12 : 0);
    }
  });
  return (
    <group
      ref={body}
      position={[2.1, 2.9, -0.3]}
      onClick={(e) => {
        e.stopPropagation();
        setExcited(performance.now() / 1000 + 2);
        onProp(
          "B.U.G.: I generated 400 bugs today. You’re welcome for the job security.",
        );
      }}
    >
      <Box
        position={[0, 0, 0]}
        size={[1.2, 0.88, 0.7]}
        color="#edb84f"
        radius={0.17}
      />
      <Box
        position={[0, 0, 0.38]}
        size={[1.04, 0.66, 0.08]}
        color={dark}
        radius={0.13}
      />
      {[-0.24, 0.24].map((x) => (
        <mesh key={x} position={[x, 0.08, 0.44]}>
          <boxGeometry
            args={[
              0.13,
              celebrate || mood === "happy"
                ? 0.05
                : mood === "confused" && x < 0
                  ? 0.08
                  : 0.19,
              0.02,
            ]}
          />
          <meshBasicMaterial color="#c5ffb4" />
        </mesh>
      ))}
      <Box
        position={[0, -0.19, 0.44]}
        size={[0.3, 0.045, 0.025]}
        color="#c5ffb4"
        radius={0.01}
      />
      <Box
        position={[0, 0.59, 0]}
        size={[0.04, 0.4, 0.04]}
        color={dark}
        radius={0.01}
      />
      <mesh position={[0, 0.82, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#ec6d4c" />
      </mesh>
      {[-1, 1].map((x) => (
        <group key={x}>
          <Box
            position={[x * 0.75, -0.05, 0]}
            size={[0.22, 0.42, 0.28]}
            color={cream}
          />
          <Box
            position={[x * 0.9, -0.28, 0.06]}
            size={[0.3, 0.18, 0.28]}
            color="#edb84f"
          />
        </group>
      ))}
      <mesh position={[0, -0.55, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.25, 0.3, 8]} />
        <meshStandardMaterial
          color="#6cc7c1"
          emissive="#329b94"
          emissiveIntensity={0.5}
        />
      </mesh>
      <Html
        zIndexRange={[5, 0]}
        style={{ pointerEvents: "none" }}
        position={[0, 1.02, 0]}
        center
        distanceFactor={7}
      >
        <span className="robot-tag">B.U.G. / SUPERVISOR</span>
      </Html>
    </group>
  );
}
