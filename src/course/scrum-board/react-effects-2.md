**A timer with cleanup**

This counter adds 1 every second while it is on the page:

```tsx
import { useEffect, useState } from "react";

export default function Counter() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <p>{seconds} seconds</p>;
}
```

`setInterval` starts the timer. `1000` means 1,000 milliseconds, or one second. The updater `previous => previous + 1` adds to the latest count without reading `seconds` inside the effect.

The empty array `[]` means updating the counter does not restart the effect. The timer keeps ticking on its own.

The returned function is the **cleanup**. When React removes the counter from the page, it calls `clearInterval(timer)` to stop the timer. Without cleanup, the timer would keep running after the counter disappears.

Cleanup also runs before an effect restarts because a dependency changed. In development, Strict Mode can run setup → cleanup → setup as an extra check, even with `[]`. This example stops the first timer before starting another.

**A title based on a count**

An effect can also use a calculated value. In a library component with a `books` array and `useEffect` imported, the count and effect look like this:

```tsx
const total = books.length;

useEffect(() => {
  document.title = `Library — ${total} books`;
}, [total]);
```

With 8 books, the title is **Library — 8 books**. A search that shows only 2 books leaves the title at 8 because the count comes from the full collection. Deleting a book changes `total` to 7, so the effect updates the title.

The count is calculated directly from `books`; it needs no extra state or effect. The title assignment leaves no timer or subscription running, so it needs no cleanup.
