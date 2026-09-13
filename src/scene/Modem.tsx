import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Box } from "./primitives";
import { printTexture } from "./printTexture";
import type { SceneProps } from "./types";
import { useHoverHighlight } from "./useHoverHighlight";

const indicators = ["HS", "AA", "CD", "OH", "RD", "SD", "TR", "MR"];

export function Modem({
  focused,
  onProp,
  mute,
}: Pick<SceneProps, "focused" | "onProp" | "mute">) {
  const highlight = useHoverHighlight(undefined, !focused);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const player = new Audio(
      `${import.meta.env.BASE_URL}audio/dial-up-handshake.mp3`,
    );
    player.preload = "auto";
    player.volume = 0.65;
    audio.current = player;
    return () => {
      audio.current = null;
      player.pause();
      player.removeAttribute("src");
      player.load();
    };
  }, []);

  useEffect(() => {
    if (audio.current) audio.current.muted = mute;
  }, [mute]);

  async function connect() {
    const player = audio.current;
    if (!player) return;
    onProp(
      "U.S. Robotics 56K modem. Please ask everyone to stay off the phone. The internet is coming through.",
    );
    try {
      // Reuse one player so repeated clicks restart, never layer handshakes.
      player.muted = mute;
      if (player.error) player.load();
      player.currentTime = 0;
      await player.play();
    } catch (error) {
      if (audio.current !== player) return;
      if (error instanceof DOMException && error.name === "AbortError") return;
      onProp(
        "No carrier. The modem couldn't play its handshake. Try again, human.",
      );
    }
  }

  const textures = useMemo(() => {
    const lid = document.createElement("canvas");
    lid.width = 1024;
    lid.height = 400;
    const top = lid.getContext("2d")!;
    top.fillStyle = "#303b39";
    top.font = "italic 800 100px Arial, sans-serif";
    top.fillText("U.S. Robotics", 40, 125);
    top.fillStyle = "#a74335";
    top.fillRect(42, 155, 935, 9);
    top.fillStyle = "#303b39";
    top.font = "700 71px Arial, sans-serif";
    top.fillText("Sportster", 42, 260);
    top.font = "700 88px Arial, sans-serif";
    top.fillText("56K", 773, 260);
    top.font = "32px Arial, sans-serif";
    top.fillText("FAXMODEM", 45, 327);

    const panel = document.createElement("canvas");
    panel.width = 1024;
    panel.height = 160;
    const front = panel.getContext("2d")!;
    front.fillStyle = "#e1d9bd";
    front.textAlign = "center";
    front.font = "700 51px Arial, sans-serif";
    indicators.forEach((label, index) => {
      front.fillText(label, 64 + index * 128, 64);
    });
    return { lid: printTexture(lid), panel: printTexture(panel) };
  }, []);
  const cable = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.3, -0.04, -0.43),
        new THREE.Vector3(0.34, -0.12, -0.69),
        new THREE.Vector3(0.75, -0.15, -0.86),
        new THREE.Vector3(1.29, -0.1, -0.73),
      ]),
    [],
  );
  useEffect(
    () => () => {
      textures.lid.dispose();
      textures.panel.dispose();
    },
    [textures],
  );

  return (
    <group
      {...highlight.mesh}
      name="us-robotics-56k-modem"
      position={[-1.96, 1.585, -0.38]}
      onClick={(event) => {
        event.stopPropagation();
        void connect();
      }}
    >
      {[-0.43, 0.43].flatMap((x) =>
        [-0.28, 0.28].map((z) => (
          <Box
            key={`${x}:${z}`}
            position={[x, -0.15, z]}
            size={[0.12, 0.055, 0.13]}
            color="#494941"
            radius={0.018}
          />
        )),
      )}
      <Box
        position={[0, 0, 0]}
        size={[1.16, 0.27, 0.84]}
        color="#ded5b9"
        radius={0.045}
      />
      <Box
        position={[0, -0.087, 0]}
        size={[1.165, 0.018, 0.82]}
        color="#a39d89"
        radius={0.008}
      />
      <Box
        position={[0, -0.005, 0.42]}
        size={[1.055, 0.188, 0.025]}
        color="#262c2b"
        radius={0.018}
      />
      <mesh position={[0, 0.137, 0.045]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.02, 0.3984]} />
        <meshBasicMaterial map={textures.lid} transparent depthWrite={false} />
      </mesh>
      <Html
        transform
        position={[0, 0.142, 0.045]}
        rotation={[-Math.PI / 2, 0, 0]}
        distanceFactor={2}
        zIndexRange={[4, 0]}
      >
        <button
          {...highlight.html}
          aria-label="Play dial-up handshake on the U.S. Robotics modem"
          title={`Play dial-up handshake${mute ? " (sound is muted)" : ""}`}
          style={{
            display: "block",
            width: 204,
            height: 80,
            padding: 0,
            border: 0,
            background: "transparent",
            boxShadow: "none",
            transform: "none",
            cursor: "pointer",
            visibility: focused ? "hidden" : "visible",
          }}
          onClick={(event) => {
            event.stopPropagation();
            void connect();
          }}
        />
      </Html>
      <mesh position={[0, 0.008, 0.435]}>
        <planeGeometry args={[0.98, 0.153125]} />
        <meshBasicMaterial
          map={textures.panel}
          transparent
          depthWrite={false}
        />
      </mesh>
      {indicators.map((label, index) => (
        <mesh key={label} position={[-0.42875 + index * 0.1225, -0.03, 0.439]}>
          <boxGeometry args={[0.045, 0.024, 0.012]} />
          <meshStandardMaterial
            color={index >= 6 ? "#ef7148" : "#633c32"}
            emissive="#ff5425"
            emissiveIntensity={index >= 6 ? 1.2 : 0}
            roughness={0.35}
          />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, index) => (
        <Box
          key={index}
          position={[-0.44 + index * 0.08, 0.135, -0.285]}
          size={[0.025, 0.009, 0.14]}
          color="#8c8978"
          radius={0.004}
        />
      ))}
      <Box
        position={[0.3, -0.035, -0.437]}
        size={[0.13, 0.09, 0.07]}
        color="#77796f"
        radius={0.012}
      />
      <mesh castShadow>
        <tubeGeometry args={[cable, 24, 0.017, 6, false]} />
        <meshStandardMaterial color="#666b60" roughness={0.85} />
      </mesh>
    </group>
  );
}
