Use an `interface` to describe object shapes and component props. Each property has a name and a type. An object prop lets a component receive related values together.

<!-- prettier-ignore -->
```tsx
interface Reading {
  city: string;
  degrees: number;
}

interface TemperatureProps {
  reading: Reading;
}

function Temperature({ reading }: TemperatureProps) {
  return (
    <p>{reading.city}: {reading.degrees} degrees</p>
  );
}
```

This JSX belongs inside a parent's return:

```tsx
<Temperature reading={{ city: "Brussels", degrees: 18 }} />
```

The outer braces enter JavaScript; the inner braces create an object. You can also create the object in a variable and pass `reading={weather}`. Dot notation, such as `reading.city`, reads an object's property.

A union lists the values a field may hold:

```tsx
type Unit = "celsius" | "fahrenheit";
```

`Unit` allows either of those strings. It does not allow a misspelled alternative. Use a named union for a fixed set of choices and an interface for the object containing those choices. `Reading[]` means an array of Reading objects.

Types describe the data; they do not create it or validate text someone types at runtime. Keep props focused on the values the component actually needs.
