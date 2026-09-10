# Connect modules with imports

An **export** makes a definition available to other files. An **import** brings it into the current file. Here is the café menu as three connected files.

## Export the type and data

In `menu.ts`, export a type describing one drink and an array containing the menu:

```ts
export interface Drink {
  id: number;
  name: string;
  price: number;
}

export const drinks: Drink[] = [
  { id: 1, name: "Tea", price: 3 },
  { id: 2, name: "Coffee", price: 4 },
];
```

`Drink` describes the shape of the data. `drinks` is the actual array the running program will use.

## Export a component

In `DrinkItem.tsx`, import the type and use it to describe the component's prop:

```tsx
import type { Drink } from "./menu";

interface DrinkItemProps {
  drink: Drink;
}

export function DrinkItem({ drink }: DrinkItemProps) {
  return (
    <li>
      <p>
        {drink.name}: €{drink.price}
      </p>
    </li>
  );
}
```

`import type` imports only a TypeScript description; it creates no runtime value. `DrinkItemProps` is used only inside this file, so it does not need an export.

## Assemble the menu

In `App.tsx`, import the array and the component:

```tsx
import { drinks } from "./menu";
import { DrinkItem } from "./DrinkItem";

export default function App() {
  return (
    <section>
      <h1>Café menu</h1>
      <ul>
        {drinks.map((drink) => (
          <DrinkItem key={drink.id} drink={drink} />
        ))}
      </ul>
    </section>
  );
}
```

These imports bring in runtime values: an array to loop over and a component to render. `App` passes each drink through a prop. `DrinkItem` does not need to know about the full menu or import `App`.

## Match the export style

- **Named exports use braces.** `export function DrinkItem` pairs with `import { DrinkItem } from "./DrinkItem"`. A file can have several named exports, as `menu.ts` does.
- **Default exports use no braces.** If you change the component to `export default function DrinkItem`, change its import to `import DrinkItem from "./DrinkItem"`. A file can have only one default export.

Each file imports what it uses. Importing a definition in `App.tsx` does not make it available inside `DrinkItem.tsx`. The same rule applies to React hooks: a file using `useState` needs its own `import { useState } from "react"`.

## Check the connection

The `./` in `"./menu"` means a path relative to the importing file. Here, all three files are alongside each other, and the editor lets you omit the extension.

If an import fails, check these details:

- **Filename:** `"./DrinkItem"` must match `DrinkItem.tsx`, including capitalization.
- **Export:** the definition must be exported from the file you are importing.
- **Braces:** a named import needs braces; a default import does not.
- **Type or value:** use `import type` for interfaces and type aliases, and a regular import for components, arrays, and functions used at runtime.

This editor supports local project files and React imports. Other packages and dynamic imports are outside its toolbox.
