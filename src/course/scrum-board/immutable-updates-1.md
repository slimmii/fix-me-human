An editor often needs two kinds of data: a saved value and an unfinished draft. For example, a profile owns the saved display name, while its name editor owns the draft and whether editing is open.

This excerpt belongs at the top of an editor component with `useState` imported and a `savedName` prop:

```tsx
const [editing, setEditing] = useState(false);
const [draft, setDraft] = useState(savedName);

function beginEdit() {
  setDraft(savedName);
  setEditing(true);
}
```

`useState(savedName)` supplies only the initial value. It does not keep the draft synchronized with later props. Copy the latest saved value when opening the editor so a canceled draft does not reappear.

Use `editing` to choose between the saved display and a controlled input. The input reads `draft` and updates it through `setDraft`. Keep both hooks above any conditional return.

The actions have different jobs:

- **Save:** trim the draft and check it. If it is blank, keep editing open. Otherwise call the parent's save callback with the item's ID and cleaned value, then close the editor.
- **Cancel:** close the editor without calling the save callback. The saved value stays unchanged.
- **Edit again:** start from the currently saved value.

Save and Cancel need separate handlers. Sending every keystroke to the saved data would leave Cancel with nothing to discard. Stable list keys also keep one item's local draft from being reused for a different item after a deletion.
