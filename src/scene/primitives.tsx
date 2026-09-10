import { useHoverHighlight } from "./useHoverHighlight";
import { RoundedBox } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
export const mint = "#91bfa5",
  cream = "#e8d9ac",
  dark = "#203f37";
export function Box({
  position,
  size,
  color,
  radius = 0.05,
  ...props
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  radius?: number;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}) {
  return (
    <RoundedBox
      position={position}
      args={size}
      radius={radius}
      smoothness={2}
      {...props}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.7} />
    </RoundedBox>
  );
}
export function Prop({
  children,
  onClick,
  reduced,
  position = [0, 0, 0],
}: {
  children: ReactNode;
  onClick: () => void;
  reduced: boolean;
  position?: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null),
    remaining = useRef(0);
  const highlight = useHoverHighlight(group);
  useFrame((_, dt) => {
    remaining.current = Math.max(0, remaining.current - dt);
    if (group.current)
      group.current.rotation.z = reduced
        ? 0
        : Math.sin(remaining.current * 22) * remaining.current * 0.12;
  });
  return (
    <group
      {...highlight.mesh}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        remaining.current = 0.7;
        onClick();
      }}
    >
      {children}
    </group>
  );
}
