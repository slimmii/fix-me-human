Editing and deletion are parent operations, requested through callbacks:

```tsx
function updateTask(id: number, title: string) {
  const trimmed = title.trim();
  if (!trimmed) return;
  setTasks((current) =>
    current.map((task) =>
      task.id === id ? { ...task, title: trimmed } : task,
    ),
  );
}
function removeTask(id: number) {
  setTasks((current) => current.filter((task) => task.id !== id));
}
```

Map describes replacement; filter describes removal. Avoid mutating an existing task object, using splice on state, or deleting every task whose title matches. Two cards called Plan sprint must remain independent.

Keep the existing move and add actions working while adding editing. A refactor should preserve useful behavior unless the exercise explicitly changes it.

**Try it:** add a duplicate title, delete the original by ID, then move the remaining copy. Next delete the last card in a column and add another task. Empty arrays are normal data, not an error.

**Apply it:** exercise 7, Edit and delete safely. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/updating-arrays-in-state).
