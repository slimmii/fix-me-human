An effect synchronizes a component with a system outside its rendered JSX. The document title is an example: it belongs to the preview document rather than a returned element.

```tsx
const done = tasks.filter((task) => task.status === "DONE").length;
useEffect(() => {
  document.title = `Sprint board — ${done} done`;
}, [done]);
```

Compute done during render. The effect runs after a commit and again when its dependency changes. Include every reactive value read by an effect; here that value is done. An empty dependency array would leave a stale count after moving cards.

Call useEffect at the top level. Do not set task state in this effect just to recalculate a count. Do not assign document.title during render, which should stay a pure calculation of UI.

This sandbox permits document.title. It does not permit localStorage or network requests. The embedded document's title changes; the outer office tab does not.

**Try it:** finish Build board, then reopen Ship demo. The title should follow the DONE total; typing a search query should not change it.

**Apply it:** exercise 11, Synchronize with an effect. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/synchronizing-with-effects).
