import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Box } from "./primitives";
import type { SceneProps } from "./types";
import { useHoverHighlight } from "./useHoverHighlight";

const PULL_DURATION = 0.7;
const FALL_DURATION = 1.1;
const SLOT_HEIGHT = 0.108;
const ease = (value: number) => {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

function shapeTissue(
  sheet: THREE.PlaneGeometry,
  unfold: number,
  emergence = 1,
) {
  const vertices = sheet.attributes.position;
  const uv = sheet.attributes.uv;
  for (let i = 0; i < vertices.count; i++) {
    const x = (uv.getX(i) - 0.5) * 0.32;
    const height = uv.getY(i);
    const y = (height - 0.5) * 0.42;
    // The gathered base stays in the opening while the same sheet straightens.
    vertices.setXYZ(
      i,
      x * (0.4 + 0.6 * height + 0.6 * unfold * (1 - height)),
      ((0.3 + 0.12 * unfold) * height - 0.14 * (1 - unfold) * height ** 4) *
        emergence,
      (0.14 * (1 - unfold) * height ** 2 +
        Math.sin(x * 35 + y * 12) * (0.02 + 0.015 * unfold) * height) *
        emergence,
    );
  }
  vertices.needsUpdate = true;
  sheet.computeVertexNormals();
  sheet.computeBoundingSphere();
}

function Tissue({
  id,
  pulled,
  reduced,
  onCleared,
}: {
  id: number;
  pulled: boolean;
  reduced: boolean;
  onCleared: () => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const emergence = useRef(id === 0 || reduced ? 1 : 0);
  const cleared = useRef(false);
  const finished = useRef(false);
  const geometry = useMemo(() => {
    const sheet = new THREE.PlaneGeometry(0.32, 0.42, 8, 12);
    shapeTissue(sheet, 0, id === 0 || reduced ? 1 : 0);
    return sheet;
    // Each sheet keeps its original geometry when it becomes the pulled tissue.
  }, [id]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((state, delta) => {
    if (!ref.current || finished.current) return;
    if (!pulled) {
      if (emergence.current < 1) {
        emergence.current = reduced
          ? 1
          : Math.min(1, emergence.current + delta / 0.25);
        shapeTissue(geometry, 0, ease(emergence.current));
        state.invalidate();
      }
      return;
    }
    elapsed.current = reduced
      ? PULL_DURATION + FALL_DURATION
      : Math.min(PULL_DURATION + FALL_DURATION, elapsed.current + delta);
    const pull = ease(elapsed.current / PULL_DURATION);
    const fall = ease((elapsed.current - PULL_DURATION) / FALL_DURATION);
    const side = id % 2 ? -1 : 1;
    shapeTissue(
      geometry,
      pull,
      ease(emergence.current) + (1 - ease(emergence.current)) * pull,
    );
    ref.current.position.set(
      side * (0.43 * fall + Math.sin(fall * Math.PI * 3) * 0.035),
      SLOT_HEIGHT +
        0.1 * ease((pull - 0.65) / 0.35) +
        Math.sin(fall * Math.PI) * 0.2 -
        0.26 * fall +
        (id % 3) * 0.004 * fall,
      0.12 * fall + (id % 3) * 0.025 * fall,
    );
    ref.current.rotation.set((Math.PI * fall) / 2, 0, side * fall * 0.35);
    if (!cleared.current && elapsed.current >= PULL_DURATION) {
      cleared.current = true;
      onCleared();
    }
    finished.current = elapsed.current >= PULL_DURATION + FALL_DURATION;
    if (!finished.current) state.invalidate();
  });
  return (
    <group ref={ref} position={[0, SLOT_HEIGHT, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#fff6e4"
          side={THREE.DoubleSide}
          roughness={1}
        />
      </mesh>
    </group>
  );
}

export function TissueBox({
  reduced,
  focused,
  onProp,
}: Pick<SceneProps, "reduced" | "focused" | "onProp">) {
  const highlight = useHoverHighlight(undefined, !focused);
  const nextId = useRef(1);
  const pulling = useRef(false);
  const [tissues, setTissues] = useState([{ id: 0, pulled: false }]);
  const busy = tissues.every((tissue) => tissue.pulled);
  function readyNext() {
    const id = nextId.current++;
    pulling.current = false;
    setTissues((previous) => [...previous.slice(-5), { id, pulled: false }]);
  }
  function dispense() {
    if (pulling.current) return;
    pulling.current = true;
    setTissues((previous) =>
      previous.map((tissue) =>
        tissue.pulled ? tissue : { ...tissue, pulled: true },
      ),
    );
    onProp(
      "Tissues. For tears, nasal discharge… and other bodily fluids. Your species has some filthy little habits.",
    );
  }
  return (
    <group
      position={[1.78, 1.52, 1]}
      onClick={(event) => {
        event.stopPropagation();
        dispense();
      }}
    >
      <group
        {...highlight.mesh}
        onClick={(event) => {
          event.stopPropagation();
          dispense();
        }}
      >
        <Box position={[0, 0, 0]} size={[0.68, 0.22, 0.7]} color="#358875" />
        <Box
          position={[0, 0.114, 0]}
          size={[0.36, 0.008, 0.07]}
          color="#203f37"
          radius={0.003}
        />
        <Html
          transform
          position={[0, 0, 0.36]}
          distanceFactor={2}
          zIndexRange={[4, 0]}
        >
          <button
            {...highlight.html}
            aria-label="Pull a tissue"
            title="Pull a tissue"
            disabled={busy}
            aria-busy={busy}
            style={{
              width: 132,
              height: 44,
              padding: 0,
              border: 0,
              background: "transparent",
              cursor: busy ? "default" : "pointer",
              visibility: focused ? "hidden" : "visible",
            }}
            onClick={(event) => {
              event.stopPropagation();
              dispense();
            }}
          />
        </Html>
      </group>
      {tissues.map((tissue) => (
        <Tissue
          key={tissue.id}
          {...tissue}
          reduced={reduced}
          onCleared={readyNext}
        />
      ))}
    </group>
  );
}
