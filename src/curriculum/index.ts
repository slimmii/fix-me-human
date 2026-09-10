import { scrumBoard } from "./scrum-board";
import type { Lesson } from "./types";
import { validSourceRule, validRuntimeRule } from "../validation/types";
export const curriculum: Lesson[] = scrumBoard;
export function validateCurriculum(lessons: Lesson[]): void {
  if (!lessons.length)
    throw new Error("The curriculum needs at least one lesson.");
  const ids = new Set<string>();
  const unique = (id: string) => {
    if (!/^[a-z][a-z0-9-]*$/.test(id) || ids.has(id))
      throw new Error(`Invalid or duplicate content ID: ${id}`);
    ids.add(id);
  };
  for (const lesson of lessons) {
    unique(lesson.id);
    if (!lesson.title.trim() || !lesson.assignments.length)
      throw new Error(`Empty lesson: ${lesson.id}`);
    for (const assignment of lesson.assignments) {
      unique(assignment.id);
      if (
        !assignment.title.trim() ||
        !assignment.robot?.intro.trim() ||
        !assignment.robot?.success.trim() ||
        !assignment.robot?.retry.trim() ||
        !assignment.brief.endsWith(".md") ||
        !assignment.solution.trim() ||
        !assignment.hints.length ||
        assignment.hints.some((h) => !h.trim())
      )
        throw new Error(`Incomplete assignment: ${assignment.id}`);
      const { source, runtime } = assignment.validation;
      if (
        !source.length ||
        !runtime.length ||
        !source.every(validSourceRule) ||
        !runtime.every(validRuntimeRule)
      )
        throw new Error(`Invalid validation rules: ${assignment.id}`);
    }
  }
}
validateCurriculum(curriculum);
