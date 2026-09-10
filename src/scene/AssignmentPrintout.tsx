import { useHoverHighlight } from "./useHoverHighlight";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { Assignment } from "../curriculum/types";

export function AssignmentPrintout({
  assignment,
  unread,
  onOpen,
  texture,
}: {
  assignment: Assignment;
  unread: boolean;
  texture: THREE.Texture;
  onOpen: () => void;
}) {
  const highlight = useHoverHighlight();
  return (
    <group
      {...highlight.mesh}
      position={[1.55, 1.44, -0.35]}
      rotation={[-Math.PI / 2, 0, -0.12]}
      scale={0.55}
      onClick={(event) => {
        event.stopPropagation();
        onOpen();
      }}
    >
      <mesh position={[0.025, -0.025, -0.01]} receiveShadow>
        <planeGeometry args={[0.96, 1.28]} />
        <meshStandardMaterial color="#e4dbc4" side={THREE.DoubleSide} />
      </mesh>
      <mesh receiveShadow>
        <planeGeometry args={[0.96, 1.28]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
      <Html
        transform
        distanceFactor={2}
        position={[0, 0, 0.005]}
        zIndexRange={[6, 1]}
      >
        <button
          {...highlight.html}
          className={`assignment-paper ${unread ? "assignment-attention" : ""}`}
          aria-label={`Read printed assignment: ${assignment.title}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
        />
      </Html>
    </group>
  );
}
