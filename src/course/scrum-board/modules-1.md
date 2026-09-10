# One project, several files

A module is a file with imports or exports. It gives related code its own home and controls which definitions other files can use. A variable or component in one module is not automatically available in another.

Imagine a small café menu. It displays drinks, with a name and price for each one. Give each file a clear responsibility:

- **`menu.ts`** describes a drink and exports the menu data.
- **`DrinkItem.tsx`** renders the name and price of one drink.
- **`App.tsx`** imports the data and component, then assembles the menu.

This makes changes easier to locate. Add a drink in `menu.ts`, change how each drink looks in `DrinkItem.tsx`, or change the page heading in `App.tsx`.

## Choose a file type

Use **`.tsx`** when a file contains JSX, such as `<p>Tea</p>`. Use **`.ts`** for TypeScript types, data, or logic without JSX. Both can export definitions and import from other modules.

## Work with files in the editor

Once file controls are unlocked, use **File > New file** (Ctrl+N) and enter a name. If you leave off the extension, the editor adds `.tsx`, so include `.ts` when creating `menu.ts`.

Use **File > Open** (Ctrl+O) to choose a file with the arrow keys and Enter. Escape cancels the dialog. Opening another file keeps your work; only one file appears in the editor at a time. Each file keeps its own undo history while you work in the project.

Everything saves automatically in this browser. **F5 always runs App.tsx and its imported modules**, even when `DrinkItem.tsx` is open. Creating a file does not automatically connect it: add an import where it is used.

## Split code without changing its behavior

When extracting a component, move its definition into the new file, export it, and import it where the original definition was used. Remove the old definition so there is only one version to maintain. Keep the exported `App` in `App.tsx` as the starting point.

Files organize code; props still carry data between components. In the café example, `App` passes a drink to `DrinkItem` exactly as it would if both components lived in one file. The next page connects all three files.
