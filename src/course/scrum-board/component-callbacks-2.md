Use the ID to locate the target. Map returns a new array and replaces only the matching object:

```tsx
function moveTask(id: number, status: Status) {
  setTasks((current) =>
    current.map((task) => (task.id === id ? { ...task, status } : task)),
  );
}
```

The object spread preserves id and title while replacing status. Unchanged tasks keep their existing objects. Filtering each column from the updated array makes a task disappear from one column and appear in another without maintaining separate lists.

Render actions conditionally: Start for TODO, Finish for IN PROGRESS, Reopen for DONE. Use `condition && <button ... />` when there is nothing to show otherwise. Reopen sends the task back to TODO.

A callback accepts domain information (task ID and destination), rather than exposing a setter or DOM event throughout the tree. This keeps TaskCard independent of how the board stores its data.

**Try it:** finish Plan sprint and then reopen it. Build board and Ship demo should keep their titles, statuses and identities.

**Apply it:** exercise 6, Move work with callbacks. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/updating-arrays-in-state).
