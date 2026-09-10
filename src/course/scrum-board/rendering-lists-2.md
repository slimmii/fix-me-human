A key tells React which item is which when a list changes. Use an ID stored in the data. Names can repeat, positions shift when an item is removed, and a random key generated during render changes every time.

The key belongs on the element directly returned by `map`. React uses it internally; a child cannot read it as a normal prop. Pass the item's data separately.

Use HTML elements that describe the content. This excerpt belongs inside a component's return and uses the books from the previous page:

```tsx
<section aria-label="Library">
  <h2>Library</h2>
  <ul>
    {books.map((book) => (
      <li key={book.id} data-book-id={book.id}>
        <p>{book.name}</p>
      </li>
    ))}
  </ul>
</section>
```

A `ul` contains `li` list items. An `h2` names a section visually; `aria-label` supplies its accessible name. With a variable, use `aria-label={name}`. Keep `aria-*` and `data-*` attribute names hyphenated in JSX.

A `data-*` attribute exposes a value on the HTML element so tools can find it. It has a different purpose from React's key. The assignment brief specifies the attributes its checks use.

Keys identify siblings within one list. Removing an item, or moving it into a different list, removes that component's local state too. Data that must survive belongs in a shared parent.
