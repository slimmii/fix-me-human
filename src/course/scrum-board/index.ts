import type { CourseTopic } from "../types";
export const scrumTopics: CourseTopic[] = [
  {
    id: "react-basics",
    title: "React fundamentals",
    description: "Components, JSX, expressions, types, and the run/edit loop.",
    unlockAfter: [],
    pages: [
      {
        id: "react-basics-page-1",
        title: "Meet the component",
        markdown: "course/scrum-board/react-basics-1.md",
      },
      {
        id: "react-basics-page-2",
        title: "From code to screen",
        markdown: "course/scrum-board/react-basics-2.md",
      },
    ],
  },
  {
    id: "component-props",
    title: "Components and props",
    description: "Reusable components, JSX expressions, and typed inputs.",
    unlockAfter: ["board-shell"],
    pages: [
      {
        id: "component-props-page-1",
        title: "One component, different inputs",
        markdown: "course/scrum-board/component-props-1.md",
      },
      {
        id: "component-props-page-2",
        title: "Describe the contract with TypeScript",
        markdown: "course/scrum-board/component-props-2.md",
      },
    ],
  },
  {
    id: "rendering-lists",
    title: "Lists and identity",
    description:
      "Model collections, filter and map items, and choose stable keys.",
    unlockAfter: ["task-card"],
    pages: [
      {
        id: "rendering-lists-page-1",
        title: "Turn data into a list",
        markdown: "course/scrum-board/rendering-lists-1.md",
      },
      {
        id: "rendering-lists-page-2",
        title: "Identity, keys and semantic markup",
        markdown: "course/scrum-board/rendering-lists-2.md",
      },
    ],
  },
  {
    id: "react-state",
    title: "State with useState",
    description:
      "Render snapshots, event handlers, and functional array updates.",
    unlockAfter: ["board-columns"],
    pages: [
      {
        id: "react-state-page-1",
        title: "Let React remember a change",
        markdown: "course/scrum-board/react-state-1.md",
      },
      {
        id: "react-state-page-2",
        title: "Update from the latest state",
        markdown: "course/scrum-board/react-state-2.md",
      },
    ],
  },
  {
    id: "controlled-inputs",
    title: "Events and controlled inputs",
    description:
      "Capture a draft, validate it, and send it through a callback.",
    unlockAfter: ["task-state"],
    pages: [
      {
        id: "controlled-inputs-page-1",
        title: "A controlled input has one source of truth",
        markdown: "course/scrum-board/controlled-inputs-1.md",
      },
      {
        id: "controlled-inputs-page-2",
        title: "Events go up through functions",
        markdown: "course/scrum-board/controlled-inputs-2.md",
      },
    ],
  },
  {
    id: "component-callbacks",
    title: "Callbacks and shared state",
    description: "Lift state to coordinate siblings without mutating props.",
    unlockAfter: ["task-input"],
    pages: [
      {
        id: "component-callbacks-page-1",
        title: "The closest shared owner",
        markdown: "course/scrum-board/component-callbacks-1.md",
      },
      {
        id: "component-callbacks-page-2",
        title: "Request a change by ID",
        markdown: "course/scrum-board/component-callbacks-2.md",
      },
    ],
  },
  {
    id: "immutable-updates",
    title: "Immutable editing and deletion",
    description: "Local edit drafts, parent callbacks, and stable identities.",
    unlockAfter: ["task-callbacks"],
    pages: [
      {
        id: "immutable-updates-page-1",
        title: "Separate a draft from saved data",
        markdown: "course/scrum-board/immutable-updates-1.md",
      },
      {
        id: "immutable-updates-page-2",
        title: "Replace and remove by ID",
        markdown: "course/scrum-board/immutable-updates-2.md",
      },
    ],
  },
  {
    id: "custom-hooks",
    title: "Custom hooks",
    description:
      "Extract reusable stateful logic without accidentally splitting shared state.",
    unlockAfter: ["task-editing"],
    pages: [
      {
        id: "custom-hooks-page-1",
        title: "Extract reusable stateful logic",
        markdown: "course/scrum-board/custom-hooks-1.md",
      },
      {
        id: "custom-hooks-page-2",
        title: "Shared logic is not shared state",
        markdown: "course/scrum-board/custom-hooks-2.md",
      },
    ],
  },
  {
    id: "react-context",
    title: "Context and providers",
    description:
      "Share a value and its actions through a provider and a consumer hook.",
    unlockAfter: ["use-task-board"],
    pages: [
      {
        id: "react-context-page-1",
        title: "One provider for shared state",
        markdown: "course/scrum-board/react-context-1.md",
      },
      {
        id: "react-context-page-2",
        title: "Read context with a guard",
        markdown: "course/scrum-board/react-context-2.md",
      },
    ],
  },
  {
    id: "derived-state",
    title: "Search and derived state",
    description:
      "Keep the query in state; calculate filtered views and counts.",
    unlockAfter: ["board-context"],
    pages: [
      {
        id: "derived-state-page-1",
        title: "Store the input, derive the view",
        markdown: "course/scrum-board/derived-state-1.md",
      },
      {
        id: "derived-state-page-2",
        title: "Counts, empty states and meaning",
        markdown: "course/scrum-board/derived-state-2.md",
      },
    ],
  },
  {
    id: "react-effects",
    title: "Effects and synchronization",
    description:
      "Use an effect for the document title, not for ordinary calculations.",
    unlockAfter: ["board-search"],
    pages: [
      {
        id: "react-effects-page-1",
        title: "Synchronize outside React rendering",
        markdown: "course/scrum-board/react-effects-1.md",
      },
      {
        id: "react-effects-page-2",
        title: "Dependencies, cleanup and avoiding extra effects",
        markdown: "course/scrum-board/react-effects-2.md",
      },
    ],
  },
  {
    id: "board-integration",
    title: "Layout and review",
    description:
      "Complete workflows, accessible controls, responsive layout, and review.",
    unlockAfter: ["board-effects"],
    pages: [
      {
        id: "board-integration-page-1",
        title: "Flexible layouts",
        markdown: "course/scrum-board/board-integration-1.md",
      },
      {
        id: "board-integration-page-2",
        title: "Check a complete workflow",
        markdown: "course/scrum-board/board-integration-2.md",
      },
    ],
  },
];
