Store values that can change independently. Calculate values you can work out from that state during render.

A library search needs the book collection and the user's query. The matching books are a calculation, not another state variable. This excerpt belongs inside a component with `useState` imported and the `books` array from Lists and identity available:

```tsx
const [query, setQuery] = useState("");
const normalizedQuery = query.trim().toLowerCase();
const matches = books.filter((book) =>
  book.name.toLowerCase().includes(normalizedQuery),
);
```

Connect a controlled search input using `value={query}` and an `onChange` handler that calls `setQuery(event.target.value)`. Give it a visible label and an accessible name.

`trim()` removes spaces at the edges of the query. Lowercasing both strings makes matching case-insensitive. `includes` checks for a substring. An empty query matches every name, so clearing the input restores the whole list.

For a grouped view, first filter the collection to the current group, then search within that group. Work from the saved collection each render. Searching should never delete items from it.

When the collection changes through an edit, addition or deletion, the next render recalculates the matches. Storing the result in another state variable would create a second value to keep synchronized. A simple filter needs neither an effect nor a memoization hook to work correctly.
