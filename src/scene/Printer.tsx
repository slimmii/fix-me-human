import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { printerSound } from "../audio";
import { Box, cream, dark } from "./primitives";
import {
  FLAT_ROTATION,
  INPUT_POSITION,
  INPUT_ROTATION,
  OUTPUT_POSITION,
  isPrinterBusy,
  printerClick,
  samplePrinter,
  type PaperPose,
  type PrinterStage,
} from "./printerAnimation";
import { printTexture } from "./printTexture";
import type { SceneProps as Props } from "./types";
export function Printer({
  reduced,
  onProp,
  celebrate,
  mute,
}: Pick<Props, "reduced" | "onProp" | "celebrate" | "mute">) {
  const invalidate = useThree((state) => state.invalidate);
  const paper = useRef<THREE.Group>(null);
  const input = useRef<THREE.Group>(null);
  const stage = useRef<PrinterStage>("input");
  const elapsed = useRef(0);
  const stopSound = useRef<(() => void) | undefined>(undefined);
  useEffect(() => {
    if (mute) stopSound.current?.();
  }, [mute]);
  useEffect(() => () => stopSound.current?.(), []);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 480;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff6db";
    ctx.fillRect(0, 0, 384, 480);
    ctx.fillStyle = "#345242";
    ctx.textAlign = "center";
    ctx.font = "bold 28px monospace";
    ctx.fillText("BUG INDUSTRIES", 192, 65);
    ctx.font = "bold 23px monospace";
    ctx.fillText("PLEASE FILE", 192, 122);
    ctx.fillText("ON THE FLOOR", 192, 156);
    ctx.fillStyle = "#8e9c7c";
    for (let i = 0; i < 7; i++)
      ctx.fillRect(48, 205 + i * 23, i === 6 ? 156 : 288, 5);
    ctx.font = "18px monospace";
    ctx.fillText("Self-filing memo #042", 192, 432);
    return printTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame((state, delta) => {
    if (!paper.current || !input.current || !isPrinterBusy(stage.current))
      return;
    elapsed.current += delta;
    const frame = samplePrinter(stage.current, elapsed.current, reduced);
    applyPaperPose(input.current, frame.input);
    applyPaperPose(paper.current, frame.output);
    stage.current = frame.stage;
    if (isPrinterBusy(frame.stage)) state.invalidate();
    else stopSound.current?.();
  });

  function handlePrintClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    if (isPrinterBusy(stage.current)) return;
    elapsed.current = 0;
    stage.current = printerClick(stage.current);
    invalidate();
    if (stage.current === "printing") {
      stopSound.current = printerSound(mute);
      onProp(
        celebrate
          ? "Printer: promotion approved. Salary unchanged."
          : "Printer: putting that in writing. Now it’s officially somebody else’s problem.",
      );
    } else {
      onProp("Printer: automatic filing enabled. The floor is a folder now.");
    }
  }
  return (
    <group position={[2.7, 1.6, 0.2]} onClick={handlePrintClick}>
      <Box position={[0, 0, 0]} size={[1.05, 0.45, 0.82]} color={cream} />
      <Box
        position={[0, 0.25, -0.1]}
        size={[0.85, 0.08, 0.5]}
        color="#859f83"
      />
      <Box position={[0, -0.02, 0.43]} size={[0.8, 0.08, 0.03]} color={dark} />
      <group position={[0, 0.54, -0.325]} rotation={INPUT_ROTATION}>
        <Box
          position={[0, 0, -0.018]}
          size={[0.7, 0.7, 0.035]}
          color="#859f83"
          radius={0.018}
        />
      </group>
      <group ref={input} position={INPUT_POSITION} rotation={INPUT_ROTATION}>
        <mesh>
          <planeGeometry args={[0.58, 0.64]} />
          <meshStandardMaterial color="#fff6db" side={THREE.DoubleSide} />
        </mesh>
      </group>
      <Box
        position={[0, -0.055, 0.725]}
        size={[0.72, 0.07, 0.59]}
        color="#859f83"
        radius={0.025}
      />
      {[-0.345, 0.345].map((x) => (
        <Box
          key={x}
          position={[x, -0.02, 0.73]}
          size={[0.035, 0.06, 0.56]}
          color="#6c876c"
          radius={0.012}
        />
      ))}
      <group
        ref={paper}
        visible={false}
        position={OUTPUT_POSITION}
        rotation={FLAT_ROTATION}
      >
        <mesh castShadow receiveShadow>
          <planeGeometry args={[0.58, 0.64]} />
          <meshStandardMaterial
            map={texture}
            side={THREE.DoubleSide}
            roughness={0.9}
          />
        </mesh>
      </group>
    </group>
  );
}

function applyPaperPose(group: THREE.Group, pose: PaperPose) {
  group.visible = pose.visible;
  group.position.set(...pose.position);
  group.rotation.set(...pose.rotation);
  group.scale.set(1, pose.length, 1);
}
