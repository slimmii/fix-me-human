Props are inputs a parent passes to a component. One component definition can display different values each time it is used.

<!-- prettier-ignore -->
```tsx
interface GreetingProps {
  name: string;
}

function Greeting({ name }: GreetingProps) {
  return (
    <p>Hello, {name}.</p>
  );
}

export default function App() {
  return (
    <section>
      <h1>Visitors</h1>
      <Greeting name="Mina" />
      <Greeting name="Leo" />
    </section>
  );
}
```

`GreetingProps` describes the component's expected input. `{ name }` in the parameter reads the `name` property from the props object. `{name}` in the paragraph inserts its value into the output. Changing the paragraph in `Greeting` changes both greetings.

A quoted prop supplies text. Braces supply a JavaScript value: `name={visitorName}` reads a variable, while `name="visitorName"` supplies that literal word. Numbers, objects, arrays and functions also use braces.

Props are read-only. A child displays the data it receives; it does not change a parent's object. Later, function props let a child request a change.

For a collection, use a `ul` containing `li` items. A reusable item component can return the `li`, with a `p` inside for its text; the parent then places instances of that component inside the `ul`.

Define components outside other components and render them with JSX, such as `<Greeting name="Mina" />`. Nesting their definitions can reset local state when the parent renders again.
