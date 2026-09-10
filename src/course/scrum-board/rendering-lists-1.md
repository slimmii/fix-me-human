Separate data from presentation. A task has an identity, a title and one status:

```tsx
type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const tasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];
```

A BoardColumn receives the tasks and its status. `filter` returns the matching tasks without changing the original array. `map` turns each matching task into a rendered card.

```tsx
const columnTasks = tasks.filter((task) => task.status === status);
<ul>
  {columnTasks.map((task) => (
    <TaskCard key={task.id} task={task} />
  ))}
</ul>;
```

Use braces to enter JavaScript from JSX. An arrow function with a concise expression returns that expression; an arrow function with a block needs an explicit return. Forgetting it is a common cause of an empty list.

**Try it:** change only one seed task's status. It should appear in another column without editing the column JSX.

**Apply it:** exercise 3, Three columns, one board. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/rendering-lists).
