A type tells callers what a component expects. A small props type can appear inline, or have a reusable name:

```tsx
type CardProps = { title: string };
function TaskCard({ title }: CardProps) {
  return (
    <li>
      <p>{title}</p>
    </li>
  );
}
```

`{ title: string }` in the parameter annotation is a type description. `{ title }` before the colon is JavaScript destructuring. `{title}` inside the p is a JSX expression. They look similar but perform different jobs.

Later the card receives a Task object with `id`, `title` and `status`. Use a union such as `"TODO" | "IN PROGRESS" | "DONE"` to describe the allowed statuses. This prevents a typo from creating an accidental fourth column.

Props should describe the component's useful inputs. A TaskCard should not need the whole application's settings or all tasks merely to display one title. Start with the smallest boundary that makes reuse clear.

**Try it:** explain why `<TaskCard title="Plan sprint" />` and `<TaskCard title={"Plan sprint"} />` render the same value. Then identify which part of the code documents the type.

**Apply it:** exercise 2, Reusable task cards. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/typescript).
