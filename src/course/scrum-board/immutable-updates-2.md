Treat arrays and their objects in state as read-only. To replace one item, create a new array and a new object for that item. To remove one, create an array without it.

These excerpts belong inside a component with `useState` imported:

```tsx
interface Plant {
  id: number;
  name: string;
  watered: boolean;
}

const [plants, setPlants] = useState<Plant[]>([
  { id: 7, name: "Fern", watered: false },
  { id: 12, name: "Fern", watered: false },
]);

function markWatered(id: number) {
  setPlants((current) =>
    current.map((plant) =>
      plant.id === id ? { ...plant, watered: true } : plant,
    ),
  );
}

function removePlant(id: number) {
  setPlants((current) => current.filter((plant) => plant.id !== id));
}
```

`map` keeps one entry for each original entry, replacing only the match. Object spread preserves `id` and `name` while changing `watered`. `filter` keeps only entries whose IDs differ from the requested ID.

The two plants have the same name but different IDs. Removing ID 7 leaves ID 12 intact. Matching by display text could change or remove both accidentally.

Copying the array alone is insufficient if you then change an existing object inside it. Avoid assignments to an item's fields, `push`, and `splice` on state. Keep additions and other callbacks using the same shared state owner. An empty array is a normal result of removing the last item and must still allow future additions.
