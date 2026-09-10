Moving a task affects two columns. If each column owned its own independent task state, coordinating a move would become fragile. App is their closest shared parent, so it owns one task array and supplies data down the tree.

The message path is App → BoardColumn → TaskCard for props, and TaskCard → App for the callback invocation. BoardColumn forwards the function; it does not need to copy state or interpret the event.

```tsx
// App:
<BoardColumn status={status} tasks={tasks} onMove={moveTask} />
// BoardColumn's map:
<TaskCard key={task.id} task={task} onMove={onMove} />
// A TODO card:
<button aria-label="Start task"
  onClick={() => onMove(task.id, "IN PROGRESS")}>Start</button>
```

This is one-way data flow: the callback asks the owner to update; the resulting render sends the new task data down again. The child never assigns to task.status itself.

**Try it:** trace a click from the button to the state setter, then trace the new state back to both columns.

**Apply it:** exercise 6, Move work with callbacks. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/sharing-state-between-components).
