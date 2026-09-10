`useEffect` runs code after React updates the page. For example, it can keep the browser's document title in sync with the city shown in a component.

```tsx
import { useEffect, useState } from "react";

export default function App() {
  const [city, setCity] = useState("Brussels");

  useEffect(() => {
    document.title = `Weather in ${city}`;
  }, [city]);

  return (
    <section>
      <h1>Weather in {city}</h1>
      <button onClick={() => setCity("Ghent")}>Show Ghent</button>
    </section>
  );
}
```

The effect first sets the title to **Weather in Brussels**. When the button changes `city` to `"Ghent"`, React updates the heading and the effect updates the title to **Weather in Ghent**.

**What the dependency array does**

The array after the effect's function controls when it runs again:

- `[city]`: runs when the component first appears and again when `city` changes.
- `[]`: runs when the component first appears. Changes to state or props do not run it again. Removing the component and adding it back starts the effect again.
- No array: runs after every completed render of the component.

With `[]` in this example, the title would stay **Weather in Brussels**, even when the heading changes to Ghent. The effect reads `city`, so `[city]` is the right dependency array here.

Keep `useEffect` directly inside the component, before `return`, outside conditions and click handlers. Keep the title assignment inside the effect.

In the office sandbox, `document.title` updates the BUGSCAPE browser window's title bar on the fake computer. The outer office tab keeps its own title.
