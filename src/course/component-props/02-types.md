In TSX, describe the inputs your component expects with a TypeScript type. This makes the component's contract explicit.

```tsx
type StatusProps = {
  status: string;
};

function Status({ status }: StatusProps) {
  return <h1>Status: {status}</h1>;
}

export default function App() {
  return <Status status="available" />;
}
```

`{ status }` takes the `status` value out of the props object. `: StatusProps` describes the expected shape of that object. Type annotations help tools and readers understand your code; they are not text displayed on the page.

Use quotes for a literal string prop. Use braces to pass a JavaScript expression:

```tsx
export default function App() {
  const currentStatus = "available";
  return <Status status={currentStatus} />;
}
```

Treat props as read-only inputs. The parent chooses what to pass; the child uses those inputs to calculate its output.

Keep the exported `App` component as the entry point for your program. Your smaller components can stay in the same file without being exported.
