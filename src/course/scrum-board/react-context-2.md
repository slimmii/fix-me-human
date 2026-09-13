Put shared state in a provider component when several descendants need to read or change it. The context carries the current value and the actions; `useState` inside the provider owns the data.

This complete example shares a visitor count between two displays. Keep these definitions together in App.tsx:

```tsx
import { createContext, useContext, useState } from "react";
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
  const [count, setCount] = useState(0);

  function increment() {
    setCount((current) => current + 1);
  }

  function reset() {
    setCount(0);
  }

  return (
    <CounterContext.Provider value={{ count, increment, reset }}>
      {children}
    </CounterContext.Provider>
  );
}

function VisitorButton() {
  const counter = useContext(CounterContext);
  if (counter === null) {
    throw Error("VisitorButton needs a CounterProvider");
  }
  const { count, increment, reset } = counter;

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

`CounterContextProps` describes the shared data and action signatures. `CounterProviderProps` describes the wrapper's props: `children` is the JSX nested inside it, and `ReactNode` is React's type for renderable content. The object passed to `value` supplies the current count and functions to descendants.

Both displays show the same count. Clicking either button calls an action owned by the same provider, updates its state and rerenders both consumers. Each `useContext` call reads that shared value. Putting a separate CounterProvider around each display would give them independent counters.

Call `useContext` at the top level and check for null before using its result. Use the provided actions to change state rather than mutating the context object. When an action depends on the previous value, use a functional setter such as `setCount((current) => current + 1)`.

For a larger project, move the context, its value interface and the provider into a module such as CounterContext.tsx. Export the context and provider, then import the context in each consumer and the provider where you wrap them. Remove the old state from the component that previously owned it; keeping both copies would create two sources of truth.

A consumer can still pass an action to a child as a callback prop. Keep temporary input drafts local to the components that edit them. Context is useful for shared data, not a reason to move every piece of state into the provider.

When refactoring a searchable collection, its query can stay in the component that renders the search input and grouped lists. Pass that query to the lists through props while each list reads the saved collection from context. Derive matches and totals during render as before. Changing where the collection lives should preserve search behavior, including an active query during additions, moves, edits and deletions.
