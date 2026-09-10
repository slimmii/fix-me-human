import { curriculum } from "../curriculum";
import type { Lesson } from "../curriculum/types";
import type { CourseTopic } from "./types";

import { scrumTopics } from "./scrum-board";

export const courseTopics: CourseTopic[] = scrumTopics;

export function unlockedTopics(
  completed: readonly string[],
  topics: CourseTopic[] = courseTopics,
): CourseTopic[] {
  return topics.filter((topic) =>
    topic.unlockAfter.every((id) => completed.includes(id)),
  );
}

export function validateCourse(
  topics: CourseTopic[],
  lessons: Lesson[] = curriculum,
): void {
  const assignments = new Set(
    lessons.flatMap((lesson) =>
      lesson.assignments.map((assignment) => assignment.id),
    ),
  );
  const ids = new Set<string>();
  function unique(id: string) {
    if (!/^[a-z][a-z0-9-]*$/.test(id) || ids.has(id))
      throw new Error(`Invalid or duplicate course ID: ${id}`);
    ids.add(id);
  }
  for (const topic of topics) {
    unique(topic.id);
    if (!topic.title.trim() || !topic.description.trim() || !topic.pages.length)
      throw new Error(`Empty course topic: ${topic.id}`);
    if (topic.unlockAfter.some((id) => !assignments.has(id)))
      throw new Error(`Unknown task prerequisite: ${topic.id}`);
    for (const page of topic.pages) {
      unique(page.id);
      if (
        !page.title.trim() ||
        !page.markdown.startsWith("course/") ||
        !page.markdown.endsWith(".md")
      )
        throw new Error(`Invalid course page: ${page.id}`);
    }
  }
}
validateCourse(courseTopics);
