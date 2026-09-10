Rendering calculates JSX. An effect synchronizes something outside that JSX after React updates the screen. A document title is one example: it belongs to the browser document, not a returned element.

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

The first function is the effect's setup. `[city]` is its dependency array. The effect runs after the initial render is committed and again after a render where `city` changed. The backticks make a template string; `${city}` inserts the current city into it.

Keep `useEffect` at the top level, like other hooks. Include the reactive values it reads. With an empty dependency array, this title would keep its initial city after the button is clicked. Assigning the title during render would put a side effect in a calculation that should remain pure.

The office sandbox permits `document.title`. It changes the embedded preview's title, not the outer office tab. It does not permit network or browser storage access.
