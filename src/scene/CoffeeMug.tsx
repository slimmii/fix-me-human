import { useHoverHighlight } from "./useHoverHighlight";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import type { SceneProps as Props } from "./types";
import { CoffeeSteam } from "./CoffeeSteam";
import type { FanAirflow } from "./fanAirflow";

export function CoffeeMug({
  reduced,
  onProp,
  airflow,
}: Pick<Props, "reduced" | "onProp"> & { airflow?: FanAirflow }) {
  const mug = useRef<THREE.Group>(null);
  const highlight = useHoverHighlight(mug);
  const [pulse, setPulse] = useState(0);
  useFrame(({ clock }) => {
    if (mug.current)
      mug.current.rotation.z = reduced
        ? 0
        : Math.sin(clock.elapsedTime * 14) *
          Math.max(0, pulse - performance.now() / 1000) *
          0.1;
  });

  return (
    <group position={[-1.9, 1.7, 0.65]}>
      {!reduced && <CoffeeSteam airflow={airflow} />}
      <group
        {...highlight.mesh}
        onClick={(e) => {
          e.stopPropagation();
          setPulse(performance.now() / 1000 + 1);
          onProp("Coffee: 98% caffeine. 2% unresolved promises.");
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.26, 0.23, 0.55, 24]} />
          <meshStandardMaterial color="#f7eee0" />
        </mesh>
        <mesh position={[0, 0.282, 0]}>
          <cylinderGeometry args={[0.215, 0.215, 0.015, 24]} />
          <meshStandardMaterial color="#56392b" />
        </mesh>
        <mesh position={[0.28, 0, 0]}>
          <torusGeometry args={[0.17, 0.055, 8, 16]} />
          <meshStandardMaterial color="#f7eee0" />
        </mesh>
        <Html
          zIndexRange={[5, 0]}
          pointerEvents="none"
          style={{ pointerEvents: "none" }}
          position={[0, 0, 0.25]}
          transform
          distanceFactor={1.8}
        >
          <b className="mug-label">
            I ♥<br />
            BUGS
          </b>
        </Html>
      </group>
    </group>
  );
}
