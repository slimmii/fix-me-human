import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { readOfficeTime } from "../game/officeTime";
import { useOfficeTime } from "../game/useOfficeTime";
import { BugCounterSign } from "./Posters";
import { cream, dark } from "./primitives";
import { printTexture } from "./printTexture";
import type { SceneProps } from "./types";
import { useHoverHighlight } from "./useHoverHighlight";

export function WallClock({
  officeClock,
  reduced,
  onProp,
}: Pick<SceneProps, "officeClock" | "reduced" | "onProp">) {
  const time = useOfficeTime(officeClock);
  const invalidate = useThree((state) => state.invalidate);
  const hourHand = useRef<THREE.Group>(null);
  const minuteHand = useRef<THREE.Group>(null);
  const highlight = useHoverHighlight();
  const face = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#f5f0d3";
    ctx.fillRect(0, 0, 512, 512);
    ctx.translate(256, 256);
    ctx.strokeStyle = dark;
    for (let tick = 0; tick < 60; tick++) {
      ctx.save();
      ctx.rotate((tick * Math.PI) / 30);
      ctx.lineWidth = tick % 5 === 0 ? 7 : 2;
      ctx.beginPath();
      ctx.moveTo(0, -225);
      ctx.lineTo(0, tick % 5 === 0 ? -203 : -216);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = dark;
    ctx.font = "bold 46px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let hour = 1; hour <= 12; hour++) {
      const angle = (hour * Math.PI) / 6;
      ctx.fillText(String(hour), Math.sin(angle) * 171, -Math.cos(angle) * 171);
    }
    ctx.font = "bold 21px sans-serif";
    ctx.fillText("BUG INDUSTRIES", 0, -75);
    return printTexture(canvas);
  }, []);
  useEffect(() => {
    const ctx = (face.image as HTMLCanvasElement).getContext("2d")!;
    ctx.save();
    ctx.resetTransform();
    ctx.fillStyle = "#d7dfbd";
    ctx.fillRect(166, 326, 180, 48);
    ctx.strokeStyle = "#9eaf91";
    ctx.lineWidth = 2;
    ctx.strokeRect(166, 326, 180, 48);
    ctx.fillStyle = dark;
    ctx.font = "bold 32px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(time.time, 256, 351);
    ctx.restore();
    face.needsUpdate = true;
    invalidate();
  }, [face, invalidate, time.time]);
  useEffect(() => () => face.dispose(), [face]);
  useFrame(() => {
    const current = reduced ? time : readOfficeTime(officeClock);
    if (hourHand.current)
      hourHand.current.rotation.z = -(current.hours * Math.PI) / 6;
    if (minuteHand.current)
      minuteHand.current.rotation.z = -(current.minutes * Math.PI) / 30;
  });

  return (
    <>
      <BugCounterSign days={time.daysWithoutBug} />
      <group
        {...highlight.mesh}
        name="office-wall-clock"
        position={[-1.17, 3.5, -1.78]}
        onClick={(event) => {
          event.stopPropagation();
          const current = readOfficeTime(officeClock);
          onProp(
            `Office clock: ${current.time}. ${current.daysWithoutBug} days without a bug. Management is watching.`,
          );
        }}
      >
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.1, 64]} />
          <meshStandardMaterial color={dark} roughness={0.65} />
        </mesh>
        <mesh position={[0, 0, 0.057]}>
          <torusGeometry args={[0.365, 0.012, 8, 64]} />
          <meshStandardMaterial color={cream} />
        </mesh>
        <mesh position={[0, 0, 0.055]}>
          <circleGeometry args={[0.36, 64]} />
          <meshBasicMaterial map={face} toneMapped={false} />
        </mesh>
        <group ref={hourHand} position={[0, 0, 0.065]}>
          <mesh position={[0, 0.085, 0]}>
            <boxGeometry args={[0.028, 0.22, 0.012]} />
            <meshBasicMaterial color={dark} />
          </mesh>
        </group>
        <group ref={minuteHand} position={[0, 0, 0.08]}>
          <mesh position={[0, 0.125, 0]}>
            <boxGeometry args={[0.018, 0.31, 0.012]} />
            <meshBasicMaterial color="#d37748" />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.095]}>
          <circleGeometry args={[0.027, 24]} />
          <meshBasicMaterial color={dark} />
        </mesh>
      </group>
    </>
  );
}
