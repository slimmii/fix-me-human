import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
export function Confetti() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    group.current?.children.forEach((c, i) => {
      c.position.y -= dt * (0.3 + (i % 4) * 0.15);
      c.rotation.z += dt;
      if (c.position.y < 1.3) c.position.y = 5;
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 45 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 12) * 3,
            1.8 + (i % 9) * 0.35,
            Math.cos(i) * 1.4,
          ]}
          rotation={[i, i * 2, i]}
        >
          <boxGeometry args={[0.06, 0.13, 0.02]} />
          <meshStandardMaterial
            color={["#f1b650", "#f37757", "#81d7bd"][i % 3]}
          />
        </mesh>
      ))}
    </group>
  );
}
