Once context is working, custom hooks can help organize the code. A stateful hook can produce the value a provider shares, and a consumer hook can reuse the context read and its guard. These are optional ways to combine the concepts.

This counter example uses `useCounter` from the Custom hooks topic. Copy that topic's first code block, including its `useState` import, then add the following definitions in the same file. The hook returns a count and two actions, which we describe with an ordinary interface:

```tsx
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface CounterContextProps {
  count: number;
  increment: () => void;
  reset: () => void;
}

const CounterContext = createContext<CounterContextProps | null>(null);

interface CounterProviderProps {
  children: ReactNode;
}

function CounterProvider({ children }: CounterProviderProps) {
  const counter = useCounter();

  return (
    <CounterContext.Provider value={counter}>
      {children}
    </CounterContext.Provider>
  );
}

function useCounterValue() {
  const counter = useContext(CounterContext);
  if (counter === null) {
    throw Error("useCounterValue needs a CounterProvider");
  }
  return counter;
}
```

`CounterContextProps` describes the shared value; `CounterProviderProps` describes the wrapper component's props. `children` is the JSX nested inside that wrapper, and `ReactNode` is React's type for renderable content. The context accepts an object matching its interface, regardless of whether a custom hook produced it.

Add these components below those definitions:

```tsx
function VisitorButton() {
  const { count, increment, reset } = useCounterValue();

  return (
    <section>
      <p>Visitors: {count}</p>
      <button onClick={increment}>Count a visitor</button>
      <button onClick={reset}>Reset</button>
    </section>
  );
}

export default function App() {
  return (
    <CounterProvider>
      <VisitorButton />
      <VisitorButton />
    </CounterProvider>
  );
}
```

Both displays show the same count: clicking either Count a visitor button updates the value they share. The provider calls `useCounter` once to own that state. Each `useCounterValue` call only reads it. Calling `useCounter` in each visitor component, or wrapping each one in a separate CounterProvider, would create independent counters.

The consumer hook follows the same top-level calling rule as `useContext`. Components could also call `useContext` and check for null directly, as on the previous page; the wrapper simply avoids repeating that code.

Use the provided actions to change state rather than modifying the context object. A consumer can still pass an action to a child as a callback prop. Keep temporary input drafts local to the components that edit them.
