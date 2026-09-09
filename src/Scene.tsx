import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { SceneProps as Props } from "./scene/types";
import { World } from "./scene/World";
export default function Scene(props: Props) {
  const [posterFocused, setPosterFocused] = useState(false);
  const posterClick = useRef<
    | ((pointer: THREE.Vector2, event: { stopPropagation: () => void }) => void)
    | null
  >(null);
  useEffect(() => {
    if (props.focused) setPosterFocused(false);
  }, [props.focused]);
  useEffect(() => {
    const exit = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPosterFocused(false);
    };
    window.addEventListener("keydown", exit);
    return () => window.removeEventListener("keydown", exit);
  }, []);
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    setIdle(false);
    if (!props.reduced) return;
    const timer = setTimeout(() => setIdle(true), 900);
    return () => clearTimeout(timer);
  }, [props.reduced]);
  const [webgl] = useState(() => {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return false;
    }
  });
  return webgl ? (
    <Canvas
      onPointerMissed={() => setPosterFocused(false)}
      onClickCapture={(e) => {
        if (!posterFocused) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pointer = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        posterClick.current?.(pointer, e);
      }}
      frameloop={props.reduced && idle ? "demand" : "always"}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      shadows
      camera={{ position: [0, 3.45, 6.8], fov: 44 }}
      dpr={[1, 1.25]}
    >
      <Suspense fallback={null}>
        <World
          {...props}
          posterFocused={posterFocused}
          onPoster={() => setPosterFocused(true)}
          onDesk={() => setPosterFocused(false)}
          posterClick={posterClick}
        />
      </Suspense>
    </Canvas>
  ) : (
    <div className="webgl-fallback">
      <h2>Your browser cannot start WebGL.</h2>
      <p>You can still type React and use the little browser.</p>
      <button onClick={props.onComputer}>Start</button>
      {props.focused && (
        <div className="fallback-computer">{props.computer}</div>
      )}
    </div>
  );
}
