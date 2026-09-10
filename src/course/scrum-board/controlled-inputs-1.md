A controlled input displays a value from React state and updates that state as the user types.

```tsx
import { useState } from "react";

export default function App() {
  const [name, setName] = useState("");

  return (
    <section>
      <label>
        Visitor name
        <input
          aria-label="Visitor name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <p>Welcome, {name}.</p>
    </section>
  );
}
```

`value` controls the text shown. `onChange` receives the input event, and `event.target.value` contains the new text. Updating state causes React to display that text on the next render. Keep the state a string, starting with `""` for an empty field.

A controlled input needs both `value` and `onChange`. Supplying only `value` makes it impossible to type a new value. `defaultValue` gives an uncontrolled input its initial text; it does not keep React state up to date.

The visible label explains the input, and `aria-label` gives it an accessible name. A placeholder is not a replacement for a label.

Keep an unfinished draft near its input. Another component usually needs the confirmed value, not every keystroke. The next page explains how to send that confirmed value through a function prop.
