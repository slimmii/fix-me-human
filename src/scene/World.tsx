import { ContactShadows } from "@react-three/drei";
import { CoffeeMug } from "./CoffeeMug";
import { Cubicle } from "./Cubicle";
import { DeskFan } from "./DeskFan";
import { Radio } from "./Radio";
import { Box, Prop, cream, dark } from "./primitives";
import type { WorldProps } from "./types";
import { useSeatedCamera } from "./useSeatedCamera";
import { Workstation } from "./Workstation";

import { Confetti } from "./Confetti";
import { BugCounterSign, MotivationalPoster } from "./Posters";
import { Printer } from "./Printer";
import { CompletedAssignments } from "./CompletedAssignments";
import { Robot } from "./Robot";
export function World(props: WorldProps) {
  const { focused, reduced, onComputer, onProp, celebrate } = props;
  const cameraHandlers = useSeatedCamera(props);
  return (
    <group {...cameraHandlers}>
      <Cubicle />
      <CompletedAssignments completed={props.completedAssignments} />
      <Workstation
        reduced={reduced}
        focused={focused}
        onComputer={onComputer}
        onProp={onProp}
        computer={props.computer}
      />
      <CoffeeMug reduced={reduced} onProp={onProp} />
      <DeskFan reduced={reduced} onProp={onProp} />
      <Radio mute={props.mute} focused={focused} onProp={onProp} />
      <Printer
        completedAssignments={props.completedAssignments}
        key={`${props.assignment.id}:${props.completedAssignments.includes(props.assignment.id)}:${props.assignmentPrintRequested}`}
        assignment={props.assignment}
        assignmentReady={props.assignmentReady}
        assignmentPrintRequested={props.assignmentPrintRequested}
        assignmentCollected={props.assignmentCollected}
        assignmentUnread={props.assignmentUnread}
        onAssignment={props.onAssignment}
        onAssignmentReady={props.onAssignmentReady}
        onAssignmentCollected={props.onAssignmentCollected}
        mute={props.mute}
        reduced={reduced}
      />
      <Prop
        reduced={reduced}
        onClick={() => {
          onProp(
            "Floppy disk: 1.44 MB. Somehow still holds the entire company strategy.",
          );
        }}
      >
        <Box
          position={[-0.8, 1.48, -1.25]}
          size={[1, 0.15, 0.5]}
          color={cream}
        />
        <Box
          position={[-0.8, 1.49, -0.99]}
          size={[0.73, 0.045, 0.02]}
          color={dark}
        />
      </Prop>
      <MotivationalPoster onClick={props.onPoster} />
      <BugCounterSign />
      <Robot
        reduced={reduced}
        onProp={onProp}
        celebrate={celebrate}
        mood={props.mood}
      />
      <ContactShadows
        frames={1}
        resolution={256}
        position={[0, 0.01, 0]}
        opacity={0.3}
        scale={15}
        blur={2}
        far={5}
      />
      {celebrate && !reduced && <Confetti />}
    </group>
  );
}
