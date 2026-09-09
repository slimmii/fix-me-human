import type { Lesson } from "../types";

export const officeWelcome: Lesson = {
  id: "office-welcome",
  title: "A personal welcome",
  assignments: [
    {
      id: "welcome-human",
      title: "Welcome, Human",
      brief: "office-tasks/welcome.md",
      hints: [
        "Return a visible h1 with exactly Welcome, Human. JavaScript values can go inside JSX braces.",
        "Try const name = 'Human'; and return <h1>Welcome, {name}</h1> from your exported component.",
        "One working solution: export default function App() { const name = 'Human'; return <h1>Welcome, {name}</h1>; }",
      ],
      solution:
        "export default function App() {\n  const name = 'Human';\n  return <h1>Welcome, {name}</h1>;\n}",
      validation: {
        source: [
          {
            type: "exported-component",
            label: "Export a capitalized function component",
          },
        ],
        runtime: [
          {
            type: "visible-heading",
            text: "Welcome, Human",
            label: "Display Welcome, Human in a visible h1 heading",
          },
        ],
      },
    },
  ],
};

export const officeStatus: Lesson = {
  id: "office-status",
  title: "The office status board",
  assignments: [
    {
      id: "status-board",
      title: "Office status board",
      brief: "office-tasks/status.md",
      hints: [
        "Your app needs a visible h1 containing exactly Office status: ready. Try a separate Status component to practice props.",
        "A Status component can receive { status }: { status: string } and return <h1>Office status: {status}</h1>.",
        "One working solution: function Status({ status }: { status: string }) { return <h1>Office status: {status}</h1>; } export default function App() { return <Status status='ready' />; }",
      ],
      solution:
        "function Status({ status }: { status: string }) {\n  return <h1>Office status: {status}</h1>;\n}\n\nexport default function App() {\n  return <Status status='ready' />;\n}",
      validation: {
        source: [
          {
            type: "exported-component",
            label: "Export a capitalized function component",
          },
        ],
        runtime: [
          {
            type: "visible-heading",
            text: "Office status: ready",
            label: "Display Office status: ready in a visible h1 heading",
          },
        ],
      },
    },
  ],
};
