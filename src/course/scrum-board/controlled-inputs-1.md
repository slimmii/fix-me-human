An input is controlled when React supplies its value and updates that value after user input.

```tsx
const [title, setTitle] = useState("");
<label>
  Task title
  <input
    aria-label="Task title"
    value={title}
    onChange={(event) => setTitle(event.target.value)}
  />
</label>;
```

The event supplies the new text through event.target.value. Keep the value a string from the first render onward. A controlled input with no change handler cannot reflect typing. `defaultValue` only supplies an uncontrolled input's initial value; it does not keep React state synchronized.

The input draft belongs in AddTask because no other component needs every keystroke. The saved task list belongs in App because all columns need it. Local state and shared state can coexist without duplication.

**Try it:** type several spaces. The draft may contain them while editing, but creating a task should validate the trimmed result.

**Apply it:** exercise 5, Capture a task. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/reference/react-dom/components/input).
