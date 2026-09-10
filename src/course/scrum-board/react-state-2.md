Each render sees a snapshot of state. Calling a setter schedules the next render; it does not change the value already held by the current handler. When the next value depends on the previous one, use a functional setter: `setCups(current => current + 1)`.

State can hold arrays too. This excerpt belongs at the top of a component with `useState` imported:

```tsx
const [guests, setGuests] = useState<string[]>(["Mina"]);

function invite(name: string) {
  setGuests((current) => [...current, name]);
}
```

`string[]` describes an array of strings. For objects, use the corresponding interface, for example `useState<Book[]>(initialBooks)`. The spread `...current` copies existing entries into a new array before adding the new one. Avoid `push` or changing the original array: React state is read-only.

An updater receives the pending state, including earlier queued updates. Return the next state from it. Keep it pure: do not change external counters or perform side effects inside the updater.

When adding objects, give each new item an ID that differs from all current IDs. For a small numeric collection, one approach is to find the largest existing ID and add one. `map` can extract the IDs; `Math.max(0, ...ids)` spreads those numbers into arguments and finds the largest, using 0 for an empty collection. Choose an ID when creating an item and keep it unchanged during edits. Display text is not an identity, so duplicate names can still represent separate items.
