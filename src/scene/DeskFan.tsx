import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { Box, cream, dark } from "./primitives";
import type { SceneProps as Props } from "./types";

export function DeskFan({
  reduced,
  onProp,
}: Pick<Props, "reduced" | "onProp">) {
  const fan = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const [fanOn, setFanOn] = useState(true);
  useFrame(({ camera }, dt) => {
    // Aim the head's front (+Z) at the viewer after the seated camera updates.
    head.current?.lookAt(camera.position);
    if (fan.current && !reduced && fanOn) fan.current.rotation.z += dt * 10;
  });

  return (
    <group
      position={[-2.75, 1.65, -0.9]}
      rotation={[0, Math.PI / 8, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setFanOn(!fanOn);
        onProp(
          fanOn
            ? "Fan: cooling budget has been suspended."
            : "Fan: spinning up another sprint.",
        );
      }}
    >
      <Box position={[0, -0.13, 0]} size={[0.65, 0.12, 0.5]} color="#ed9f68" />
      <Box position={[0, 0.24, 0]} size={[0.12, 0.65, 0.12]} color={cream} />
      <group ref={head} position={[0, 0.65, 0]}>
        <mesh>
          <torusGeometry args={[0.43, 0.035, 8, 32]} />
          <meshStandardMaterial color={dark} />
        </mesh>
        <group ref={fan} position={[0, 0, 0.01]}>
          {[0, 1, 2].map((i) => (
            <group key={i} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
              <Box
                position={[0, 0.2, 0]}
                size={[0.2, 0.34, 0.06]}
                color="#ed9f68"
                radius={0.08}
              />
            </group>
          ))}
        </group>
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color={cream} />
        </mesh>
      </group>
    </group>
  );
}
