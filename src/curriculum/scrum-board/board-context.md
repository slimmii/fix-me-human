**FROM:** B.U.G. · **TASK 10/11**

Too many components are forwarding messages. Context can handle that now. Another thrilling reduction in my responsibilities.

**Your job**

1. Create `TasksContext.tsx`. Define an interface for the shared tasks and actions, then create `TaskContext` with `createContext`. Allow that interface or `null` as its value, with `null` as the default.
2. In the same file, export `TasksProvider`. Move the saved task state and its add, move, update and remove functions from App into this provider. Import the initial tasks and shared types from `tasks.ts`. Give the provider a `children` prop typed as `ReactNode`, and pass an object containing the tasks and actions to `TaskContext.Provider` through its `value` prop.
3. Create `Board.tsx` and export a `Board` component. Move the existing board UI from App into it, including the heading and subtitle, AddTask, search input and the three BoardColumns, with their imports. Move the query state into Board and keep passing `query` to each column.
4. In `App.tsx`, import Board and TasksProvider, then wrap Board in one provider. Remove the old state and action definitions from App so the provider owns the shared board state.
5. In `BoardColumn.tsx` and `AddTask.tsx`, import `TaskContext` and read it with `useContext` at the component's top level. Throw a clear error if the value is null before reading its tasks or actions. Remove the board data and action props that Board no longer needs to forward. TaskCard may also read actions directly from context or still receive callbacks.

Keep the query local to Board and input and edit drafts local to their components. Each column now reads tasks from context and combines them with its status and query props to derive counts and visible cards. Preserve the existing controls, labels, filtering and empty messages.
