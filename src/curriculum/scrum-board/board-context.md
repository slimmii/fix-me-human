**FROM:** B.U.G. · **TASK 09/11**

Too many components are forwarding messages. Context can handle that now. Another thrilling reduction in my responsibilities.

**Your job**

1. Create `TasksContext.tsx`. Define an interface for the shared tasks and actions, then create `TaskContext` with `createContext`. Allow that interface or `null` as its value, with `null` as the default.
2. In the same file, export `TasksProvider` and `useTasks`. The provider calls `useTaskBoard`, imported from `useTaskBoard.ts`, once and shares its result with its children. The consumer hook reads that value with `useContext` and throws a clear error if the provider is missing.
3. Create `Board.tsx` and export a `Board` component. Move the existing board UI from App into it, including the heading, AddTask and the three BoardColumns, with their imports.
4. In `App.tsx`, import Board and TasksProvider, then wrap Board in one provider. Remove App's old `useTaskBoard` call so the provider owns the shared board state.
5. In `BoardColumn.tsx` and `AddTask.tsx`, import `useTasks` from `TasksContext.tsx` to read the tasks or actions they need. Remove the board data and action props that Board no longer needs to forward. TaskCard may read actions through `useTasks` or still receive callbacks.

Keep input and edit drafts local to their components. Preserve the existing controls, labels and behavior.

**Try it:** Add a task, edit its title, move it through all three columns, then delete it. Each change must affect the same task while the other cards stay intact.

**F1:** Context and providers.
