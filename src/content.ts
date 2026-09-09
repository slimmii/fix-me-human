export type Choice = { id: string; code: string; feedback: string };
export type Slot = { name: string; choices: Choice[]; answer: string };
export type Exercise = {
  id: string;
  title: string;
  prompt: string;
  source: string;
  slots: Slot[];
  hints: string[];
  topic: number;
  kind: "completion" | "repair" | "ordering";
  preview: string;
  variant: string;
  checks: string[];
  dataset?: string[];
};
export type Lesson = {
  title: string;
  assignment: string;
  explanation: string;
  reminder: string;
  example: string;
  prerequisites: number[];
  exercises: Exercise[];
};
const slot = (
  name: string,
  correct: string,
  wrong: string,
  why: string,
): Slot => ({
  name,
  answer: "correct",
  choices: [
    { id: "wrong", code: wrong, feedback: why },
    {
      id: "correct",
      code: correct,
      feedback: "This satisfies the React contract.",
    },
  ],
});
const ex = (
  topic: number,
  n: number,
  title: string,
  prompt: string,
  source: string,
  slots: Slot[],
  preview: string,
): Exercise => ({
  id: `${topic}-${n}`,
  variant: `${topic}-${n}`,
  topic,
  title,
  prompt,
  source,
  slots,
  preview,
  kind: n === 0 ? "completion" : "repair",
  checks: slots.map((s) => `Resolve ${s.name} correctly`),
  hints: [
    prompt,
    slots
      .map((s) => s.choices.find((c) => c.id === "wrong")!.feedback)
      .join(" "),
    slots
      .map(
        (s) => `${s.name}: ${s.choices.find((c) => c.id === s.answer)!.code}`,
      )
      .join("\n"),
  ],
});
const definitions: [string, string, string, string, string, Exercise[]][] = [
  [
    "TSX",
    "Repair the employee welcome page",
    "TSX combines markup with JavaScript expressions in braces. Use className for CSS classes. A fragment groups siblings without adding a DOM element. Conditional rendering chooses which UI to show.",
    "An expression produces a value. <>...</> is a fragment.",
    'function Welcome() {\n  const name = "Human";\n  return <h1 className="welcome">Hello, {name}</h1>;\n}',
    [
      ex(
        0,
        0,
        "A human-readable greeting",
        "Insert the employee name and the React CSS attribute.",
        'const name = "Human";\nexport function Welcome() {\n  return <h1 {{attribute}}="welcome">Hello, {{greeting}}</h1>;\n}',
        [
          slot(
            "attribute",
            "className",
            "class",
            "Use className in React TSX.",
          ),
          slot(
            "greeting",
            "{name}",
            "name",
            "Plain text prints name literally; braces evaluate the variable.",
          ),
        ],
        "welcome",
      ),
      ex(
        0,
        1,
        "Two things at once",
        "Group the heading and conditional badge without adding a wrapper element.",
        "const approved = true;\nexport function Welcome() {\n  return {{content}};\n}",
        [
          slot(
            "content",
            "<><h1>Welcome</h1>{approved && <span>Approved</span>}</>",
            "<h1>Welcome</h1><span>Approved</span>",
            "Adjacent TSX elements need a common parent, such as a fragment.",
          ),
        ],
        "welcome",
      ),
    ],
  ],
  [
    "Lists",
    "Display approved office supplies",
    "filter creates a subset; map transforms each item into UI. Give siblings stable keys from their data so React preserves the correct identity when items move.",
    "item => ... is an arrow function. A key is unique among siblings, not globally.",
    "supplies.filter(s => s.approved).map(s => <li key={s.id}>{s.name}</li>)",
    [
      ex(
        1,
        0,
        "Approved for existence",
        "Show only approved supplies, with stable keys.",
        'const supplies = [{ id: "mug", name: "Mug", approved: true },\n  { id: "laser", name: "Laser", approved: false }];\nexport function Supplies() {\n  return <ul>{supplies.{{filter}}.map(s => <li key={{key}}>{s.name}</li>)}</ul>;\n}',
        [
          slot(
            "filter",
            "filter(s => s.approved)",
            "filter(s => !s.approved)",
            "The negation selects rejected supplies.",
          ),
          slot(
            "key",
            "{s.id}",
            "{Math.random()}",
            "Random keys change each render and recreate item identity.",
          ),
        ],
        "supplies",
      ),
      ex(
        1,
        1,
        "Identity crisis",
        "Repair the list transformation.",
        'const supplies = [{id: "stapler", name: "Stapler"}];\nexport function Supplies() {\n return <ul>{supplies.{{render}}}</ul>;\n}',
        [
          slot(
            "render",
            "map(s => <li key={s.id}>{s.name}</li>)",
            "forEach(s => <li key={s.id}>{s.name}</li>)",
            "forEach returns undefined; map returns the array of elements React can render.",
          ),
        ],
        "supplies",
      ),
    ],
  ],
  [
    "Components",
    "Assemble reusable employee badges",
    "Function components return UI and start with a capital letter. Compose them with TSX so React manages each component. Keep component definitions at module scope.",
    "<Badge /> renders a component; lowercase tags refer to built-in elements.",
    "function Badge() { return <span>Human</span>; }\nfunction Staff() { return <section><Badge /><Badge /></section>; }",
    [
      ex(
        2,
        0,
        "Badge assembly",
        "Render the Badge component twice.",
        "function Badge() { return <span>Human</span>; }\nexport function Staff() { return <section>{{badges}}</section>; }",
        [
          slot(
            "badges",
            "<Badge /><Badge />",
            "<badge /><badge />",
            "Lowercase badge is treated as a DOM tag, not your function component.",
          ),
        ],
        "badges",
      ),
      ex(
        2,
        1,
        "Missing employee",
        "Make the function return its badge.",
        "export function Badge() {\n {{result}}\n}",
        [
          slot(
            "result",
            "return <span>Employee #42</span>;",
            "<span>Employee #42</span>;",
            "Without return the component produces undefined and shows no badge.",
          ),
        ],
        "badges",
      ),
    ],
  ],
  [
    "Props",
    "Personalize robot staff cards",
    "Props are read-only inputs from a parent. TypeScript describes their shape. Destructure props in a function parameter, then reuse the component with different values.",
    "type defines a compile-time shape; { name } extracts a property.",
    "type CardProps = { name: string };\nfunction Card({ name }: CardProps) { return <h2>{name}</h2>; }",
    [
      ex(
        3,
        0,
        "Know your supervisor",
        "Type the robot card and pass its name.",
        "type CardProps = {{type}};\nfunction Card({ name }: CardProps) { return <h2>{name}</h2>; }\nexport function Staff() { return <Card {{prop}} />; }",
        [
          slot(
            "type",
            "{ name: string }",
            "{ name: number }",
            "A robot name is text; its prop type must be string.",
          ),
          slot(
            "prop",
            'name="B.U.G."',
            'title="B.U.G."',
            "Card expects name, not title.",
          ),
        ],
        "badges",
      ),
      ex(
        3,
        1,
        "Read-only management",
        "Derive a label without mutating props.",
        "type Props = { name: string };\nexport function Card(props: Props) {\n {{label}}\n return <h2>{label}</h2>;\n}",
        [
          slot(
            "label",
            "const label = props.name.toUpperCase();",
            'const label = (props.name = "BOSS");',
            "Props are read-only inputs. Derive a new value instead of assigning to them.",
          ),
        ],
        "badges",
      ),
    ],
  ],
  [
    "Events",
    "Wire the complaint console",
    "Pass a function to an event handler so it runs on interaction. onChange exposes the current input value through event.currentTarget.value.",
    "() => send() creates a function; send() calls it immediately.",
    '<button onClick={() => console.log("Filed")}>Complain</button>',
    [
      ex(
        4,
        0,
        "Click to complain",
        "Submit only when the button is clicked.",
        'function submit() { alert("Complaint filed"); }\nexport function Console() { return <button onClick={{handler}}>Complain</button>; }',
        [
          slot(
            "handler",
            "{submit}",
            "{submit()}",
            "Calling submit during render causes an immediate side effect and supplies no handler.",
          ),
        ],
        "complaint",
      ),
      ex(
        4,
        1,
        "Listen to the human",
        "Read the text from the input event.",
        'export function Console() {\n return <input aria-label="Complaint" onChange={e => console.log({{value}})} />;\n}',
        [
          slot(
            "value",
            "e.currentTarget.value",
            "e.currentTarget",
            "currentTarget is the input element; its value property contains the text.",
          ),
        ],
        "complaint",
      ),
    ],
  ],
  [
    "State",
    "Build a coffee order queue",
    "useState stores values between renders and its setter schedules another render. Controlled inputs pair value with onChange. Use functional updates when deriving from previous state and create new arrays instead of mutating.",
    "[value, setter] destructures a pair. [...items, next] copies an array and appends next.",
    'const [orders, setOrders] = useState<string[]>([]);\nsetOrders(previous => [...previous, "Coffee"]);',
    [
      ex(
        5,
        0,
        "Coffee, reactively",
        "Keep the input controlled and append an order immutably.",
        'import { useState } from "react";\nexport function Queue() {\n const [text, setText] = useState("");\n const [orders, setOrders] = useState<string[]>([]);\n return <><input value={text} onChange={e => {{change}}} />\n <button onClick={() => {{append}}}>Order</button>\n <p>{orders.join(", ")}</p></>;\n}',
        [
          slot(
            "change",
            "setText(e.currentTarget.value)",
            "text = e.currentTarget.value",
            "A setter updates state; assigning a const fails and does not request a render.",
          ),
          slot(
            "append",
            "setOrders(prev => [...prev, text])",
            "orders.push(text)",
            "push mutates the existing array and does not ask React to render.",
          ),
        ],
        "queue",
      ),
      ex(
        5,
        1,
        "Double espresso",
        "Queue two increments using the latest pending value.",
        'import { useState } from "react";\nexport function Coffee() {\n const [count, setCount] = useState(0);\n return <button onClick={() => { {{updates}} }}>{count} coffees</button>;\n}',
        [
          slot(
            "updates",
            "setCount(c => c + 1); setCount(c => c + 1);",
            "setCount(count + 1); setCount(count + 1);",
            "Both direct updates read the same render snapshot and replace it with the same value.",
          ),
        ],
        "counter",
      ),
    ],
  ],
  [
    "Effects",
    "Repair an office status ticker",
    "Effects synchronize with external systems. Include every reactive value used by setup. Cleanup runs before setup with changed dependencies and on unmount. Strict Mode also checks setup → cleanup → setup once in development; this is not a production double-run guarantee. Derive filtered lists during render instead.",
    "[] means no reactive dependencies, not “guaranteed to run exactly once.”",
    "useEffect(() => {\n const id = setInterval(() => setTicks(t => t + 1), 1000);\n return () => clearInterval(id);\n}, []);",
    [
      ex(
        6,
        0,
        "Cancel the overtime",
        "Clean up the interval when the ticker unmounts.",
        'import { useEffect, useState } from "react";\nexport function Ticker() {\n const [ticks, setTicks] = useState(0);\n useEffect(() => {\n const id = setInterval(() => setTicks(t => t + 1), 1000);\n {{cleanup}}\n }, []);\n return <p>{ticks}</p>;\n}',
        [
          slot(
            "cleanup",
            "return () => clearInterval(id);",
            "return () => setInterval(() => {}, 1000);",
            "Cleanup must stop the original timer; creating another timer leaks work.",
          ),
        ],
        "ticker",
      ),
      ex(
        6,
        1,
        "Stay synchronized",
        "Update the document title when the room changes.",
        'import { useEffect } from "react";\nexport function Status({ room }: { room: string }) {\n useEffect(() => { document.title = room; }, {{deps}});\n return <p>{room}</p>;\n}',
        [
          slot(
            "deps",
            "[room]",
            "[]",
            "An empty dependency array leaves the title stale after room changes.",
          ),
        ],
        "ticker",
      ),
    ],
  ],
  [
    "Refs",
    "Focus the emergency input",
    "useRef holds a stable object whose current value persists between renders. Changing it does not trigger a render. A DOM ref becomes available after React commits the element. Use state for values shown on screen.",
    "?. calls a method only when the object is not null.",
    "const inputRef = useRef<HTMLInputElement>(null);\n<input ref={inputRef} />\n<button onClick={() => inputRef.current?.focus()}>Focus</button>",
    [
      ex(
        7,
        0,
        "Emergency focus",
        "Attach the DOM ref and focus the current element.",
        'import { useRef } from "react";\nexport function Emergency() {\n const inputRef = useRef<HTMLInputElement>(null);\n return <><input ref={inputRef} />\n <button onClick={() => {{focus}}}>Focus</button></>;\n}',
        [
          slot(
            "focus",
            "inputRef.current?.focus()",
            "inputRef.focus()",
            "The DOM element is in current. The ref object itself has no focus method.",
          ),
        ],
        "focus",
      ),
      ex(
        7,
        1,
        "Private click ledger",
        "Increment a persistent ref without claiming it rerenders.",
        'import { useRef } from "react";\nexport function Ledger() {\n const clicks = useRef(0);\n return <button onClick={() => { {{record}} }}>Record privately</button>;\n}',
        [
          slot(
            "record",
            "clicks.current += 1;",
            "clicks = clicks + 1;",
            "A ref is a stable object. Update its current property; use state if the UI must update.",
          ),
        ],
        "ledger",
      ),
    ],
  ],
  [
    "Custom hooks",
    "Reuse a machine-status controller",
    "Custom Hooks share stateful logic, not the state itself. Each call gets its own state. Name Hooks with use and call them unconditionally at the top level of components or other Hooks.",
    "Returning an object exposes selected values and actions to callers.",
    "function useMachine() {\n const [on, setOn] = useState(false);\n return { on, toggle: () => setOn(v => !v) };\n}",
    [
      ex(
        8,
        0,
        "Reusable machinery",
        "Return a functional toggle from the custom Hook.",
        'import { useState } from "react";\nfunction useMachine() {\n const [on, setOn] = useState(false);\n return { on, toggle: {{toggle}} };\n}\nexport function Machine() { const m = useMachine();\n return <button onClick={m.toggle}>{m.on ? "On" : "Off"}</button>; }',
        [
          slot(
            "toggle",
            "() => setOn(v => !v)",
            "() => !on",
            "Returning the opposite boolean does not update state; call the setter.",
          ),
        ],
        "machines",
      ),
      ex(
        8,
        1,
        "Independent departments",
        "Create independent hook instances for two machines.",
        'import { useState } from "react";\nfunction useMachine() { const [on, setOn] = useState(false);\n return { on, toggle: () => setOn(v => !v) }; }\nexport function Office() {\n const first = useMachine();\n const second = {{instance}};\n return <><button onClick={first.toggle}>{String(first.on)}</button>\n <button onClick={second.toggle}>{String(second.on)}</button></>;\n}',
        [
          slot(
            "instance",
            "useMachine()",
            "first",
            "Reusing first aliases the same state and action. A second Hook call creates independent state.",
          ),
        ],
        "machines",
      ),
    ],
  ],
  [
    "Communication",
    "Connect order forms to the queue",
    "Lift shared state to the closest common parent. Send values down as props and send changes up by calling callback props. Siblings stay synchronized through their parent.",
    "A type such as (text: string) => void describes a callback with no returned value.",
    'function Form({ onOrder }: { onOrder: (text: string) => void }) {\n return <button onClick={() => onOrder("Coffee")}>Order</button>;\n}',
    [
      ex(
        9,
        0,
        "Send it upstairs",
        "Call the parent callback when the order button is clicked.",
        "export function Form({ onOrder }: { onOrder: (text: string) => void }) {\n return <button onClick={() => {{notify}}}>Order</button>;\n}",
        [
          slot(
            "notify",
            'onOrder("Coffee")',
            "onOrder",
            "Referencing the callback does not invoke it. Call it with the new order.",
          ),
        ],
        "queue",
      ),
      ex(
        9,
        1,
        "One source of coffee",
        "Give the sibling components the same parent-owned state.",
        'import { useState } from "react";\nfunction Count({ value }: {value: number}) { return <p>{value}</p>; }\nexport function Office() {\n const [count, setCount] = useState(0);\n return <><button onClick={() => setCount(c => c + 1)}>Order</button>\n <Count value={{shared}} /><Count value={count} /></>;\n}',
        [
          slot(
            "shared",
            "{count}",
            "{0}",
            "A fixed zero disconnects this sibling from the parent state.",
          ),
        ],
        "counter",
      ),
    ],
  ],
  [
    "Context",
    "Distribute office preferences",
    "Context lets descendants read a value from the nearest matching provider. Keep changing preferences in state and pass them through the provider. The default is only used when no matching provider exists.",
    "useContext(Preferences) reads the nearest provider value above this component.",
    'const Preferences = createContext("mint");\n<Preferences.Provider value="amber"><Office /></Preferences.Provider>',
    [
      ex(
        10,
        0,
        "Office-wide memo",
        "Publish the selected theme through Context.",
        'import { createContext, useContext } from "react";\nconst Preferences = createContext("mint");\nfunction Office() { return <p>{useContext(Preferences)}</p>; }\nexport function App() {\n return <Preferences.Provider {{provide}}><Office /></Preferences.Provider>;\n}',
        [
          slot(
            "provide",
            'value="amber"',
            'theme="amber"',
            "The provider accepts value; theme does not publish a Context value.",
          ),
        ],
        "preferences",
      ),
      ex(
        10,
        1,
        "Read the room",
        "Read the nearest provider instead of hard-coding a default.",
        'import { createContext, useContext } from "react";\nconst Preferences = createContext("mint");\nexport function Office() {\n const theme = {{consume}};\n return <p>{theme}</p>;\n}',
        [
          slot(
            "consume",
            "useContext(Preferences)",
            '"mint"',
            "A hard-coded string cannot react to a provider value change.",
          ),
        ],
        "preferences",
      ),
    ],
  ],
];
export const lessons: Lesson[] = definitions.map(
  ([title, assignment, explanation, reminder, example, exercises], i) => ({
    title,
    assignment,
    explanation,
    reminder,
    example,
    exercises,
    prerequisites: i ? [i - 1] : [],
  }),
);
export const finale: Exercise[] = [
  ex(
    2,
    2,
    "01 / Component layout",
    "Compose the dashboard from reusable components.",
    "function Header() { return <h1>Office Survival</h1>; }\nfunction Requests() { return <section>Requests</section>; }\nexport function Dashboard() { return {{layout}}; }",
    [
      slot(
        "layout",
        "<><Header /><Requests /></>",
        "<header /><requests />",
        "Capitalized component names render your functions.",
      ),
    ],
    "dashboard",
  ),
  ex(
    1,
    2,
    "02 / Filtered requests",
    "Only display open requests with stable identity.",
    'const requests = [{id: "coffee", title: "Coffee", open: true},\n {id: "paper", title: "Paper", open: false}];\nexport function Requests() { return <ul>{requests.{{list}}}</ul>; }',
    [
      slot(
        "list",
        "filter(r => r.open).map(r => <li key={r.id}>{r.title}</li>)",
        "map(r => <li key={Math.random()}>{r.title}</li>)",
        "Filter out closed requests and use IDs for stable keys.",
      ),
    ],
    "dashboard",
  ),
  ex(
    5,
    2,
    "03 / Request management",
    "Lift request state and append immutably through a callback.",
    'import { useState } from "react";\nfunction Form({onAdd}: {onAdd: (s:string) => void}) {\n return <button onClick={() => onAdd("Coffee")}>Add</button>; }\nexport function Dashboard() {\n const [items, setItems] = useState<string[]>([]);\n return <><Form onAdd={text => {{add}}} /><p>{items.join(", ")}</p></>;\n}',
    [
      slot(
        "add",
        "setItems(prev => [...prev, text])",
        "items.push(text)",
        "Mutating the array bypasses React state updates.",
      ),
    ],
    "dashboard",
  ),
  ex(
    8,
    2,
    "04 / Machine control",
    "Complete the custom Hook cleanup and emergency focus.",
    'import { useEffect, useRef, useState } from "react";\nfunction useStatus() {\n const [ticks, setTicks] = useState(0);\n useEffect(() => { const id = setInterval(() => setTicks(t => t + 1), 1000);\n {{cleanup}}\n }, []); return ticks;\n}\nexport function Dashboard() { const ticks = useStatus();\n const input = useRef<HTMLInputElement>(null);\n return <><p>{ticks}</p><input ref={input} />\n <button onClick={() => {{focus}}}>Focus</button></>; }',
    [
      slot(
        "cleanup",
        "return () => clearInterval(id);",
        "return () => {};",
        "Stop the timer on cleanup to prevent a resource leak.",
      ),
      slot(
        "focus",
        "input.current?.focus()",
        "input.current?.blur()",
        "blur removes focus; focus moves the keyboard cursor into the emergency input.",
      ),
    ],
    "dashboard",
  ),
  ex(
    10,
    2,
    "05 / Shared preferences",
    "Publish parent-owned preferences to the dashboard.",
    'import { createContext, useContext, useState } from "react";\nconst Prefs = createContext("mint");\nfunction Office() { return <p>{useContext(Prefs)}</p>; }\nexport function Dashboard() { const [theme, setTheme] = useState("mint");\n return <Prefs.Provider value={{theme}}>\n <button onClick={() => setTheme("amber")}>Amber</button><Office />\n </Prefs.Provider>; }',
    [
      slot(
        "theme",
        "{theme}",
        '{"mint"}',
        "A constant provider value prevents descendants from receiving the new theme.",
      ),
    ],
    "dashboard",
  ),
];
export function validate(exercise: Exercise, answers: Record<string, string>) {
  return exercise.slots.map((s) => ({
    name: s.name,
    pass:
      answers[s.name] === s.answer ||
      (exercise.kind === "ordering" &&
        !!answers[s.name] &&
        s.choices.find((c) => c.id === answers[s.name])?.code ===
          s.choices.find((c) => c.id === s.answer)?.code),
    message: !answers[s.name]
      ? "Choose a snippet for this slot."
      : (s.choices.find((c) => c.id === answers[s.name])?.feedback ??
        "Unknown snippet."),
  }));
}
export function sourceFor(exercise: Exercise, answers: Record<string, string>) {
  return exercise.slots.reduce(
    (code, s) =>
      code.replaceAll(
        `{{${s.name}}}`,
        s.choices.find((c) => c.id === answers[s.name])?.code ??
          `/* ${s.name.toUpperCase()} */`,
      ),
    exercise.source,
  );
}
export function generate(
  seed: number,
  topic: number | "mixed",
  difficulty: number,
  previousFamily = -1,
): Exercise {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const t = topic === "mixed" ? Math.floor(random() * lessons.length) : topic;
  let family = Math.floor(random() * 3);
  if (family === previousFamily) family = (family + 1) % 3;
  const base = structuredClone(lessons[t].exercises[family === 1 ? 1 : 0]);
  const names = ["Tea", "Espresso", "Stapler", "Paper", "Decaf", "Toner"];
  const data = Array.from(
    { length: 2 + difficulty },
    () => names[Math.floor(random() * names.length)],
  );
  base.id = `endless-${seed}-${t}-${family}-${difficulty}`;
  base.dataset = data;
  base.title = `${lessons[t].title}: shift #${seed}`;
  base.kind = (["completion", "repair", "ordering"] as const)[family];
  base.source = base.source
    .replaceAll("Coffee", data[0])
    .replaceAll("Human", `Employee ${(seed % 900) + 100}`)
    .replaceAll("B.U.G.", `B.U.G. ${seed % 99}`);
  for (const s of base.slots)
    for (const c of s.choices) c.code = c.code.replaceAll("Coffee", data[0]);
  if (family === 2) {
    const lines = sourceFor(
      base,
      Object.fromEntries(base.slots.map((s) => [s.name, s.answer])),
    )
      .split("\n")
      .filter(Boolean);
    base.source = lines.map((_, i) => `{{line${i}}}`).join("\n");
    base.slots = lines.map((_line, i) => ({
      name: `line${i}`,
      answer: `part${i}`,
      choices: lines
        .map((code, j) => ({
          id: `part${j}`,
          code,
          feedback:
            i === j
              ? "Correct placement."
              : "Follow declaration scope and the original component structure.",
        }))
        .sort(() => 0),
    }));
    base.prompt =
      "Rebuild the component from scratch. Type the imports, declarations, and returned UI. B.U.G. can remind you of the working pattern.";
    base.hints = [
      "Imports precede declarations; a component returns its UI.",
      "Use the worked example as a structural guide.",
      lines.join("\n"),
    ];
  } else {
    base.prompt = `${base.prompt} Dataset: ${data.join(", ")}.`;
    if (difficulty === 3)
      for (const s of base.slots)
        s.choices.push({
          id: "missing",
          code: "undefined",
          feedback:
            "undefined does not fulfill this slot’s required value or behavior.",
        });
    base.hints = [
      base.prompt,
      ...base.slots.map(
        (s) => s.choices.find((c) => c.id !== s.answer)!.feedback,
      ),
      base.slots
        .map((s) => s.choices.find((c) => c.id === s.answer)!.code)
        .join("\n"),
    ];
  }
  if (difficulty === 1 && family !== 2 && base.slots.length > 1) {
    const retained = base.slots[0];
    for (const s of base.slots.slice(1))
      base.source = base.source.replaceAll(
        `{{${s.name}}}`,
        s.choices.find((c) => c.id === s.answer)!.code,
      );
    base.slots = [retained];
  }
  base.slots.forEach((s) => {
    for (let i = s.choices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [s.choices[i], s.choices[j]] = [s.choices[j], s.choices[i]];
    }
  });
  base.checks = base.slots.map((s) => `Resolve ${s.name}`);
  return base;
}
