A card needs a temporary editing mode and an unsaved title. Those values belong to that card. The saved title still belongs to the shared task array.

```tsx
const [editing, setEditing] = useState(false);
const [draft, setDraft] = useState(task.title);
function beginEdit() {
  setDraft(task.title);
  setEditing(true);
}
```

Initialize the draft again when Edit is clicked, so a previous cancellation does not reappear. During editing, render a controlled input and Save task / Cancel edit buttons. A blank save keeps the editor open. A valid save calls onUpdate with the task ID and trimmed draft, then closes editing. Cancel closes editing without calling onUpdate.

`useState(task.title)` is an initial value, not continuous synchronization with props. Do not add an effect merely to keep every edit keystroke in the shared task list. The distinction between draft and saved title is intentional.

Call hooks before any early return for editing mode. Stable card keys ensure deleting a neighbor does not transplant the wrong local draft into another card.

**Try it:** type a replacement, cancel it, and reopen editing. The input should contain the saved title.

**Apply it:** exercise 7, Edit and delete safely. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/choosing-the-state-structure).
