# PLEASE FIX, HUMAN

A desktop 3D React learning game. Sit at a chunky office computer, listen to B.U.G.’s dubious advice, **type your own TSX**, and run it in a CRT-styled browser launched from a QBasic-inspired editor.

## Run locally

Requires Node.js 22.12+ (or a compatible newer LTS) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` produces `dist/` for a static web server. Public hosting is not configured. The development and build scripts automatically bundle the isolated React browser runtime first.

## Play

Click the CRT. The camera zooms to the physical monitor; the playable HTML interface is attached to that monitor’s screen in the 3D scene, rather than opening an unrelated desktop overlay.

B.U.G. explains each concept through captions, jokes, and a worked example. Use **Go on, B.U.G.**, then **Let me type**, in the conversation panel. Write source in **B.U.G. BASIC**, a blue EGA-style code editor with syntax highlighting, line numbers, a cursor position readout, undo/redo, and find/replace. Text menus provide **File**, **Edit**, **Search**, **Run**, and **Help**. Choose **Run → Start** or press **F5** to open **BUGSCAPE Navigator**, a separate retro browser inside the CRT. Press **F6** to return to your intact editor. The actual React output uses monospace text, ANSI colors, double-line borders, square beveled controls, and CRT styling. The lessons, menus, editor, certificate, and browser all use the same period interface. There is no command-line terminal or snippet picker.

The intentionally small HTML toolbox is:

```text
div section h1 h2 p span button input label ul li
```

Fragments and capitalized React components are also supported. Hooks, typed props, expressions, event handlers, and JavaScript array methods are introduced through the campaign. Other HTML tags, remote imports, navigation attributes, direct HTML injection, and APIs outside the exercise toolbox are rejected with B.U.G.’s feedback. Only `react` can be imported. These constraints apply to what can be typed and run, not just to the visible toolbar.

- **Tab** indents code. **F5** or **Ctrl/Cmd + Enter** runs it. **F6** switches between code and output. **Escape** closes a menu or returns from the browser to code; from the editor it returns to the desk.
- **Alt+F/E/S/R/H** opens a text menu. Arrow keys navigate its items. **F1** asks B.U.G. for help. **Ctrl/Cmd+F** opens find/replace; standard editor shortcuts handle undo and redo.
- **Help → Assignment hint** (or **Hint** on the status bar) offers graduated help. **Help → Ask B.U.G.** repeats the concept and assignment.
- Successful source checks plus a successful browser mount unlock **Repair complete**. Editing code requires another run.
- Finish two exercises per lesson across 11 topics, then five retained final-project checkpoints.
- The ending prints a promotion certificate, celebrates, and awards **UNLIMITED EMPLOYMENT**. It unlocks Endless Shift and replays through the compact lesson menu.
- Settings include mute, reduced motion, and optional scanlines. Dialogue is always captioned. No timers or retry penalties.

## What runs

The browser renders the code the player wrote. A local TypeScript worker checks the tag/API restrictions, validates lesson-specific source structure, and transpiles TSX. A separately bundled React runtime executes it inside an opaque-origin iframe using `sandbox="allow-scripts"`. Its Content Security Policy blocks network access, navigation/form submissions, and external assets. The parent accepts messages only from the active frame with its current run token. Runtime errors return to B.U.G. Imports resolve to the local React runtime; there is no `eval` or external AI service.

This small teaching environment provides TSX syntax diagnostics and targeted lesson checks, rather than a complete TypeScript IDE. Some individual-component exercises receive host props (`name`, `room`, or `onOrder`). The room exercise supplies a host button to change that prop; the callback exercise displays what the host parent receives. Browser alerts and console logs appear as in-browser captions.

The source, progression, settings, checkpoints, and endless statistics save under `please-fix-human:v2` in local storage. The version was changed when the game moved from snippet puzzles to typed code. Invalid/incompatible storage recovers to a new shift; blocked storage preserves play for the current session and displays a notice. WebGL is required for the office; a fallback keeps the coding interface available without it. Fonts and runtime assets are bundled locally; no accounts, backend, analytics, or runtime network requests are required.

Endless exercises are reproducible by seed, topic, difficulty, and prior family. Completion starts with a missing part, repair begins with faulty source, and reconstruction begins with an empty file. Every family is solved by typing. Difficulty changes scaffolding and exercise complexity. The generator avoids an immediate repeat of the previous family.

## Source

- `src/App.tsx`: composes the scene, computer, dialogue, HUD, and settings.
- `src/game/useGame.ts`: owns campaign state, persistence, assignment transitions, and B.U.G.’s conversation flow.
- `src/game/dialogue.ts`: authored lesson introductions.
- `src/ui/`: dialogue, HUD, and settings components.
- `src/computer/`: boot, lesson menu, briefing, review, promotion, and endless controls.
- `src/Scene.tsx`: canvas lifecycle, view selection, and WebGL fallback.
- `src/scene/World.tsx`: composes the cubicle and desk props.
- `src/scene/useSeatedCamera.ts`: seated look limits, monitor/poster zoom, and poster hit detection.
- `src/scene/`: independent printer, robot, fan, mug, poster, monitor, and workstation components.
- `src/scene/printerAnimation.ts`: pure printer state transitions and paper animation sampling; `Printer.tsx` applies poses to meshes and manages sound.
- `src/TypedComputer.tsx`: text menus, compiler worker, hints, and editor/browser program switching.
- `src/RetroEditor.tsx`: CodeMirror editing, syntax highlighting, cursor handling, search, and undo history.
- `src/retro.css`: shared QBasic/EGA styling for every in-computer screen.
- `src/typed-engine.ts`: tag restrictions, TSX transpilation, and lesson source checks.
- `src/sandbox/`: isolated React runtime and CRT-styled HTML rendering.
- `src/content.ts`: original curriculum, final checkpoints, and seeded exercise content.
- `src/progression.ts`: progression rules and versioned persistence.

## Verify

```sh
npm run format:check
npm test
npx playwright install chromium
npm run test:browser
npm run build
```

Use `npm run format` to format source and tests. TypeScript rejects unused locals and parameters. Keep mesh coordinates and materials in scene components, animation timing in the pure animation module, and campaign updates in the game layer. The generated sandbox runtime is excluded from formatting and should be rebuilt through the existing scripts.

Tests cover the printer’s two-click lifecycle, reduced motion, authored solutions and incorrect repairs, real TSX compilation, typed source checks, tag restrictions, persistence, progression locks, checkpoint retention, and 1,320 generated exercises. Browser tests type and execute the complete campaign and finale, resume after refresh, exercise real state/ref/Hook behavior, reject unsupported tags, inspect the in-world computer, and complete multiple endless rounds. Screenshots go to `test-results/`.

## Attribution

Original English lessons, code, and locally constructed cartoon geometry were created for this game. Topic selection follows the [AP Webframeworks React course](https://similonap.github.io/webframeworks-cursus/wf-course/react). Effects teaching follows the [official React useEffect reference](https://react.dev/reference/react/useEffect), including synchronization, reactive dependencies, cleanup, and the extra Strict Mode development check. This game is not affiliated with AP, React, or Job Simulator; no game assets were borrowed.

Built with React, TypeScript, Vite, Three.js, React Three Fiber, Drei, and CodeMirror. DM Sans and Space Grotesk are bundled through Fontsource under the SIL Open Font License.
