A React component is a function that describes part of a page. It returns JSX: markup written inside JavaScript. A `.tsx` file combines JSX with TypeScript.

```tsx
export default function App() {
  const place = "Corner café";

  return (
    <section>
      <h1>{place}</h1>
      <p>Fresh coffee from {8 + 1} in the morning.</p>
    </section>
  );
}
```

`App` starts with a capital letter because it is a component. Lowercase names such as `section` and `p` are built-in HTML elements. `export default` makes this component the file's entry point; the office preview renders it for you.

`return` supplies the JSX to display. Keep the opening parenthesis on the same line as `return`, and wrap sibling elements in one parent element. A fragment, `<>...</>`, can also group siblings without adding an HTML element.

Braces insert JavaScript values into JSX. Here, `{place}` displays the string and `{8 + 1}` displays 9. Text outside braces stays literal. Close every tag, including standalone elements such as `<input />`.

Components calculate what the screen should show. Keep changes to data out of the render itself; later topics explain how clicks request updates.
