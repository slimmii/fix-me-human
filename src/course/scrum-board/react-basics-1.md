A React component is a function that describes part of a page. It returns JSX: markup written inside JavaScript. A `.tsx` file combines JSX with TypeScript.

```tsx
export default function App() {
  const place : string = "Corner café";

  return (
    <section>
      <h1>{place}</h1>
      <p>Fresh coffee from {8 + 1} in the morning.</p>
    </section>
  );
}
```

`App` starts with a capital letter because it is a component (this is mandatory). Lowercase names such as `section` and `p` are built-in HTML elements. `export` makes `App` available to code in other files. `default` marks it as this file's main export. 

Every component must return JSX. JSX is a syntax extension that looks like HTML.

You can write it on the same line as `return`:

```tsx
return <section><h1>Hello</h1><p>World</p></section>; // ✅
```

You can also write it on the next line, but the opening parenthesis must be on the same line as `return`:

```tsx
return (
  <section>
    <h1>Hello</h1>
    <p>World</p>
  </section>
); // ✅
```

So the following is invalid because the opening parenthesis is on the next line:

```tsx
return
(
  <section>
    <h1>Hello</h1>
    <p>World</p>
  </section>
); // ❌
```

You probably noticed that the JSX in the first example has a single parent element, `<section>`. JSX must have one parent element. The following is invalid because it has two top-level elements:

```tsx
return (
  <h1>Hello</h1>
  <p>World</p>
); // ❌
```

If you want to avoid adding an extra HTML element, you can use a fragment to group siblings. A fragment is written as `<>...</>`.

```tsx
return (
  <>
    <h1>Hello</h1>
    <p>World</p>
  </>); // ✅
```

Next to the html-like tags, you can write JavaScript expressions inside braces `{}`. The expression is evaluated and the result is inserted into the JSX. For example, `{place}` displays the string and `{8 + 1}` displays 9. Text outside braces stays literal. You can even call functions and use variables inside braces. For example, `{place.toUpperCase()}` displays `CORNER CAFÉ`.

```tsx
export default function App() {
  const place : string = "Corner café";

  return (
    <section>
      <h1>{place.toUpperCase()}</h1>
      <p>Fresh coffee from {8 + 1} in the morning.</p>
    </section>
  );
}
```
