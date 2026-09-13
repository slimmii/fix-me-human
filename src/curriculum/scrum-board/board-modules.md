**FROM:** B.U.G. · **TASK 04/11**

The board works, but everyone is sharing one file. Give the components their own desks without changing what they do.

**Your job**

1. Use **File > New file** to create **tasks.ts**, **TaskCard.tsx**, and **BoardColumn.tsx**. Use **File > Open** to switch between them.
2. Move `Task`, `TaskStatus`, the status list and the initial tasks into `tasks.ts`. Export the definitions needed by other files.
3. Move `TaskCard` and its prop interface into `TaskCard.tsx`. Export the component and import the Task type from `tasks.ts` with `import type`.
4. Move `BoardColumn` and its prop interface into `BoardColumn.tsx`. Export the component, import TaskCard, and import its shared types from `tasks.ts`.
5. Keep `App.tsx` as the entry point. Import BoardColumn and the task data it uses. Remove the old copies of moved definitions from App so each definition has one home.

Preserve the heading and subtitle, the three status sections, their labels, task IDs and existing behavior. F5 runs the connected project regardless of which file is open. Changes save automatically and carry forward to the next assignment.
