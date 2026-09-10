import {
  DEFAULT_GRAPHICS_QUALITY,
  isGraphicsQuality,
  type GraphicsQuality,
} from "./graphics";
import {
  decodeProject,
  singleFileProject,
  ENTRY_FILE,
  type CodeProject,
} from "./project";
import { curriculum } from "./curriculum";
import type { Lesson } from "./curriculum/types";
import { decodeStory, type AssignmentStory } from "./game/story";
import { decodeOfficeClock, type OfficeClock } from "./game/officeTime";
export type Phase = "onboarding" | "coding" | "review" | "complete";
export type Save = {
  version: 4;
  phase: Phase;
  lessonId: string;
  assignmentId: string;
  completed: string[];
  collectedAssignments: string[];
  readAssignments: string[];
  revisitingAssignment: boolean;
  drafts: Record<string, string>;
  projects: Record<string, CodeProject>;
  story: Record<string, AssignmentStory>;
  officeClock: OfficeClock | null;
  settings: {
    mute: boolean;
    reducedMotion: boolean;
    crt: boolean;
    graphicsQuality: GraphicsQuality;
  };
};
export const KEY = "please-fix-human:v4";
export const fresh = (lessons = curriculum): Save => ({
  version: 4,
  phase: "onboarding",
  lessonId: lessons[0].id,
  assignmentId: lessons[0].assignments[0].id,
  completed: [],
  collectedAssignments: [],
  readAssignments: [],
  revisitingAssignment: false,
  drafts: {},
  projects: {},
  story: {},
  officeClock: null,
  settings: {
    mute: false,
    reducedMotion:
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    crt: false,
    graphicsQuality: DEFAULT_GRAPHICS_QUALITY,
  },
});
export const lessonDone = (save: Save, lesson: Lesson) =>
  lesson.assignments.every((a) => save.completed.includes(a.id));
export const unlocked = (
  save: Save,
  lessonId: string,
  lessons = curriculum,
) => {
  const index = lessons.findIndex((l) => l.id === lessonId);
  return (
    index >= 0 && lessons.slice(0, index).every((l) => lessonDone(save, l))
  );
};
export const assignmentUnlocked = (save: Save, lesson: Lesson, id: string) => {
  const index = lesson.assignments.findIndex((a) => a.id === id);
  return (
    index >= 0 &&
    lesson.assignments
      .slice(0, index)
      .every((a) => save.completed.includes(a.id))
  );
};
export function availableAssignments(save: Save, lessons = curriculum) {
  return lessons.flatMap((lesson) =>
    unlocked(save, lesson.id, lessons)
      ? lesson.assignments
          .filter((assignment) =>
            assignmentUnlocked(save, lesson, assignment.id),
          )
          .map((assignment) => ({ lesson, assignment }))
      : [],
  );
}
export type Action =
  | { type: "enter" | "pass" | "submit" | "continue" }
  | { type: "open-assignment" | "replay"; id: string }
  | { type: "draft"; code: string }
  | { type: "project"; project: CodeProject };
export function assignmentSource(
  save: Save,
  id: string,
  lessons = curriculum,
): string {
  return assignmentProject(save, id, lessons).files[ENTRY_FILE];
}
export function assignmentProject(
  save: Save,
  id: string,
  lessons = curriculum,
): CodeProject {
  const assignments = lessons.flatMap((lesson) => lesson.assignments);
  const index = assignments.findIndex((assignment) => assignment.id === id);
  const own = save.projects[id];
  if (own) return own;
  if (Object.hasOwn(save.drafts, id)) return singleFileProject(save.drafts[id]);
  const previous = assignments[index - 1];
  if (previous && save.completed.includes(previous.id)) {
    if (save.projects[previous.id]) return save.projects[previous.id];
    if (Object.hasOwn(save.drafts, previous.id))
      return singleFileProject(save.drafts[previous.id]);
  }
  return {
    files: assignments[index]?.starterFiles ?? {
      [ENTRY_FILE]: assignments[index]?.starterCode ?? "",
    },
    activeFile: ENTRY_FILE,
  };
}

export function transition(
  save: Save,
  action: Action,
  lessons = curriculum,
): Save {
  const lesson = lessons.find((l) => l.id === save.lessonId)!;
  const assignmentIndex = lesson.assignments.findIndex(
    (a) => a.id === save.assignmentId,
  );
  const assignment = lesson.assignments[assignmentIndex];
  switch (action.type) {
    case "submit": {
      const passed = transition(save, { type: "pass" }, lessons);
      if (passed === save) return save;
      const next = availableAssignments(passed, lessons).find(
        ({ assignment }) => !passed.completed.includes(assignment.id),
      );
      return next
        ? transition(
            passed,
            { type: "open-assignment", id: next.assignment.id },
            lessons,
          )
        : { ...passed, phase: "complete" };
    }
    case "enter":
      return save.phase === "onboarding" ? { ...save, phase: "coding" } : save;
    case "project": {
      const project = decodeProject(action.project);
      return save.phase === "coding" && project
        ? {
            ...save,
            projects: { ...save.projects, [assignment.id]: project },
            drafts: {
              ...save.drafts,
              [assignment.id]: project.files[ENTRY_FILE],
            },
          }
        : save;
    }
    case "draft":
      return save.phase === "coding"
        ? {
            ...save,
            drafts: { ...save.drafts, [assignment.id]: action.code },
            projects: {
              ...save.projects,
              [assignment.id]: {
                ...assignmentProject(save, assignment.id, lessons),
                files: {
                  ...assignmentProject(save, assignment.id, lessons).files,
                  [ENTRY_FILE]: action.code,
                },
              },
            },
          }
        : save;
    case "pass":
      return save.phase === "coding" &&
        assignmentUnlocked(save, lesson, assignment.id)
        ? {
            ...save,
            phase: "review",
            completed: [...new Set([...save.completed, assignment.id])],
            projects: {
              ...save.projects,
              [assignment.id]: assignmentProject(save, assignment.id, lessons),
            },
            drafts: {
              ...save.drafts,
              [assignment.id]: assignmentSource(save, assignment.id, lessons),
            },
          }
        : save;
    case "continue": {
      if (save.phase === "review") {
        const next = lesson.assignments[assignmentIndex + 1];
        return next
          ? transition(save, { type: "open-assignment", id: next.id }, lessons)
          : { ...save, phase: "complete" };
      }
      if (save.phase === "complete") {
        const next = lessons[lessons.indexOf(lesson) + 1];
        return next
          ? transition(
              save,
              { type: "open-assignment", id: next.assignments[0].id },
              lessons,
            )
          : save;
      }
      return save;
    }
    case "open-assignment": {
      const target = availableAssignments(save, lessons).find(
        ({ assignment }) => assignment.id === action.id,
      );
      return target
        ? {
            ...save,
            lessonId: target.lesson.id,
            assignmentId: target.assignment.id,
            revisitingAssignment: save.completed.includes(target.assignment.id),
            phase: "coding",
            projects: {
              ...save.projects,
              [target.assignment.id]: assignmentProject(
                save,
                target.assignment.id,
                lessons,
              ),
            },
            drafts: {
              ...save.drafts,
              [target.assignment.id]: assignmentSource(
                save,
                target.assignment.id,
                lessons,
              ),
            },
          }
        : save;
    }
    case "replay": {
      const target = lesson.assignments.find((a) => a.id === action.id);
      if (
        !target ||
        !save.completed.includes(target.id) ||
        !assignmentUnlocked(save, lesson, target.id)
      )
        return save;
      return {
        ...save,
        assignmentId: target.id,
        revisitingAssignment: true,
        phase: "coding",
        projects: {
          ...save.projects,
          [target.id]: {
            files: target.starterFiles ?? {
              [ENTRY_FILE]: target.starterCode ?? "",
            },
            activeFile: ENTRY_FILE,
          },
        },
        drafts: { ...save.drafts, [target.id]: target.starterCode ?? "" },
      };
    }
  }
}
export function decode(raw: string | null, lessons = curriculum): Save {
  const result = fresh(lessons);
  if (!raw) return result;
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 4) return result;
    result.officeClock = decodeOfficeClock(value.officeClock);
    const completed: string[] = Array.isArray(value.completed)
      ? value.completed.filter(
          (id: unknown): id is string => typeof id === "string",
        )
      : [];
    for (const lesson of lessons) {
      if (!unlocked(result, lesson.id, lessons)) break;
      for (const assignment of lesson.assignments) {
        if (
          !assignmentUnlocked(result, lesson, assignment.id) ||
          !completed.includes(assignment.id)
        )
          break;
        result.completed.push(assignment.id);
      }
    }
    const lesson =
      lessons.find(
        (l) => l.id === value.lessonId && unlocked(result, l.id, lessons),
      ) ??
      lessons.find((l) => !lessonDone(result, l)) ??
      lessons[0];
    result.lessonId = lesson.id;
    const assignment =
      lesson.assignments.find(
        (a) =>
          a.id === value.assignmentId &&
          assignmentUnlocked(result, lesson, a.id),
      ) ??
      lesson.assignments.find((a) => !result.completed.includes(a.id)) ??
      lesson.assignments[0];
    result.assignmentId = assignment.id;
    const available = availableAssignments(result, lessons).map(
      ({ assignment }) => assignment.id,
    );
    if (Array.isArray(value.collectedAssignments))
      result.collectedAssignments = available.filter((id) =>
        value.collectedAssignments.includes(id),
      );
    if (Array.isArray(value.readAssignments))
      result.readAssignments = result.collectedAssignments.filter((id) =>
        value.readAssignments.includes(id),
      );
    if (
      value.drafts &&
      typeof value.drafts === "object" &&
      !Array.isArray(value.drafts)
    ) {
      for (const l of lessons)
        for (const a of l.assignments) {
          if (
            Object.hasOwn(value.drafts, a.id) &&
            typeof value.drafts[a.id] === "string"
          )
            result.drafts[a.id] = value.drafts[a.id];
        }
    }
    if (
      value.projects &&
      typeof value.projects === "object" &&
      !Array.isArray(value.projects)
    ) {
      for (const l of lessons)
        for (const a of l.assignments) {
          if (!Object.hasOwn(value.projects, a.id)) continue;
          const project = decodeProject(value.projects[a.id]);
          if (project) {
            result.projects[a.id] = project;
            result.drafts[a.id] = project.files[ENTRY_FILE];
          }
        }
    }
    for (const key of ["mute", "reducedMotion", "crt"] as const)
      if (typeof value.settings?.[key] === "boolean")
        result.settings[key] = value.settings[key];
    if (isGraphicsQuality(value.settings?.graphicsQuality))
      result.settings.graphicsQuality = value.settings.graphicsQuality;
    // Unknown teaching/brief positions normalize to coding. Course access now
    // comes only from completed tasks, never from a lesson's reading position.
    result.phase =
      value.phase === "onboarding"
        ? "onboarding"
        : value.phase === "complete" && lessonDone(result, lesson)
          ? "complete"
          : value.phase === "review" && result.completed.includes(assignment.id)
            ? "review"
            : "coding";
    result.revisitingAssignment =
      value.revisitingAssignment === true &&
      result.completed.includes(result.assignmentId);
    // Older saves could stop on a completed task before automatic delivery was
    // added. Only keep a completed task selected when it was explicitly reopened.
    if (
      result.completed.includes(result.assignmentId) &&
      !result.revisitingAssignment
    ) {
      const next = availableAssignments(result, lessons).find(
        ({ assignment }) => !result.completed.includes(assignment.id),
      );
      if (next) {
        result.lessonId = next.lesson.id;
        result.assignmentId = next.assignment.id;
        result.phase = "coding";
      } else result.phase = "complete";
    }
    if (
      value.story &&
      typeof value.story === "object" &&
      !Array.isArray(value.story)
    ) {
      const all = lessons.flatMap((item) => item.assignments);
      for (const id of available) {
        if (!Object.hasOwn(value.story, id)) continue;
        const chapter = all.findIndex((item) => item.id === id);
        result.story[id] = decodeStory(value.story[id], {
          assignment: all[chapter],
          chapter,
          collected: result.collectedAssignments.includes(id),
          completed: result.completed.includes(id),
        });
      }
    }
    return result;
  } catch {
    return result;
  }
}
export function loadSave(): Save {
  try {
    return decode(localStorage.getItem(KEY));
  } catch {
    return fresh();
  }
}
export function persist(save: Save): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}
