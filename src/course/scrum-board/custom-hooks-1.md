A custom hook groups related state and operations in a function. Its name starts with `use`, and it follows the same calling rules as React's hooks.

```tsx
import { useState } from "react";

function useCounter() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount((current) => current + 1);
  }

  function reset() {
    setCount(0);
  }

  return { count, increment, reset };
}
```

The hook returns an object containing the current value and two actions. Returning functions does not call them. A component can read the result with object destructuring:

```tsx
export default function App() {
  const { count, increment, reset } = useCounter();

  return (
    <section>
      <p>Visitors: {count}</p>
      <button onClick={increment}>Count a visitor</button>
      <button onClick={reset}>Reset</button>
    </section>
  );
}
```

The hook owns the state changes; the component decides how to display the value and trigger the actions. Call the hook at the component's top level, before conditional returns.

To extract existing logic, move its state and related handlers together, return the values and actions the UI needs, and reconnect the existing callers. Keep the behavior unchanged during extraction. Unrelated input drafts can stay in their own components.
