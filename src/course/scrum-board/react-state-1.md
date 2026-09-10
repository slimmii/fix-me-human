State is a component's memory. Changing an ordinary variable does not tell React to update the screen. A state setter does.

```tsx
import { useState } from "react";

export default function App() {
  const [cups, setCups] = useState(0);

  function addCup() {
    setCups((current) => current + 1);
  }

  return (
    <section>
      <p>Cups poured: {cups}</p>
      <button onClick={addCup}>Pour a cup</button>
    </section>
  );
}
```

`useState(0)` gives the initial value. Array destructuring names the current value `cups` and the setter `setCups`. The setter requests another render with the new value. The initial value is used when the component mounts, not on every render.

`onClick={addCup}` passes a function for React to call after a click. `onClick={addCup()}` calls it while rendering. When a handler needs arguments, wrap the call in a function, such as `onClick={() => changeAmount(2)}`.

Functions starting with `use`, such as `useState`, are hooks. Call hooks at the top level of a component or custom hook, before any early return. Keep them out of loops, conditions and event handlers.
