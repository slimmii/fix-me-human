Custom hooks share logic. Each call still gets its own state.

This excerpt belongs at the top of a component using `useCounter` from the previous page:

```tsx
const entrance = useCounter();
const balcony = useCounter();
```

Calling `entrance.increment()` changes the entrance count. It does not change the balcony count. Moving the hook into the same file, or giving both calls the same name, does not make them share a value.

When several components must show one count, call the hook once in their shared parent. Pass its returned value and actions to those components. This is the same state ownership rule used before extraction. The next topic shows how context can carry that one result through a larger tree.

Choose action names that explain what callers can do. `increment()` is easier to use correctly than asking every component to calculate a new count. For a collection, the hook can own its array and several operations, each receiving only the data needed for that change.

Keep validation with the operation that changes saved data, even when the input also validates. Leave temporary editing state near its controls. After extraction, walk through the existing interactions and check that they still affect the same shared data.
