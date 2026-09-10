Each render sees a snapshot of state. Calling a setter schedules a future render; it does not immediately rewrite the variable in the current handler. When the next value depends on the previous value, use the setter's function form.

```tsx
setTasks((current) => [
  ...current,
  {
    id: Math.max(0, ...current.map((task) => task.id)) + 1,
    title: "Review backlog",
    status: "TODO",
  },
]);
```

The spread creates a new array. The maximum current numeric ID plus one avoids collisions among existing cards, including when titles repeat. For this in-memory board it is enough; a server-backed board would need a different ID policy. IDs need to remain stable for each existing task, not equal its position in a filtered array.

Do not call `tasks.push(...)` and pass the same array back. React state should be treated as read-only. Updaters must be pure: calculate and return data, without sending messages, changing external variables or performing other side effects. React may call an updater more than once during development to help detect impurity.

**Try it:** explain why two calls using `current => ...` compose correctly, while two calculations based on one old snapshot can overwrite each other.

**Apply it:** exercise 4, Give the board a memory. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/queueing-a-series-of-state-updates).
