The board needs several cards with the same structure and different titles. A prop is an input supplied by a parent component. It can be a string, number, object, array, function or JSX.

```tsx
function TaskCard({ title }: { title: string }) {
  return <li><p>{title}</p></li>;
}
// Inside App's returned ul:
<TaskCard title="Plan sprint" />
<TaskCard title="Build board" />
```

The parent sets `title`; destructuring reads it from the props object. `{title}` inserts the value into JSX. Props are read-only snapshots for a render. Do not assign a new value to a prop or modify an object received through props. Later, callbacks will let the card request changes from the owner of the data.

Define TaskCard outside App. Defining a component inside another component recreates its identity on every render and can reset its state. Rendering `<TaskCard />` tells React to manage its identity and lifecycle; calling `TaskCard(...)` directly bypasses that component boundary.

**Try it:** render three cards from one definition. Change the definition once and notice that all three cards update.

**Apply it:** exercise 2, Reusable task cards. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/passing-props-to-a-component).
