React uses keys to match siblings between renders. A task's ID stays with the task as its title changes. Titles can repeat. Array positions can shift after deletion. Neither title nor array index is a reliable identity for this board.

`key={task.id}` belongs on the element directly returned by map. React consumes key internally; it does not appear as a normal prop. Pass `task` separately and expose `data-task-id={task.id}` on the card's li so the assignment checks can locate the same card after a move.

```tsx
<section aria-label={status}>
  <h2>{status}</h2>
  <ul>
    {columnTasks.map((task) => (
      <TaskCard key={task.id} task={task} />
    ))}
  </ul>
</section>
```

The heading communicates the column visually; the aria-label gives the section an accessible name. A list contains list items. Keep the exact TODO, IN PROGRESS and DONE labels from the brief. Their consistency matters both to people and to the board logic.

A key is local to its sibling list. Moving a card into a different column unmounts it from the old list and mounts it in the new list. Later, saved task data belongs above the columns so it survives that move. Unsaved card editing state remains local.

**Try it:** give two cards the same title but different IDs. Explain why they must remain separate tasks.

**Apply it:** exercise 3, Three columns, one board. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/preserving-and-resetting-state).
