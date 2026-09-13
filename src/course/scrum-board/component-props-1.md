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

`GreetingProps` describes the component's expected input. `{ name }` in the parameter reads the `name` property from the props object. 

A quoted prop supplies text. Braces supply a JavaScript value: `name={visitorName}` reads a variable, while `name="visitorName"` supplies that literal word. Numbers, objects, arrays and functions also use braces.

Props are read-only. A child displays the data it receives; it does not change a parent's object. 
