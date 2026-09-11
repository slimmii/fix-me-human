# PLEASE FIX, HUMAN

A desktop 3D React learning game. Sit at an office computer, open your printed assignment, and type real TSX in a retro editor with integrated course Help.

## Run locally

Requires Node.js 22.12+ or a compatible newer LTS, and npm.

```sh
npm install
npm run dev
```

Open Vite's local URL. `npm run build` produces `dist/` for a static web server. The development and build scripts bundle the isolated React runtime automatically. Public hosting is not configured.

## Learn and play

The course assumes basic JavaScript and HTML and builds one Scrum-style task board across 12 exercises:

1. Sprint board — components, JSX and expressions.
2. Reusable task cards — typed props.
3. Three columns, one board — arrays, filtering, mapping and stable keys.
4. Give the board a memory — useState and event handlers.
5. Capture a task — controlled inputs, validation and an add callback.
6. Move work with callbacks — shared state and child-to-parent communication.
7. Edit and delete safely — local drafts and immutable updates by ID.
8. Extract useTaskBoard — a custom hook with a focused action API.
9. Share the board with context — one provider and a guarded consumer hook.
10. Find work and count it — search, derived counts and empty states.
11. Synchronize with an effect — useEffect and the preview document title.
12. Ship the Scrum board — responsive TODO / IN PROGRESS / DONE columns and a complete workflow.

Each exercise has a paper brief, hints, a tested solution, concept-focused Help material and a scripted B.U.G. chapter. His awkward encouragement gradually becomes passive-aggressive anxiety about being replaced by a human. He reacts to collecting and reading paper, entering the editor, opening Help, first typing, running code, hints, mistakes, success, revisiting work and the campaign finale. Tips play once per assignment; dialogue position and printer delivery survive reloads. The 26 Help pages use small examples from other subjects to teach the concepts without reproducing the board solution. Exact names, labels and requirements stay in the printed briefs. Each topic unlocks before its exercise, after the previous task is completed; previously unlocked topics remain available.

Click the computer to open App.tsx. The first exercise starts empty; later exercises start from your own code from the preceding completed task. A reference starter is used when no earlier draft is available. Your earlier projects remain available through File → Tasks. At board-columns, New and Open unlock so you can split components and types into modules. Collect a new assignment from the printer, then click the physical sheet beside the monitor to read it. Unread sheets glow yellow, and collected/read paper survives reloads. Submitting pins the completed sheet on the right wall. Continue B.U.G.’s handoff and next briefing to start the following print; submitting alone never starts the printer.

- **B.U.G.’s next arrow:** advance his story. The last briefing line offers **Print assignment →**. Printing starts only after that click.
- **F1 / Help:** open the topic index. Previous/Next or ←/→ change pages. The retro scrollbar, ↑/↓ and PgUp/PgDn scroll. Escape restores the editor and its undo history.
- **F5 / Ctrl/Cmd+Enter:** compile and run in BUGSCAPE. **F6:** return to the code.
- **File → New file / Ctrl/Cmd+N:** name a new project file (unlocks at board-columns).
- **File → Open / Ctrl/Cmd+O:** pick a project file; one file is visible at a time.
- **File → Tasks:** restore a previous assignment or open the next available exercise.
- **Tab:** indent. **Ctrl/Cmd+F:** find/replace. Standard undo/redo shortcuts work.
- **Alt+F/E/S/R:** open a menu; **Alt+H:** open Help.
- **Hint:** request the next exercise hint. **Submit assignment:** available after source and runtime checks pass.
- **File → Exit / Escape:** step back from the computer. Replay resets only its selected draft while preserving earned completion.

Checks create, move, edit, delete and search actual rendered cards. Each scenario uses a fresh mount and the preview resets after checking so the learner can try a clean board. The final exercise also checks the wide column layout. The previous short example track is no longer registered; older authoring references remain in the repository.

The wall clock shows office time in 24-hour format. The safety sign counts full days since the last compile error, runtime error, or unresponsive program; each error resets it to zero without resetting the clock. Incomplete assignment checks do not reset the streak. Clock and streak timestamps save locally and continue advancing while the game is closed.

The computer uses a spacecraft-inspired terminal with amber phosphor accents, instrument panels, and mechanical keys. The editor, Help, dialogs, and program output share the same palette. BUGSCAPE fills the computer screen while running a program; F6 returns to the editor. Settings include mute, reduced motion, optional scanlines, graphics quality, and screen font size (10–20px, default 14px). Font changes apply to the editor, Help, and program output and save automatically. B.U.G.'s dialogue is always captioned. There are no deadlines or lost course progress after errors. The clock still updates with reduced motion enabled. WebGL is required for the office; a fallback keeps the learning, coding interface, and clock readout available without it.

## Author content

See [the authoring guide](docs/authoring.md) for Markdown screens, lesson manifests, multiple assignments, starter skeletons, and validation rules.

Task groups define ordered assignments with stable IDs in `src/curriculum/index.ts`. Course topics and their pages live independently in `src/course/index.ts`; each topic declares the completed task IDs that unlock it. New topics or exercises do not require changing the player UI.

## What runs and saves

The browser renders the code the player wrote. A local TypeScript worker checks source restrictions and assignment rules, then transpiles TSX. A separately bundled React runtime executes it inside an opaque-origin iframe with `sandbox="allow-scripts"`. Its Content Security Policy blocks network access, forms, and external assets. The parent accepts results only from the active frame with the current run token.

Only `react` can be imported. Named and default exported function components are supported. The small HTML toolbox is:

```text
div section h1 h2 p span button input label ul li
```

Fragments, capitalized components, Hooks, expressions, and event handlers are supported by the runtime, with progressively deeper use throughout the board track. Unsupported tags, remote imports, navigation attributes, and direct HTML injection receive feedback. Browser alerts and console logs appear as captions inside the preview. This is targeted TSX feedback, not a complete TypeScript IDE.

Location, projects (including the active file), legacy drafts, paper collection/read status, assignment completion and settings save locally under `please-fix-human:v4`. The new track starts fresh because its exercise IDs and completion requirements differ from the old example track. Existing v2/v3 storage is left untouched. Existing v4 string drafts load as App.tsx without losing progress. Projects carry all files into the next assignment. File → Tasks preserves saved work; explicit Replay resets the selected project. Corrupt or incompatible saves recover safely. Blocked storage allows session-only play and displays a notice.

The learner's board tasks are in-memory React state: they reset on F5 or reload. Source code and course progress are saved by the office. This course does not include board storage, accounts, a backend or multi-user synchronization. The document-title effect runs inside the preview, not the outer office tab.

## Source and checks

- `src/curriculum/`: ordered exercises, assignment briefs, and validation requirements.
- `src/course/`: independent Help topics, Markdown reference pages, and task-based unlock rules.
- `src/progression.ts`: pure progression transitions, completion rules, and v4 persistence.
- `src/game/useGame.ts`: game state, event wiring, sound, and focus.
- `src/game/story.ts` and `storyScripts.ts`: saved dialogue cursors, explicit print gating and twelve authored story chapters.
- `src/computer/`: integrated course Help, Markdown rendering, navigation, and completion screens.
- `src/TypedComputer.tsx` and `src/RetroEditor.tsx`: compiler integration, CodeMirror editing, and editor/browser switching.
- `src/typed-engine.ts`, `src/validation/`, and `src/sandbox/`: source checks, rendered-output checks, and isolated execution.
- `src/scene/`: physical office, monitor, robot, printer, and camera behavior.

```sh
npm run format:check
npm test
npx playwright install chromium
npm run test:browser
npm run build
```

Tests cover progression with multiple assignments, content integrity, component exports, saved drafts, rendered interactions for all 12 checkpoints, deliberately broken implementations, final course completion and replay, sandbox behavior, editor interactions, and the printer. Browser screenshots go to `test-results/`.

## Attribution

Original English lessons, code, and locally constructed cartoon geometry were created for this game. Component teaching follows the [official React introduction](https://react.dev/learn/your-first-component). Archived topic selection followed the [AP Webframeworks React course](https://similonap.github.io/webframeworks-cursus/wf-course/react). This game is not affiliated with AP, React, or Job Simulator; no game assets were borrowed.

Built with React, TypeScript, Vite, Three.js, React Three Fiber, Drei, CodeMirror, and react-markdown. DM Sans and Space Grotesk are bundled through Fontsource under the SIL Open Font License.
