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

The introductory task assumes basic JavaScript and HTML. Help is a separate topic library: React fundamentals is available immediately, JavaScript in JSX unlocks after **Hello B.U.G.**, and Component props unlocks after **Welcome, Human**.

Click the computer to open an empty `Office.tsx` editor immediately. B.U.G.'s new assignment prints automatically: build an application with an `h1` that says **Hello B.U.G.** B.U.G. tells you when it is ready. Grab the paper from the printer to place it beside the monitor; only then does the Assignment shortcut become available. Click the desk sheet or shortcut to read it while typing; the camera makes room for the paper.

- Click the physical CRT to focus the computer. File → Exit or Escape returns to the office.
- **File → Open** (Ctrl/Cmd+O) opens previous tasks or the next available exercise, restoring each task’s saved code.
- **Help** opens your unlocked topic index. Select a topic to fill the terminal with its reference pages. Use Previous/Next or ←/→ to change pages, and the retro scrollbar, ↑/↓, or PgUp/PgDn to scroll. Escape returns to your editor with the draft and undo history intact.
- **F5** or **Ctrl/Cmd+Enter** runs your TSX in **BUGSCAPE Navigator**. **F6** returns to the intact **B.U.G. BASIC** editor.
- **Tab** indents. **Ctrl/Cmd+F** opens find/replace. Standard undo/redo shortcuts work.
- **Alt+F/E/S/R** opens the File, Edit, Search, or Run menu. **Alt+H** opens Help directly. Arrow keys navigate menu items.
- **Help** or **F1** opens course material directly. Click the printed assignment to open the paper brief. **Hint** offers progressively more help.
- **Submit assignment** becomes available when the current source and rendered output pass. Editing or reloading requires another run.
- After submission, complete the lesson, review it, or replay the assignment. Replay starts a fresh draft and keeps earned completion.

Three tasks are available: **Hello B.U.G.**, **Welcome, Human**, and **Office status board**. Completing them grows the Help topic library. Unlocked topics remain available when revisiting earlier exercises. The previous 11-topic curriculum, final project, and endless generator are archived in `archive/` as authoring references.

Settings include mute, reduced motion, and optional scanlines. B.U.G.'s dialogue is always captioned. There are no timers or retry penalties. WebGL is required for the office; a fallback keeps the learning and coding interface available without it.

## Author content

See [the authoring guide](docs/authoring.md) for Markdown screens, lesson manifests, multiple assignments, starter skeletons, and validation rules.

Task groups define ordered assignments with stable IDs in `src/curriculum/index.ts`. Course topics and their pages live independently in `src/course/index.ts`; each topic declares the completed task IDs that unlock it. New topics or exercises do not require changing the player UI.

## What runs and saves

The browser renders the code the player wrote. A local TypeScript worker checks source restrictions and assignment rules, then transpiles TSX. A separately bundled React runtime executes it inside an opaque-origin iframe with `sandbox="allow-scripts"`. Its Content Security Policy blocks network access, forms, and external assets. The parent accepts results only from the active frame with the current run token.

Only `react` can be imported. Named and default exported function components are supported. The small HTML toolbox is:

```text
div section h1 h2 p span button input label ul li
```

Fragments, capitalized components, Hooks, expressions, and event handlers are supported by the runtime, although the first lesson only teaches a heading. Unsupported tags, remote imports, navigation attributes, and direct HTML injection receive feedback. Browser alerts and console logs appear as captions inside the preview. This is targeted TSX feedback, not a complete TypeScript IDE.

Location, drafts, assignment completion, and settings save locally under `please-fix-human:v3`. The rebuilt course starts fresh with default settings; old v2 saves remain untouched. Existing v3 teaching and brief saves resume directly in the editor. Course reading is optional; completing assignments unlocks the next tasks and more Help topics. File → Open preserves saved work; only explicit Replay resets a draft. Corrupt or incompatible saves recover safely. Blocked storage allows session-only play and displays a notice. No accounts, backend, analytics, or runtime network requests are required.

## Source and checks

- `src/curriculum/`: ordered exercises, assignment briefs, and validation requirements.
- `src/course/`: independent Help topics, Markdown reference pages, and task-based unlock rules.
- `src/progression.ts`: pure progression transitions, completion rules, and v3 persistence.
- `src/game/useGame.ts`: game state, B.U.G.'s dialogue, sound, and focus.
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

Tests cover progression with multiple assignments, content integrity, component exports, saved drafts, rendered output, full lesson completion and replay, sandbox behavior, editor interactions, and the printer. Browser screenshots go to `test-results/`.

## Attribution

Original English lessons, code, and locally constructed cartoon geometry were created for this game. Component teaching follows the [official React introduction](https://react.dev/learn/your-first-component). Archived topic selection followed the [AP Webframeworks React course](https://similonap.github.io/webframeworks-cursus/wf-course/react). This game is not affiliated with AP, React, or Job Simulator; no game assets were borrowed.

Built with React, TypeScript, Vite, Three.js, React Three Fiber, Drei, CodeMirror, and react-markdown. DM Sans and Space Grotesk are bundled through Fontsource under the SIL Open Font License.
