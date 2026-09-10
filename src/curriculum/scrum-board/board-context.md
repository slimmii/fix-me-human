**FROM:** B.U.G. · **TASK 09/12**

Too many components are forwarding messages. Context can handle that now. Another thrilling reduction in my responsibilities.

**Your job**

1. Create `TaskContext` with `createContext` and a null default.
2. Create `TasksProvider`: call `useTaskBoard` once and provide its result. Wrap Board in this provider from App.
3. Create `useTasks` using `useContext`; throw a clear error if the provider is missing.
4. Use `useTasks` in BoardColumn and AddTask instead of passing board data through intermediaries. Cards may consume actions or receive callbacks.
5. Keep input/edit drafts local and all existing controls working.

**Try it:** Add a task from the input. Every column must read the same board, not its own private copy.

**F1:** Context and providers.
