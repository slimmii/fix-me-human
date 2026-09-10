The query is new information entered by the user, so keep it in state. Filtered tasks are a calculation from tasks and query, so calculate them during render.

```tsx
const [query, setQuery] = useState("");
const columnTasks = tasks.filter((task) => task.status === status);
const visibleTasks = columnTasks.filter((task) =>
  task.title.toLowerCase().includes(query.trim().toLowerCase()),
);
```

Pass query to each column. A controlled Search tasks input updates it. Lowercasing both sides makes matching case-insensitive; trimming ignores accidental spaces around the query. An empty query matches every title.

Do not put visibleTasks in another state variable and synchronize it with an effect. That creates a second representation that can briefly lag behind the actual board or be forgotten during an edit/delete action. A small array filter does not need useMemo for correctness.

**Try it:** search for BUILD, then edit a matching title. The view should reflect the saved data immediately.

**Apply it:** exercise 10, Find work and count it. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/you-might-not-need-an-effect).
