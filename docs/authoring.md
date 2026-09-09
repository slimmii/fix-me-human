# Authoring tasks and course topics

Exercises and course material have separate catalogs. `src/curriculum/` contains ordered task groups, assignments, and paper briefs. `src/course/` contains a topic-organized reference library. A task does not own a sequence of teaching screens, and reading never gates progress.

All content is bundled locally. The editor opens immediately. Completing tasks unlocks later tasks and additional Help topics.

## Define an exercise

A `Lesson` in `src/curriculum/types.ts` is an ordered group of assignments with an ID and title. It has no course pages. Register groups in `src/curriculum/index.ts`; group order and assignment order define task progression.

```ts
{
  id: "another-greeting",
  title: "Another greeting",
  brief: "hello-react/another-greeting.md",
  // Omit starterCode to start with an empty file.
  starterCode: "export default function App() {\n  return null;\n}",
  hints: [
    "Return a heading from your component.",
    "Use h1 and put the requested greeting between its tags.",
    "One working solution: export default function App() { return <h1>Hello again</h1>; }",
  ],
  solution: "export default function App() { return <h1>Hello again</h1>; }",
  validation: {
    source: [{ type: "exported-component", label: "Export a capitalized function component" }],
    runtime: [{ type: "visible-heading", text: "Hello again", label: "Display Hello again in a visible h1 heading" }],
  },
}
```

Brief paths are relative to `src/curriculum/`. Briefs are separate Markdown files written as assignments from B.U.G. New assignments print automatically and wait in the printer's output tray. B.U.G. prompts the player to grab the paper. Collecting it makes the desk sheet and readable panel available; printing alone does not grant access to the paper. The panel can stay open beside the editor. Collected sheets remain available when revisiting tasks during the session.

State every requirement the checks enforce. Label optional practice suggestions as optional: the follow-up tasks encourage JSX expressions and props, but accept equivalent components that produce the required heading. Hints appear one at a time; the last can provide a solution. `solution` supports automated verification and does not populate the editor. Use `starterCode` for scaffolding.

Named and default exported function components are supported, including arrow functions assigned to capitalized names. The game mounts the default export if one exists, otherwise the first exported capitalized function component.

## Define a Help topic

Create Markdown files under `src/course/`, then add a `CourseTopic` to `src/course/index.ts`:

```ts
{
  id: "jsx-expressions",
  title: "JavaScript in JSX",
  description: "Put variables and expressions inside your markup.",
  unlockAfter: ["hello-bug"],
  pages: [
    {
      id: "values-in-markup",
      title: "Give your markup a value",
      markdown: "course/jsx-expressions/01-values.md",
    },
  ],
}
```

`unlockAfter` contains assignment IDs. Every listed task must be completed before the topic appears. An empty array makes the topic available from the start. Prerequisites are independent of the currently selected exercise: earned topics remain available while revisiting or replaying earlier tasks and after reloading.

The topic title organizes the Help index; each page has its own title. Array order controls topic and page order. Markdown paths start with `course/` and are relative to `src/`. IDs start with a lowercase letter and contain lowercase letters, digits, or hyphens. Keep IDs stable so task completion and unlock prerequisites survive edits.

Use paragraphs, emphasis, lists, blockquotes, inline code, and fenced `tsx` examples. Page titles come from the catalog, so begin Markdown with prose instead of repeating the title. Raw HTML is disabled.

Help fills the terminal with the topic index. Selecting a topic opens the full-screen reader with a retro scrollbar, Previous/Next buttons, and keyboard controls. Use ↑/↓, PgUp/PgDn, Home/End to scroll, ←/→ for pages, and Topics to return to the index. Escape returns to the editor with its draft and undo history intact.

## Task history and progress

File → Open (Ctrl/Cmd+O) lists completed tasks and the next available task. Selecting an entry restores that task's saved code and preserves all other drafts and earned completion. Cancel or Escape returns to the existing editor. Unknown task IDs and tasks whose predecessors are incomplete cannot be opened.

Replay is a separate, explicit action on the completion screen. It resets only the selected task's draft to its starter while preserving completion and unlocked Help topics.

The published progression contains:

1. Hello B.U.G. — React fundamentals available from the start.
2. Welcome, Human — JavaScript in JSX unlocks after Hello B.U.G.
3. Office status board — Component props unlocks after Welcome, Human.

## Validation

Rules are serializable data. Source rules run against parsed TSX in the compiler worker; runtime rules inspect the rendered application inside the isolated iframe.

1. Define new rule types and parameter validation in `src/validation/types.ts`.
2. Add evaluation in `src/typed-engine.ts` or `src/validation/runtime.ts`, dispatching explicitly by rule type.
3. Add positive and negative cases, including programs with the wrong rendered result. Unknown rules must fail closed.
4. Reference the rule from an assignment. No exercise-ID conditions belong in the compiler or sandbox.

Current rules require a capitalized exported function component and a visible `h1` with the requested text after normalizing whitespace. They allow equivalent implementations.

The catalogs validate IDs, required fields, prerequisite task IDs, and rule types on import. Markdown is loaded with Vite raw imports; missing or empty referenced pages fail at startup. Content tests verify referenced files, and TypeScript tests compile every authored task solution.

## Saves and verification

Local storage remains at `please-fix-human:v3`. Drafts, task completion, current exercise, and settings are preserved. Old v3 teaching and brief positions migrate to the editor; obsolete screen/taught metadata is ignored. Help unlocks derive from validated task completion, so no separate unlock state can drift out of sync. Older v2 saves remain untouched.

```sh
npm run format:check
npm test
npm run test:browser
npm run build
```

Tests cover authoring contracts, cumulative topic unlocks, blocked future tasks, cross-task draft restoration, save migration, replay, reference solutions, and the end-to-end task/history/Help flow. Screenshots are written to `test-results/`.
