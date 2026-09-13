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

Keep the query in the component that renders the search input and the grouped lists. Pass it to each list as a prop, just as you pass the collection and group name. Add `query: string` to the child's props interface and destructure it in the child. The child can then derive its matches from the current props; it does not need its own query state.

Adding a book updates the saved collection, so the next render recalculates the matches. A matching book appears immediately; a nonmatching book stays hidden until the search changes. Keep the query unchanged when adding an item. Search is a view of the saved data, not a replacement for it.

Storing the filtered result in another state variable would create a second value to keep synchronized. Calculate it directly during render. The same approach will keep search accurate when you later add ways to edit, move or delete items.
