A component can receive values from the component that renders it. These inputs are called **props**.

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

export default function App() {
  return <Greeting name="Alex" />;
}
```

`App` renders `Greeting` and supplies the `name` prop. `Greeting` receives that value and inserts it into its heading. The result is **Hello, Alex**.

Start custom component names with a capital letter. `<Greeting />` refers to your function; lowercase tags such as `<h1>` refer to HTML elements.

You can use the same component more than once, with different props:

```tsx
function Badge({ name }: { name: string }) {
  return <p>Employee: {name}</p>;
}

export default function App() {
  return (
    <section>
      <Badge name="Alex" />
      <Badge name="Sam" />
    </section>
  );
}
```

The two badges share one implementation. Each receives its own `name` value.
