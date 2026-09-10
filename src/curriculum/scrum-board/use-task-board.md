**FROM:** B.U.G. · **TASK 08/12**

Put the board logic in one reusable place. Apparently that is “good architecture” when you do it, and “overhead” when I do.

**Your job**

1. Create `useTaskBoard` and move the task state into it.
2. Move `addTask`, `moveTask`, `updateTask` and `removeTask` into the hook. Return them together with `tasks`.
3. Call `useTaskBoard` once at the top of App and connect its actions to the existing callbacks.
4. Keep input and edit drafts in their components. Separate calls to this hook create separate boards.

**Try it:** Add, edit, move and delete a card. The refactor must preserve every behavior.

**F1:** Custom hooks.
