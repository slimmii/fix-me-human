A child can request an action using a function prop. The parent decides how to change the shared data.

```tsx
function AddTask({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return (
    <div>
      <input
        aria-label="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button aria-label="Add task" onClick={handleAdd}>
        Add task
      </button>
    </div>
  );
}
```

`(title: string) => void` describes a callback that accepts text and whose return value is not used. App renders `<AddTask onAdd={addTask} />`. The owner also trims and rejects empty titles so its operation is safe for any caller.

Do not reject duplicate titles: use IDs to tell tasks apart. Clear the field only after a valid addition. You can optionally support Enter with onKeyDown; use the same handleAdd function so keyboard and pointer actions follow the same rules.

**Try it:** add two tasks with the same title. They should be two cards, not one overwritten object.

**Apply it:** exercise 5, Capture a task. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/responding-to-events).
