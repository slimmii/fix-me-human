# Authoring tasks and course topics

The registered curriculum is the 12-exercise Scrum board track. `src/curriculum/scrum-board/index.ts` supplies ordered lessons, briefs, hints and robot dialogue; `solutions.ts` stores readable TSX source strings; `validation.ts` composes cumulative checks. `src/course/scrum-board/index.ts` registers 24 reference pages in 12 topics. The old example files remain unregistered.

## Exercises and checkpoints

A Lesson contains an ID, title and ordered assignments. Register lessons in `src/curriculum/index.ts`; their order defines progression. Each assignment needs:

- A unique, stable lowercase ID, title and Markdown brief path relative to `src/curriculum/`.
- Nonempty hints and a reference solution that compiles as strict TSX.
- `robot: { intro, success, retry }` with original dialogue for that exercise. These fields are optional in the general type for legacy definitions, but required by the active catalog validator.
- Source and runtime validation rules.
- Optional `starterCode`; omission means an empty editor.

The Scrum track uses the preceding reference solution as the next starter. Explain this convention in Help. Opening a saved task always prefers its own draft. Do not copy arbitrary earlier drafts over a tested checkpoint or overwrite existing drafts. Adding a stage requires updating its solution, cumulative rules, brief, topic prerequisite and tests together.

B.U.G.'s introduction is a separate briefing line. Only advancing past it authorizes printing. Successful and failed runs use that assignment's authored reaction; failures identify the first check to fix. The completion screen and finale retain the final reaction. Early reactions are awkwardly supportive; later ones reveal insecurity about human competence and job loss. Humor should support the story without making mistakes costly.

Keep paper briefs short: a B.U.G. reason for the work, three to five concrete steps, one quick verification and the relevant Help topic. Preserve exact new names/labels needed by checks. Put setup, save behavior, sandbox limitations and repeated workflow instructions in Help, not on the assignment sheet.

## Help pages

Topics have an ID, title, description, `unlockAfter` assignment IDs and ordered pages. An empty prerequisite list makes a topic available immediately. The next topic should unlock after the preceding exercise, so learners can read the relevant material before implementing it. Completion, not reading position, governs access.

Each page has a unique ID, title and Markdown path starting with `course/`, relative to `src/`. The reader renders the title from the catalog, so Markdown starts with prose rather than a duplicate h1. Use original explanations, focused fenced `tsx` examples, common mistakes, a small practice prompt and an official React reference. Clearly label partial code outlines. Raw HTML is disabled.

Help has keyboard paging and retro scrolling. Earned topics stay available when revisiting tasks and across reloads. File → Open restores code without erasing progress; explicit Replay resets its selected draft.

## Public markup contracts

Teach every requirement enforced by checks. The board uses these contracts from exercise 3 onward:

- `h1`: Sprint board.
- A section named TODO, IN PROGRESS or DONE via `aria-label`, containing the matching h2.
- Cards are li elements with numeric `data-task-id` and a p containing the title. Seed IDs are 1, 2, 3; new IDs are unique among current tasks.
- Inputs use Task title, Edit task title and Search tasks as their aria-labels.
- Buttons use Add task, Start task, Finish task, Reopen task, Edit task, Save task, Cancel edit and Delete task as their aria-labels. Exercise 4 temporarily uses Add sample task.
- Counts use `aria-label="Task count"` and the exact N tasks format. Empty filtered columns say No matching tasks.

The brief distinguishes required component/hook names from optional implementation details. Runtime checks target observable behavior; source checks inspect a few required structures. They cannot prove that all data flow, keys, hook dependencies or architectural choices are correct. Ask learners to review those as well.

## Validation

Rules are serializable data. Source checks run against the parsed TSX AST in the compiler worker:

- `exported-component`: a capitalized exported function component.
- `component` with `name`: a local function/arrow component definition and JSX usage.
- `uses-call` with `name`: a call expression, including named import aliases. Comments and string mentions do not qualify. This is a structural check, not full data-flow analysis.

Runtime rules inspect the isolated preview:

- `visible-heading`: a visible h1 with normalized exact text.
- `visible-text`: normalized exact text under a supplied selector.
- `interaction`: an ordered scenario of click, input, expect and title steps. Expect can assert element count, text or input value. Title checks the iframe document title.
- `column-layout`: expected column count and side-by-side non-overlapping rectangles at or above a supplied minimum root width. Separate browser tests verify narrow stacking and overflow.

Each interaction scenario gets a fresh React mount. Input steps use the native input setter and dispatch events to reach React's controlled-input handlers; clicks exercise actual handlers. Updates settle before assertions. Errors or unknown rules fail closed. After all scenarios the learner receives a fresh board, so checking does not leave behind test tasks or edits. The parent still validates the frame source and current run token.

To add a rule, update `src/validation/types.ts`, its explicit evaluator in `src/typed-engine.ts` or `src/validation/runtime.ts`, and positive/negative tests. Do not branch on exercise IDs inside the engine. Shared cumulative scenarios ensure earlier features remain tested after refactors.

The sandbox allows React imports and `div section h1 h2 p span button input label ul li`, plus fragments and capitalized components. Network, browser storage, external packages and forms are unavailable. `document.title` is supported for the effect exercise. Code is limited to 16,000 characters.

## Progress, printing and saves

Submit records completion, pins the finished sheet and selects the next unfinished assignment. The new assignment starts with a handoff and briefing. Its printer stays idle until the player advances the briefing. A requested print resumes after reload; ready and collected sheets restore without reprinting. Completed work deliberately reopened through File → Open stays available for code review and does not print again. All 12 sheets fit the right wall; there is no thirteenth assignment.

The new course uses `please-fix-human:v4`. It starts with fresh course progress because the previous example tasks are different exercises. Existing v2/v3 keys remain untouched. Validated completion determines task and topic access. Drafts, paper history and settings round-trip independently. The learner's in-preview board data is not persisted across runs.

## Story scripting

`src/game/storyScripts.ts` contains twelve chapter scripts, ordered with the curriculum. Each supplies collection, editor, Help, typing, paper, run and handoff lines; the assignment metadata supplies intro/success/retry. The shared event renderer adds printer status, hints, revisits and a three-page finale. Keep technical guidance appropriate to the current exercise while moving the humor from awkward support toward job insecurity.

`src/game/story.ts` is the pure director. A saved assignment story holds delivery (`waiting`, `printing`, `ready`), the current event/page, seen events and a pending queue. `tellStory` handles activities, `continueStory` advances dialogue, and `finishPrinting` accepts only an authorized print completion. Briefings cannot be bypassed by early editor/Help/typing events. First typing gives encouragement and preserves any remaining tutorial page; repeated typing does not replay it. Incidental prop chatter cannot interrupt an unfinished finale.

Wire meaningful activities through `game.activity`, `game.openHelp` and the existing collection/editor callbacks. Use `game.say` for incidental office props. Never start a printer from a dialogue timer or from Submit. Both the 3D printer and WebGL fallback honor `assignmentPrintRequested`. The persistent v4 save adds story records without resetting existing progress, drafts, settings or paper history. Old saves without story data start a briefing, or resume collected/completed work appropriately.

## Verification

```sh
npm run format:check
npm test
npm run test:browser
npm run build
```

Unit tests validate content, all strict-TSX solutions, source rules, cumulative unlocks, save recovery and progression. Browser tests run all 12 reference solutions in the real sandbox, reject broken updates/context/effects/layout, verify clean resets, exercise narrow layouts, and check printing, Help, task history and final completion. Screenshots are written to `test-results/`.
