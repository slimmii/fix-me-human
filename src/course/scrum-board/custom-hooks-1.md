A custom hook is a function whose name begins with use and that may call React hooks. Extract the board's task state and operations without changing their behavior.

```tsx
function useTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  // Define addTask, moveTask, updateTask, removeTask here.
  return { tasks, addTask, moveTask, updateTask, removeTask };
}
// App:
const { tasks, addTask, moveTask, updateTask, removeTask } = useTaskBoard();
```

This is a structural outline: reuse the complete operation bodies from your previous exercise. The returned API describes board actions, keeping array manipulation out of presentation components. Call the hook unconditionally at the top level, just like useState.

Leave input and edit drafts in the components that own them. Extracting a hook does not mean moving every state variable into one giant object.

**Try it:** compare the page before and after extraction. Every existing interaction should produce the same result.

**Apply it:** exercise 8, Extract useTaskBoard. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/reusing-logic-with-custom-hooks).
