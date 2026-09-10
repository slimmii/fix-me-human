Arrays let you describe repeated content as data. For a small library, each book has a stable ID, a name and a genre.

```tsx
type Genre = "fiction" | "history";

interface Book {
  id: number;
  name: string;
  genre: Genre;
}

const books: Book[] = [
  { id: 21, name: "The Glass Lake", genre: "fiction" },
  { id: 34, name: "A Short History", genre: "history" },
];
```

`filter` selects items; `map` transforms each selected item into something else. Neither changes the original array. Using the data above, this is a complete component:

```tsx
export default function App() {
  const fiction = books.filter((book) => book.genre === "fiction");

  return (
    <ul>
      {fiction.map((book) => (
        <li key={book.id}>{book.name}</li>
      ))}
    </ul>
  );
}
```

The filter callback returns true for items to keep. The map callback returns JSX for each item. Braces let the returned list appear inside JSX. An arrow with an expression returns it automatically; an arrow with a `{ ... }` body needs `return`.

For a reusable list, receive both the full array and the selection value through props. Filter inside that component. Several instances can then select different groups from the same data. If an item has its own component, pass the whole object as a prop and put the key on that component in the map.
