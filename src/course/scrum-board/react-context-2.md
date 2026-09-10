Give consumers one clear way to access the board:

```tsx
function useTasks() {
  const board = useContext(TaskContext);
  if (!board) throw Error("useTasks needs a TasksProvider");
  return board;
}
// Inside a consumer:
const { tasks, moveTask } = useTasks();
```

The null default and guard turn a missing provider into an understandable error. `ReturnType<typeof useTaskBoard>` keeps the context type aligned with the hook's API. Reading context subscribes a consumer to its provider's value, so changes render in all relevant descendants.

Use useTasks in BoardColumn and AddTask. A card may consume actions directly or receive a focused callback from a context-reading parent. Context and callbacks work together: a button still invokes an action to request an update.

Do not mutate the context value. Use the operations returned by the provider's hook. Keep local drafts local. Context is useful here to practice communication across a growing tree; props remain a good choice for small, direct relationships.

**Try it:** add a task from AddTask and confirm the appropriate column changes. If it does not, check for a second useTaskBoard call or an extra provider.

**Apply it:** exercise 9, Share the board with context. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/reference/react/useContext).
