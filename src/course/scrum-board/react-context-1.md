Context supplies a value to components below a provider without forwarding it through every intermediate component. The value can contain both state and action functions.

This example uses `useCounter` from the Custom hooks topic, defined in the same file:

```tsx
import { createContext } from "react";
import type { ReactNode } from "react";

const CounterContext = createContext<ReturnType<typeof useCounter> | null>(
  null,
);

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
```

Create the context outside components. `ReturnType<typeof useCounter>` describes the object returned by the hook, including its actions. `| null` allows a missing-provider value; the argument `null` sets that default.

The provider calls the stateful hook once and supplies its result through `value`. `children` is the nested JSX between the provider's opening and closing tags. `ReactNode` is React's type for renderable content.

All components that need this value must be below the same provider. Putting a separate provider around each consumer would create independent counters. The provider supplies an existing state value; context itself does not store the count.
