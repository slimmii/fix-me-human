Here is the **complete program** for our Hello world application:

```tsx
export default function App() {
  return <h1>Hello world</h1>;
}
```

The result is a heading that reads:

> Hello world

`export default` makes this component available as the file's main export. Our game uses that export to decide which component to display.

Read the program from top to bottom: export a function called `App`, then return a heading with some text. That is all this application needs.

> **B.U.G.:** A functioning application in three lines. Please do not tell accounting.
