JSX lets you mix markup with values from your JavaScript code. Put an expression inside **curly braces** when you want React to evaluate it.

```tsx
export default function App() {
  const employee = "Human";
  return <h1>{employee}</h1>;
}
```

The screen shows **Human**. Without braces, `<h1>employee</h1>` would show the literal word **employee**.

An expression produces a value. A variable, a calculation such as `2 + 3`, or a function call can be an expression. Statements such as `if` and `const` belong in the JavaScript part of your component, before its `return`.

```tsx
export default function App() {
  const completed = 2;
  return <p>Tasks remaining: {5 - completed}</p>;
}
```

React renders the result of the calculation. Keep text outside the braces when you want it to appear exactly as written.

> Braces tell React: this part comes from my code.
