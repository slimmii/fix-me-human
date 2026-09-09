Text and expressions can share the same element. The spaces in your JSX text are part of the result.

```tsx
export default function App() {
  const name = "Alex";
  return <h1>Welcome, {name}</h1>;
}
```

The visible heading is **Welcome, Alex**. Change the value of `name`, run your program again, and the greeting changes with it.

You can also build the entire greeting in JavaScript:

```tsx
export default function App() {
  const name = "Alex";
  const greeting = `Welcome, ${name}`;
  return <h1>{greeting}</h1>;
}
```

Both forms produce the same result. Choose the version that makes your code easier to read.

A variable is useful when several parts of the page use the same value. This simple variable is not interactive state: it has the value assigned when the component runs. Changing the source and running again updates the program.

**Try it:** replace the name, add a second line of text, and check the output. Your task brief tells you the exact heading required for submission.
