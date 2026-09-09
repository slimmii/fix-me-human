Start a component name with a **capital letter**, such as `App`. Lowercase names such as `h1` refer to built-in elements.

Use `return` to give React the markup to display:

```tsx
function App() {
  return <h1>Hello world</h1>;
}
```

- `function App()` defines the component.
- The curly braces contain the function's code.
- `return` gives React a heading to render.
- `</h1>` closes the heading.

Keep the markup on the same line as `return`, as shown here. A bare `return` followed by a new line ends the return before the markup.
