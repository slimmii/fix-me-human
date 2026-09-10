A consumer reads the nearest matching provider above it with `useContext`. A small custom hook can make that read easy to reuse and explain a missing provider clearly.

Add these definitions to the counter example from the previous page:

<!-- prettier-ignore -->
```tsx
import { useContext } from "react";

function useCounterValue() {
  const counter = useContext(CounterContext);
  if (counter === null) {
    throw Error("useCounterValue needs a CounterProvider");
  }
  return counter;
}

function VisitorButton() {
  const { count, increment } = useCounterValue();

  return (
    <button onClick={increment}>Visitors: {count}</button>
  );
}

export default function App() {
  return (
    <CounterProvider>
      <VisitorButton />
    </CounterProvider>
  );
}
```

The guard stops execution if the provider is missing. After the guard, TypeScript knows the value is not null. When the provider's state changes, consumers receive the updated value.

`useCounterValue` reads shared state; it does not create another counter. Call it at the top level of each component that needs the shared value. Calling `useCounter` in those components instead would create independent state.

Context and callbacks work together: the button still invokes an action from the state owner. Never modify the context object directly. A consumer can also pass an action to a child as a focused prop. Keep local drafts local, and use ordinary props for simple direct relationships.
