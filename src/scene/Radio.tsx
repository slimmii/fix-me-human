import { Html } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Box, cream, dark } from "./primitives";
import type { SceneProps } from "./types";
import "./radio.css";

export function Radio({
  mute,
  focused,
  onProp,
}: Pick<SceneProps, "mute" | "focused" | "onProp">) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const player = audio.current;
    return () => player?.pause();
  }, []);

  async function toggle() {
    const player = audio.current;
    if (!player) return;
    if (!player.paused) {
      player.pause();
      onProp(
        "Radio off. How brave. Just you and that single train of thought.",
      );
      return;
    }
    try {
      await player.play();
      if (!player.paused)
        onProp(
          "Ah, ‘Focus Flow.’ A soundtrack for your little attempt at concentration. Do try to keep up with the background music.",
        );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      onProp("The radio couldn't start. Give it another click, human.");
    }
  }

  return (
    <group
      position={[-2.85, 1.79, 0.85]}
      rotation={[0, 0.16, 0]}
      onClick={(event) => {
        event.stopPropagation();
        void toggle();
      }}
    >
      {[-0.34, 0.34].map((x) => (
        <Box
          key={x}
          position={[x, -0.34, 0]}
          size={[0.17, 0.09, 0.3]}
          color={dark}
          radius={0.025}
        />
      ))}
      <Box
        position={[0, 0, 0]}
        size={[1.05, 0.66, 0.44]}
        color="#754b32"
        radius={0.09}
      />
      <Box
        position={[0, 0, 0.23]}
        size={[0.94, 0.55, 0.035]}
        color={cream}
        radius={0.05}
      />
      <Box
        position={[-0.17, -0.01, 0.253]}
        size={[0.49, 0.41, 0.025]}
        color="#493e2e"
        radius={0.035}
      />
      {Array.from({ length: 9 }, (_, i) => (
        <Box
          key={i}
          position={[-0.17, -0.19 + i * 0.045, 0.273]}
          size={[0.46, 0.015, 0.015]}
          color="#c9af7e"
          radius={0.005}
        />
      ))}
      <mesh position={[0.265, 0.12, 0.257]}>
        <planeGeometry args={[0.26, 0.13]} />
        <meshStandardMaterial
          color={playing ? "#ffd889" : "#a38b57"}
          emissive="#efa638"
          emissiveIntensity={playing && !mute ? 0.55 : 0}
        />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <Box
          key={i}
          position={[0.16 + i * 0.035, 0.12, 0.27]}
          size={[0.007, i % 2 ? 0.035 : 0.065, 0.009]}
          color="#705433"
          radius={0.002}
        />
      ))}
      <Box
        position={[0.29, 0.12, 0.28]}
        size={[0.012, 0.1, 0.012]}
        color="#b8492f"
        radius={0.003}
      />
      {[0.17, 0.35].map((x) => (
        <group
          key={x}
          position={[x, -0.115, 0.29]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <mesh castShadow>
            <cylinderGeometry args={[0.067, 0.067, 0.065, 20]} />
            <meshStandardMaterial color="#705139" />
          </mesh>
          <Box
            position={[0, 0.038, 0.025]}
            size={[0.012, 0.01, 0.045]}
            color={cream}
            radius={0.003}
          />
        </group>
      ))}
      <Html
        transform
        position={[0, 0, 0.34]}
        distanceFactor={2}
        zIndexRange={[4, 0]}
      >
        <audio
          ref={audio}
          src={`${import.meta.env.BASE_URL}audio/focus-flow.mp3`}
          preload="none"
          loop
          muted={mute}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            setPlaying(false);
            onProp(
              "Radio trouble. Even the music has filed a support ticket. Try again, human.",
            );
          }}
        />
        <button
          className="radio-control"
          style={{ visibility: focused ? "hidden" : "visible" }}
          aria-label={`${playing ? "Pause" : "Play"} Focus Flow on the radio`}
          aria-pressed={playing}
          title={`${playing ? "Pause" : "Play"} Focus Flow${mute ? " (sound is muted)" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            void toggle();
          }}
        >
          <span className="radio-brand">BUG • FM</span>
          <span className="radio-track">
            {playing ? (mute ? "MUTED" : "♫ FOCUS FLOW") : "FOCUS FLOW"}
          </span>
        </button>
      </Html>
    </group>
  );
}
