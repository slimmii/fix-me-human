Callbacks can carry the identity of an item and the requested change. A lighting panel could use this data and callback type:

```tsx
interface Lamp {
  id: number;
  on: boolean;
}

interface LampControlProps {
  lamp: Lamp;
  onSwitch: (id: number, on: boolean) => void;
}
```

The parent owns `lamps` in state. This handler excerpt changes only the requested lamp:

```tsx
function switchLamp(id: number, on: boolean) {
  setLamps((current) =>
    current.map((lamp) => (lamp.id === id ? { ...lamp, on: on } : lamp)),
  );
}
```

`map` creates a new array. The ternary `condition ? a : b` chooses a replacement for the matching ID and the original object for every other lamp. Object spread copies the fields before replacing `on`. The shorthand `{ ...lamp, on }` means the same thing. Do not assign to `lamp.on` directly.

In a child receiving `lamp` and `onSwitch`, this JSX excerpt shows an action only when it applies:

<!-- prettier-ignore -->
```tsx
{lamp.on && (
  <button onClick={() => onSwitch(lamp.id, false)}>
    Turn off
  </button>
)}
```

`condition && JSX` displays the JSX when the condition is true. A second condition can display a different action for a different value. Wrap callback calls with arguments in an arrow function so they run on the click.

The parent passes `onSwitch={switchLamp}`. After the update, any lists filtered from the shared data recalculate automatically; there is no need to keep separate copies in sync.
