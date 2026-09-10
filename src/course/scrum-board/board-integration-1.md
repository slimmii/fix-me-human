Layout is CSS's job. React's `style` prop accepts an object: the outer braces enter JavaScript, and the inner braces hold CSS properties. Use camelCase names such as `flexWrap`; numeric lengths such as `gap: 12` mean pixels.

This complete example lets two recipe panels share a row when space permits and wrap when it does not:

```tsx
export default function App() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <section style={{ flex: "1 1 220px", minWidth: 0 }}>
        <h2>Ingredients</h2>
        <p style={{ overflowWrap: "anywhere" }}>Flour, water, salt.</p>
      </section>
      <section style={{ flex: "1 1 220px", minWidth: 0 }}>
        <h2>Method</h2>
        <p>Mix, rest, then bake.</p>
      </section>
    </div>
  );
}
```

`display: "flex"` arranges children in a row. `flexWrap: "wrap"` allows additional rows. `flex: "1 1 220px"` lets a panel grow and shrink from a preferred width of 220px. `gap` leaves space between panels.

Choose widths for the content and required number of panels. Include gaps, padding and borders in the available space. A large fixed width can cause overflow; `minWidth: 0` lets a flex child shrink, and `overflowWrap: "anywhere"` lets long text break.

Check the required wide layout and a narrow preview. Keep labels visible, controls reachable and focus indicators intact. Use native buttons so keyboard activation works without custom handlers. In this editor, inline styles let you adjust layout without a separate CSS file.
