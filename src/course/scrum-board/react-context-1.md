Context lets a component read a value supplied by an ancestor without passing it through every component in between. The value can be text, settings, or an object containing data and functions. A custom hook is not required.

This complete example shares a greeting. Keep these definitions together in App.tsx:

<!-- prettier-ignore -->
```tsx
import { createContext, useContext } from "react";

interface GreetingContextProps {
  greeting: string;
}

const GreetingContext = createContext<GreetingContextProps | null>(null);

function Welcome() {
  const message = useContext(GreetingContext);
  if (message === null) {
    throw Error("Welcome needs a GreetingContext provider");
  }

  return (
    <p>{message.greeting}</p>
  );
}

function Panel() {
  return (
    <section>
      <Welcome />
    </section>
  );
}

export default function App() {
  return (
    <GreetingContext.Provider value={{ greeting: "Hello, visitor!" }}>
      <Panel />
    </GreetingContext.Provider>
  );
}
```

`createContext` creates the context outside the components. The interface describes its value: an object with a string named `greeting`. `| null` allows the missing-provider case, and the argument `null` supplies that default. It does not set the provider's value.

The provider's `value` prop supplies the greeting to components nested below it. `Panel` does not receive or forward a greeting prop; `Welcome` reads it directly with `useContext`. The double braces in `value={{ ... }}` are a JSX expression containing an object.

Call `useContext` at the component's top level. It reads the nearest matching provider above that component. Without one, it returns the context's default. The guard gives a clear error in that case and tells TypeScript that `message` is not null afterward.

Context carries a value; it does not store state itself. This greeting is fixed, but a provider can also supply a value from `useState`. When that value changes, components reading the context receive the update. Use ordinary props when passing a value directly to a child is already clear.
