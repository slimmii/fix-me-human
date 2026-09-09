import { curriculum } from "../curriculum";
import type { Assignment } from "../curriculum/types";
import { useAssignmentTexture } from "./useAssignmentTexture";

function PinnedAssignment({
  assignment,
  index,
}: {
  assignment: Assignment;
  index: number;
}) {
  const texture = useAssignmentTexture(assignment, true);
  return (
    <group
      position={[
        3.88,
        2.95 - Math.floor(index / 3) * 0.85,
        -1.1 + (index % 3) * 0.9,
      ]}
      rotation={[0, -Math.PI / 2, 0]}
    >
      <group rotation={[0, 0, index % 2 ? -0.035 : 0.025]}>
        <mesh castShadow receiveShadow>
          <planeGeometry args={[0.528, 0.704]} />
          <meshStandardMaterial map={texture} roughness={0.95} />
        </mesh>
        <mesh
          position={[0, 0.3, 0.016]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
          <meshStandardMaterial
            color="#b9b8a8"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0.3, 0.045]} castShadow>
          <sphereGeometry args={[0.035, 16, 12]} />
          <meshStandardMaterial color="#cc4936" roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
}

export function CompletedAssignments({ completed }: { completed: string[] }) {
  const assignments = curriculum.flatMap((lesson) => lesson.assignments);
  return (
    <>
      {completed.map((id, index) => {
        const assignment = assignments.find((item) => item.id === id);
        return assignment ? (
          <PinnedAssignment key={id} assignment={assignment} index={index} />
        ) : null;
      })}
    </>
  );
}
