import {
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type RefObject,
} from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

// Attach the selection to each mesh so it follows curved and animated parts.
export function useHoverHighlight<T extends THREE.Object3D = THREE.Group>(
  existingRef?: RefObject<T | null>,
  enabled = true,
) {
  const ownRef = useRef<T>(null);
  const ref = existingRef ?? ownRef;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { invalidate, gl } = useThree();
  useLayoutEffect(() => {
    if (!enabled || (!hovered && !focused) || !ref.current) return;
    const meshes: THREE.Mesh[] = [];
    ref.current.traverse((object) => {
      if (object instanceof THREE.Mesh) meshes.push(object);
    });
    const material = new THREE.MeshBasicMaterial({
      color: "#ffdc35",
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const overlays = meshes.map((mesh) => {
      const overlay = new THREE.Mesh(mesh.geometry, material);
      overlay.raycast = () => {};
      mesh.add(overlay);
      return overlay;
    });
    const previousCursor = gl.domElement.style.cursor;
    gl.domElement.style.cursor = "pointer";
    invalidate();
    return () => {
      overlays.forEach((overlay) => overlay.removeFromParent());
      material.dispose();
      gl.domElement.style.cursor = previousCursor;
      invalidate();
    };
  }, [enabled, hovered, focused, ref, gl, invalidate]);
  return {
    mesh: {
      ref,
      onPointerOver: (event: ThreeEvent<PointerEvent>) => {
        if (!enabled) return;
        event.stopPropagation();
        setHovered(true);
      },
      onPointerOut: () => setHovered(false),
    },
    html: {
      onPointerEnter: () => setHovered(true),
      onPointerLeave: () => setHovered(false),
      onFocus: (event: FocusEvent<HTMLElement>) =>
        setFocused(event.currentTarget.matches(":focus-visible")),
      onBlur: () => setFocused(false),
    },
  };
}
