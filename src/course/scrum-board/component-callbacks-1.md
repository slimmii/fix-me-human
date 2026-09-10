When two components need the same changing value, keep it in their closest shared parent. Pass the value down as a prop and give children callbacks to request updates.

<!-- prettier-ignore -->
```tsx
import { useState } from "react";

interface AdjusterProps {
  onIncrease: () => void;
}

function Adjuster({ onIncrease }: AdjusterProps) {
  return (
    <button onClick={onIncrease}>Warmer</button>
  );
}

export default function App() {
  const [degrees, setDegrees] = useState(18);

  function increase() {
    setDegrees((current) => current + 1);
  }

  return (
    <section>
      <p>Room temperature: {degrees}</p>
      <Adjuster onIncrease={increase} />
    </section>
  );
}
```

The parent owns `degrees`. Clicking the child's button calls the parent's function. The setter requests a render, and the displayed temperature updates. This is lifting state up: related parts of the screen use one source of truth.

If there is a component between the owner and the button, it can receive `onIncrease` as a prop and forward it with `onIncrease={onIncrease}`. Give its props interface the same callback type. It does not need another state variable.

Keep state local when only one component needs it. Share saved values when multiple components must agree. Copying a prop into another `useState` creates a separate value that will not automatically follow future prop changes.
