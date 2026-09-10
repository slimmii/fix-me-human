import { useHoverHighlight } from "./useHoverHighlight";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { printerSound } from "../audio";
import { Box, cream, dark } from "./primitives";
import {
  FLAT_ROTATION,
  INPUT_POSITION,
  INPUT_ROTATION,
  OUTPUT_POSITION,
  isPrinterBusy,
  samplePrinter,
  type PaperPose,
  type PrinterStage,
} from "./printerAnimation";
import { AssignmentPrintout } from "./AssignmentPrintout";
import { useAssignmentTexture } from "./useAssignmentTexture";
import type { SceneProps as Props } from "./types";
export function Printer({
  reduced,
  mute,
  assignment,
  assignmentReady,
  assignmentPrintRequested,
  assignmentCollected,
  assignmentUnread,
  completedAssignments,
  onAssignment,
  onAssignmentReady,
  onAssignmentCollected,
}: Pick<
  Props,
  | "reduced"
  | "mute"
  | "assignment"
  | "assignmentReady"
  | "assignmentPrintRequested"
  | "assignmentCollected"
  | "assignmentUnread"
  | "completedAssignments"
  | "onAssignment"
  | "onAssignmentReady"
  | "onAssignmentCollected"
>) {
  const invalidate = useThree((state) => state.invalidate);
  const paper = useRef<THREE.Group>(null);
  const input = useRef<THREE.Group>(null);
  const assignmentCompleted = completedAssignments.includes(assignment.id);
  const initialStage: PrinterStage =
    assignmentCollected || assignmentCompleted
      ? "placed"
      : assignmentReady
        ? "ready"
        : assignmentPrintRequested
          ? "printing"
          : "idle";
  const [stage, setStage] = useState<PrinterStage>(initialStage);
  const highlight = useHoverHighlight(undefined, stage === "ready");
  const stageRef = useRef<PrinterStage>(initialStage);
  const startedAt = useRef(performance.now());
  const stopSound = useRef<(() => void) | undefined>(undefined);
  useEffect(() => {
    if (isPrinterBusy(stageRef.current)) stopSound.current = printerSound(mute);
    return () => stopSound.current?.();
  }, [mute]);
  const texture = useAssignmentTexture(assignment);
  useEffect(() => {
    invalidate();
  }, [stage, invalidate]);
  useFrame((state) => {
    if (!paper.current || !input.current || !isPrinterBusy(stageRef.current))
      return;
    const frame = samplePrinter(
      stageRef.current,
      (performance.now() - startedAt.current) / 1000,
      reduced,
    );
    applyPaperPose(input.current, frame.input);
    applyPaperPose(paper.current, frame.output);
    if (isPrinterBusy(frame.stage)) state.invalidate();
    else {
      stageRef.current = frame.stage;
      setStage(frame.stage);
      stopSound.current?.();
      onAssignmentReady();
    }
  });

  function handlePickup(
    event: Pick<ThreeEvent<MouseEvent>, "stopPropagation">,
  ) {
    event.stopPropagation();
    if (stageRef.current !== "ready") return;
    stageRef.current = "placed";
    setStage("placed");
    if (paper.current) paper.current.visible = false;
    onAssignmentCollected();
    invalidate();
  }

  return (
    <>
      {stage === "placed" && !assignmentCompleted && (
        <AssignmentPrintout
          assignment={assignment}
          unread={assignmentUnread}
          texture={texture}
          onOpen={onAssignment}
        />
      )}
      <group
        {...highlight.mesh}
        position={[2.7, 1.6, 0.2]}
        onClick={handlePickup}
      >
        {stage !== "placed" && stage !== "idle" && (
          <Html
            transform
            position={[0, -0.008, 0.765]}
            rotation={FLAT_ROTATION}
            distanceFactor={2}
            zIndexRange={[6, 1]}
          >
            <button
              {...highlight.html}
              className={`printer-button ${stage === "ready" ? "assignment-attention" : ""}`}
              aria-label={`Grab new assignment: ${assignment.title}`}
              disabled={stage !== "ready"}
              onClick={handlePickup}
            />
          </Html>
        )}
        <Box position={[0, 0, 0]} size={[1.05, 0.45, 0.82]} color={cream} />
        <Box
          position={[0, 0.25, -0.1]}
          size={[0.85, 0.08, 0.5]}
          color="#859f83"
        />
        <Box
          position={[0, -0.02, 0.43]}
          size={[0.8, 0.08, 0.03]}
          color={dark}
        />
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
            <planeGeometry args={[0.48, 0.64]} />
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
          visible={stage === "ready"}
          position={OUTPUT_POSITION}
          rotation={FLAT_ROTATION}
        >
          <mesh castShadow receiveShadow>
            <planeGeometry args={[0.48, 0.64]} />
            <meshStandardMaterial
              map={texture}
              side={THREE.DoubleSide}
              roughness={0.9}
            />
          </mesh>
        </group>
      </group>
    </>
  );
}

function applyPaperPose(group: THREE.Group, pose: PaperPose) {
  group.visible = pose.visible;
  group.position.set(...pose.position);
  group.rotation.set(...pose.rotation);
  group.scale.set(1, pose.length, 1);
}
