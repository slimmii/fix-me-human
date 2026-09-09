import type { Lesson } from "../types";
export const helloReact: Lesson = {
  id: "hello-react",
  title: "Your first React component",
  assignments: [
    {
      id: "hello-bug",
      title: "Hello B.U.G.",
      brief: "hello-react/assignment.md",
      hints: [
        "Create a component with a capitalized name. Return an h1 heading containing exactly Hello B.U.G.",
        "Use export default function App() { ... }. Inside the function, return your heading. Remember the closing </h1> tag.",
        "One working solution: export default function App() { return <h1>Hello B.U.G.</h1>; }",
      ],
      solution:
        "export default function App() {\n  return <h1>Hello B.U.G.</h1>;\n}",
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
            text: "Hello B.U.G.",
            label: "Display Hello B.U.G. in a visible h1 heading",
          },
        ],
      },
    },
  ],
};
