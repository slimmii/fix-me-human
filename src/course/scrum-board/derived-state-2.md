The board has two useful quantities: all tasks in a column and the tasks visible under the current search. Choose deliberately which one your UI communicates.

For this project, show `columnTasks.length` as N tasks. Show the cards from visibleTasks. When visibleTasks is empty, render No matching tasks. A column can therefore display 2 tasks while showing no cards under a restrictive search. Clearing search makes those cards visible again.

```tsx
<p aria-label="Task count">{columnTasks.length} tasks</p>;
{
  visibleTasks.length === 0 && <p>No matching tasks</p>;
}
```

Use an explicit length comparison before `&&`; writing `visibleTasks.length && ...` can render a stray zero. Recompute counts from the task array after every operation, rather than adjusting separate counters in several handlers.

The assignment uses the exact N tasks format for consistent checks, including 1 tasks. A production polish pass could add grammatical singular/plural handling after updating the public contract and its checks.

**Try it:** search for an impossible title, clear search, move a card, and delete another. Counts should describe the saved board throughout.

**Apply it:** exercise 10, Find work and count it. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/conditional-rendering).
