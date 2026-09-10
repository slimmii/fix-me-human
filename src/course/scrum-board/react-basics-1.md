React describes a page with components: functions that return markup. A component name begins with a capital letter so React can distinguish it from a built-in element such as `h1`. The office runs the component you export from Office.tsx.

```tsx
export default function App() {
  return (
    <section>
      <h1>Sprint board</h1>
      <p>Work starts here.</p>
    </section>
  );
}
```

`export default` makes App the file's entry point. `return` supplies what React should display. The angle-bracket syntax is JSX; TypeScript with JSX lives in a `.tsx` file. Keep one outer element around sibling elements. Put multiline JSX in parentheses immediately after return; a newline before the expression can accidentally return nothing.

JSX can include JavaScript expressions in braces:

```tsx
const team = "Human resources";
// Inside a component's return:
<p>
  {team} has {2 + 1} tasks.
</p>;
```

Braces evaluate values; quoted text stays literal. Use `className` instead of HTML's class attribute. Close every tag, including `<input />`. A component should calculate its output without changing other objects during render.

**Try it:** change the description, keeping the exact Sprint board heading. Predict which text changes before running.

**Apply it:** exercise 1, Sprint board. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/your-first-component).
