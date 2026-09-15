### Expressions

Next to the html-like tags, you can write JavaScript expressions inside braces `{}`. If you want to display a variable, you can put it inside braces. The expression is evaluated and the result is inserted into the JSX. In the example below, `{place}` displays the string and `{8 + 1}` displays 9. 

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

You can also call functions (built-in or custom) inside braces. The function is called and the return value is inserted into the JSX.

```tsx
function add(x: number, y: number): number {
  return x + y;
}

export default function App() {
  const place : string = "Corner café";

  return (
    <section>
      <h1>{place.toUpperCase()}</h1>
      <p>Fresh coffee from {add(8, 1)} in the morning.</p>
    </section>
  );
}
```

One important rule is that you cannot use statements inside braces. Statements are instructions that perform an action, such as `if`, `for`, and `while`. Expressions are values that can be evaluated, such as numbers, strings, and function calls. You can use the ternary operator `? :` to conditionally display content.

```tsx
export default function App() {
  const place : string = "Corner café";
  const isOpen : boolean = true;

  return (
    <section>
      <h1>{place}</h1>
      <p>Fresh coffee from {add(8, 1)} in the morning.</p>
      <p>{place} {isOpen ? "Open" : "Closed"}</p>
    </section>
  );
}
```

You can also use the logical AND operator `&&` to conditionally display content. If the left side is true, the right side is displayed. If the left side is false, nothing is displayed.

```tsx
export default function App() {
  const place : string = "Corner café"; 
  const isOpen : boolean = true;

  return (
    <section>
      <h1>{place}</h1>
      <p>Fresh coffee from {add(8, 1)} in the morning.</p>
      <p>{place} {isOpen && "Open"}</p>
    </section>
  );
}
```

if you really want to use statements, you can move them outside of the JSX and use variables to store the results. For example, you can use an `if` statement to determine the status of the café and store it in a variable.

```tsx
export default function App() {
  const place : string = "Corner café";
  const isOpen : boolean = true;
  let status : string;

  if (isOpen) {
    status = "Open";
  } else {
    status = "Closed";
  }

  return (
    <section>
      <h1>{place}</h1>
      <p>Fresh coffee from {add(8, 1)} in the morning.</p>
      <p>{place} {status}</p>
    </section>
  );
}
```

You can also use early returns to avoid nested `if` statements. For example, you can return early if the café is closed.

```tsx
export default function App() {
  const place : string = "Corner café";
  const isOpen : boolean = true;  

  if (!isOpen) {
    return (
      <section>
        <h1>{place}</h1>
        <p>Sorry, we are closed.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>{place}</h1>
      <p>Fresh coffee from {add(8, 1)} in the morning.</p>
      <p>{place} Open</p>
    </section>
  );
}
```
