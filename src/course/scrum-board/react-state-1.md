Changing an ordinary local variable does not request another render. State gives React a value to remember between renders and a setter that requests an update.

```tsx
import { useState } from "react";
// At the top level inside App:
const [tasks, setTasks] = useState<Task[]>(initialTasks);
```

The array destructuring names the current snapshot and its setter. `Task[]` describes an array of tasks. The initial value is used when the component first mounts; it is not reapplied whenever the component renders.

A click handler runs in response to a user action:

```tsx
<button onClick={() => addTask("Review backlog")}>Add sample task</button>
```

Pass a function to onClick. Writing `onClick={addTask("Review backlog")}` invokes addTask during render instead, which can repeatedly update state. Hooks such as useState must be called at the top level of a component or custom hook, before any conditional early return. Do not call them in loops, conditions or event handlers.

**Try it:** click the sample button twice. Predict the total number of tasks before reading the result.

**Apply it:** exercise 4, Give the board a memory. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/state-a-components-memory).
