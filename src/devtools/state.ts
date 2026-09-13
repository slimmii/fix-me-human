import { curriculum } from "../curriculum";
import type { Assignment } from "../curriculum/types";
import { assignmentProject, type Save } from "../progression";
import { ENTRY_FILE, type CodeProject } from "../project";
import { initialStory } from "../game/story";

export const assignments = curriculum.flatMap((lesson) =>
  lesson.assignments.map((assignment) => ({ lesson, assignment })),
);
export type AssignmentTarget = string | number;
export type ProjectMode = "saved" | "solution" | "starter";

export function resolveAssignment(target: AssignmentTarget) {
  const entry =
    typeof target === "number"
      ? Number.isInteger(target) && assignments[target - 1]
      : assignments.find(({ assignment }) => assignment.id === target);
  if (!entry)
    throw new Error(
      `Unknown assignment: ${target}. Use humanDev.list() for IDs and numbers (1–${assignments.length}).`,
    );
  return entry;
}

function referenceProject(
  assignment: Assignment,
  mode: "solution" | "starter",
): CodeProject {
  return {
    files: {
      ...(mode === "solution"
        ? (assignment.solutionFiles ?? { [ENTRY_FILE]: assignment.solution })
        : (assignment.starterFiles ?? {
            [ENTRY_FILE]: assignment.starterCode ?? "",
          })),
    },
    activeFile: ENTRY_FILE,
  };
}

/** Build a valid, reloadable checkpoint without erasing existing projects. */
export function prepareAssignment(
  save: Save,
  target: AssignmentTarget,
  mode: ProjectMode = "saved",
): Save {
  const { lesson, assignment } = resolveAssignment(target);
  const chapter = assignments.findIndex(
    (entry) => entry.assignment.id === assignment.id,
  );
  const previous = assignments.slice(0, chapter);
  const next: Save = {
    ...save,
    phase: "coding",
    lessonId: lesson.id,
    assignmentId: assignment.id,
    revisitingAssignment: save.completed.includes(assignment.id),
    completed: [
      ...new Set([
        ...save.completed,
        ...previous.map(({ assignment }) => assignment.id),
      ]),
    ],
    collectedAssignments: [
      ...new Set([...save.collectedAssignments, assignment.id]),
    ],
    projects: { ...save.projects },
    drafts: { ...save.drafts },
    story: {
      ...save.story,
      [assignment.id]: initialStory({
        assignment,
        chapter,
        collected: true,
        completed: save.completed.includes(assignment.id),
      }),
    },
  };
  for (const { assignment: prerequisite } of previous) {
    if (
      !next.projects[prerequisite.id] &&
      !Object.hasOwn(next.drafts, prerequisite.id)
    ) {
      const project = referenceProject(prerequisite, "solution");
      next.projects[prerequisite.id] = project;
      next.drafts[prerequisite.id] = project.files[ENTRY_FILE];
    }
  }
  const project =
    mode === "saved"
      ? assignmentProject(next, assignment.id)
      : referenceProject(assignment, mode);
  next.projects[assignment.id] = { ...project, files: { ...project.files } };
  next.drafts[assignment.id] = project.files[ENTRY_FILE];
  return next;
}
