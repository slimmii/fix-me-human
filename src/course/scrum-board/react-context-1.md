Context lets a component read a value supplied by an ancestor without threading that value through every intermediate component. It does not replace state; the provider still needs a state owner.

```tsx
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
const TaskContext = createContext<ReturnType<typeof useTaskBoard> | null>(null);
function TasksProvider({ children }: { children: ReactNode }) {
  const board = useTaskBoard();
  return <TaskContext.Provider value={board}>{children}</TaskContext.Provider>;
}
```

Create the context outside components so its identity is stable. TasksProvider calls useTaskBoard once. App wraps Board in TasksProvider, and the input, cards and columns are descendants of that provider. The children prop represents the nested JSX.

The nearest matching provider supplies the context value. Placing a separate provider around each column would create separate boards. Putting the provider below a component that needs the value cannot supply that component.

**Try it:** sketch App → TasksProvider → Board → columns/cards and locate the one task state owner.

**Apply it:** exercise 9, Share the board with context. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/passing-data-deeply-with-context).
