A total and a visible count answer different questions. If a library has 8 books and a search matches 2, its inventory is still 8 books. Decide which number the interface promises to show.

Using `books` and `matches` from the previous page, this excerpt belongs inside the component's return:

```tsx
<section>
  <p>{books.length} books in the library</p>
  {matches.length === 0 ? (
    <p>No books found.</p>
  ) : (
    <ul>
      {matches.map((book) => (
        <li key={book.id}>{book.name}</li>
      ))}
    </ul>
  )}
</section>
```

`.length` counts array entries. The ternary renders an empty message when there are no matches, and a list otherwise. With grouped data, calculate the group's total before applying the search filter and render items from the filtered result.

For a message without an alternative, use `matches.length === 0 && <p>No books found.</p>`. Avoid using a number directly as the left side of `&&`: `matches.length && ...` can display a stray 0.

Calculate counts from the saved data on each render. Separate counters can drift out of sync when one handler forgets to update them. Clearing search should reveal the same saved items, including any changes made while searching. Use the exact count format and empty message requested by the brief.
