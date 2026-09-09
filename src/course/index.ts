import { curriculum } from "../curriculum";
import type { Lesson } from "../curriculum/types";
import type { CourseTopic } from "./types";

export const courseTopics: CourseTopic[] = [
  {
    id: "react-basics",
    title: "React fundamentals",
    description:
      "Components, JSX, returning markup, and running your first program.",
    unlockAfter: [],
    pages: [
      {
        id: "components",
        title: "Meet the component",
        markdown: "course/react-basics/01-components.md",
      },
      {
        id: "tsx",
        title: "A little markup in your code",
        markdown: "course/react-basics/02-tsx.md",
      },
      {
        id: "return",
        title: "Give your component something to show",
        markdown: "course/react-basics/03-return.md",
      },
      {
        id: "hello-world",
        title: "Hello world, one component at a time",
        markdown: "course/react-basics/04-hello-world.md",
      },
      {
        id: "run",
        title: "From code to screen",
        markdown: "course/react-basics/05-run.md",
      },
    ],
  },
  {
    id: "jsx-expressions",
    title: "JavaScript in JSX",
    description: "Put variables and JavaScript expressions inside your markup.",
    unlockAfter: ["hello-bug"],
    pages: [
      {
        id: "values-in-markup",
        title: "Give your markup a value",
        markdown: "course/jsx-expressions/01-values.md",
      },
      {
        id: "combine-values",
        title: "Build a greeting from data",
        markdown: "course/jsx-expressions/02-greetings.md",
      },
    ],
  },
  {
    id: "component-props",
    title: "Component props",
    description: "Pass data into reusable components.",
    unlockAfter: ["welcome-human"],
    pages: [
      {
        id: "passing-props",
        title: "Give a component its inputs",
        markdown: "course/component-props/01-inputs.md",
      },
      {
        id: "typed-props",
        title: "Describe your props with TypeScript",
        markdown: "course/component-props/02-types.md",
      },
    ],
  },
];

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
