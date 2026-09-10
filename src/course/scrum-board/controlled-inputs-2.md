A function prop lets a child report an action to its parent. For a visitor name editor, the prop can describe a callback that receives text:

```tsx
interface NameEntryProps {
  onConfirm: (name: string) => void;
}
```

`(name: string) => void` means the callback accepts a string and its return value is not used. The child reads `onConfirm` from its props. The parent supplies a handler with `onConfirm={saveName}` and decides what to do with the confirmed value.

This handler excerpt belongs inside that child, alongside the `name` and `setName` state from the previous page:

```tsx
function handleConfirm() {
  const cleaned = name.trim();
  if (cleaned === "") return;

  onConfirm(cleaned);
  setName("");
}
```

`trim()` removes whitespace at the start and end. An early return stops a blank submission. A valid value goes to the parent before the draft is cleared. Connect the handler to a button with `onClick={handleConfirm}`. The input itself still needs `value` and `onChange`.

Leave the draft unchanged while typing and validate on confirmation. The shared operation should also reject invalid values so other callers cannot bypass the rule. Whether duplicate names are allowed is a product requirement, separate from whitespace validation and item identity.

Button text supplies an accessible name. If the visible text is abbreviated, `aria-label` can provide the full action name required by the brief.
