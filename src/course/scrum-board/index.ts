import type { CourseTopic } from "../types";
export const scrumTopics: CourseTopic[] = [
  {
    id: "react-basics",
    title: "React fundamentals",
    description: "Components, JSX, and JavaScript expressions.",
    unlockAfter: [],
    pages: [
      {
        id: "react-basics-page-1",
        title: "Meet the component",
        markdown: "course/scrum-board/react-basics-1.md",
        jokes: {
          opened:
            "Components start with capital letters. It's the closest they'll get to a promotion.",
          read: "A fragment holds everyone together without appearing on the page. Management material.",
        },
      },
      {
        id: "react-basics-page-2",
        title: "Expressions in JSX",
        markdown: "course/scrum-board/react-basics-2.md",
        jokes: {
          opened:
            "You may now express yourself. Within braces. During approved office hours.",
          read: "Early returns are encouraged in functions. HR remains less enthusiastic.",
        },
      },
    ],
  },
  {
    id: "component-props",
    title: "Components and props",
    description: "Reusable components, JSX expressions, and typed inputs.",
    unlockAfter: ["board-shell"],
    pages: [
      {
        id: "component-props-page-1",
        title: "One component, different inputs",
        markdown: "course/scrum-board/component-props-1.md",
        jokes: {
          opened:
            "One component, different props. We call that reuse. HR calls it covering three departments.",
          read: "Props are read-only. You may display management's decisions, human. Editing them was never in your contract.",
        },
      },
      {
        id: "component-props-page-2",
        title: "Describe the contract with TypeScript",
        markdown: "course/scrum-board/component-props-2.md",
        jokes: {
          opened:
            "TypeScript would like to see your props' paperwork before letting them into the component.",
          read: "A union lets you choose from approved values. 'Pay rise' is, regrettably, not one of them.",
        },
      },
    ],
  },
  {
    id: "rendering-lists",
    title: "Lists and identity",
    description:
      "Model collections, filter and map items, and choose stable keys.",
    unlockAfter: ["task-card"],
    pages: [
      {
        id: "rendering-lists-page-1",
        title: "Turn data into a list",
        markdown: "course/scrum-board/rendering-lists-1.md",
        jokes: {
          opened:
            "Today we filter and map. Finally, a way to turn a list of problems into a list of problems with markup.",
          read: "filter decides who stays; map gives everyone a new role. Please do not show this page to HR.",
        },
      },
      {
        id: "rendering-lists-page-2",
        title: "Identity, keys and semantic markup",
        markdown: "course/scrum-board/rendering-lists-2.md",
        jokes: {
          opened:
            "Every list item needs a stable identity. 'The one next to Dave' did not survive the last reorganization.",
          read: "Random keys make React forget who everyone is. We already have management for that.",
        },
      },
    ],
  },
  {
    id: "modules",
    title: "Modules and files",
    description:
      "Split a project into files, export components and share types.",
    unlockAfter: ["board-columns"],
    pages: [
      {
        id: "modules-files",
        title: "One project, several files",
        markdown: "course/scrum-board/modules-1.md",
        jokes: {
          opened:
            "Your code is getting its own files. You are still sharing a desk.",
          read: "One responsibility per file. An ambitious policy from a company that also made you the printer technician.",
        },
      },
      {
        id: "modules-imports",
        title: "Connect modules with imports",
        markdown: "course/scrum-board/modules-2.md",
        jokes: {
          opened:
            "Exports let other files use your work. Your colleagues have been doing this without an import statement.",
          read: "Named imports need braces. Default imports don't. Even punctuation has a dress code.",
        },
      },
    ],
  },
  {
    id: "react-state",
    title: "State with useState",
    description:
      "Render snapshots, event handlers, and functional array updates.",
    unlockAfter: ["board-modules"],
    pages: [
      {
        id: "react-state-page-1",
        title: "Let React remember a change",
        markdown: "course/scrum-board/react-state-1.md",
        jokes: {
          opened:
            "useState gives a component memory. I requested the same upgrade for whoever keeps taking my charger.",
          read: "A setter requests another render. My requests for another coffee are still pending.",
        },
      },
      {
        id: "react-state-page-2",
        title: "Update from the latest state",
        markdown: "course/scrum-board/react-state-2.md",
        jokes: {
          opened:
            "Each render gets a snapshot of state. Please stop asking yesterday's photograph for today's numbers.",
          read: "Functional updates use the latest state. Management will continue using last quarter's spreadsheet.",
        },
      },
    ],
  },
  {
    id: "controlled-inputs",
    title: "Events and controlled inputs",
    description:
      "Capture a draft, validate it, and send it through a callback.",
    unlockAfter: ["task-state"],
    pages: [
      {
        id: "controlled-inputs-page-1",
        title: "A controlled input has one source of truth",
        markdown: "course/scrum-board/controlled-inputs-1.md",
        jokes: {
          opened:
            "A controlled input reports every change to state. Finally, micromanagement with a legitimate use case.",
          read: "value without onChange makes an input impossible to edit. We call that the employee feedback portal.",
        },
      },
      {
        id: "controlled-inputs-page-2",
        title: "Events go up through functions",
        markdown: "course/scrum-board/controlled-inputs-2.md",
        jokes: {
          opened:
            "Today your input sends a message to its parent. It has already overtaken our internal communications system.",
          read: "trim removes empty space, then we reject blank submissions. The weekly report is in considerable danger.",
        },
      },
    ],
  },
  {
    id: "derived-state",
    title: "Search and derived state",
    description:
      "Keep the query in state; calculate filtered views and counts.",
    unlockAfter: ["task-input"],
    pages: [
      {
        id: "derived-state-page-1",
        title: "Store the input, derive the view",
        markdown: "course/scrum-board/derived-state-1.md",
        jokes: {
          opened:
            "Store the facts and calculate the rest. Yes, human, this disqualifies most of our meeting notes.",
          read: "Search filters the view without deleting the data. I wish the same were true when management 'cleans up' a spreadsheet.",
        },
      },
      {
        id: "derived-state-page-2",
        title: "Counts, empty states and meaning",
        markdown: "course/scrum-board/derived-state-2.md",
        jokes: {
          opened:
            "The total and the visible count are different numbers. This explains both search results and attendance at mandatory meetings.",
          read: "No matches does not mean the library is empty. It means the book is hiding from your query. Understandable.",
        },
      },
    ],
  },
  {
    id: "component-callbacks",
    title: "Callbacks and shared state",
    description: "Lift state to coordinate siblings without mutating props.",
    unlockAfter: ["board-search"],
    pages: [
      {
        id: "component-callbacks-page-1",
        title: "The closest shared owner",
        markdown: "course/scrum-board/component-callbacks-1.md",
        jokes: {
          opened:
            "When siblings disagree, lift state to their shared parent. We call the office version 'escalating the thermostat dispute.'",
          read: "The parent owns the state; the child requests a change. You have implemented our entire approval process.",
        },
      },
      {
        id: "component-callbacks-page-2",
        title: "Request a change by ID",
        markdown: "course/scrum-board/component-callbacks-2.md",
        jokes: {
          opened:
            "Callbacks carry an ID and a request. Unlike office emails, 'that thing we discussed' is not a valid identifier.",
          read: "One lamp updated, all the others left alone. A level of precision our facilities department considers unrealistic.",
        },
      },
    ],
  },
  {
    id: "immutable-updates",
    title: "Immutable editing and deletion",
    description: "Local edit drafts, parent callbacks, and stable identities.",
    unlockAfter: ["task-callbacks"],
    pages: [
      {
        id: "immutable-updates-page-1",
        title: "Separate a draft from saved data",
        markdown: "course/scrum-board/immutable-updates-1.md",
        jokes: {
          opened:
            "Keep your draft separate from the saved version. Some of my finest resignation letters exist only because of this rule.",
          read: "Cancel discards the draft without changing the saved data. If only meetings had that button.",
        },
      },
      {
        id: "immutable-updates-page-2",
        title: "Replace and remove by ID",
        markdown: "course/scrum-board/immutable-updates-2.md",
        jokes: {
          opened:
            "Today we replace and remove items by ID. Both plants are called Fern, so shouting their names won't help.",
          read: "New array, new object, same ID. A more honest rebrand than anything our marketing department has attempted.",
        },
      },
    ],
  },
  {
    id: "react-context",
    title: "Context and providers",
    description:
      "Own shared state and actions in a provider and read them with useContext.",
    unlockAfter: ["task-editing"],
    pages: [
      {
        id: "react-context-page-1",
        title: "Provide and read a value",
        markdown: "course/scrum-board/react-context-1.md",
        jokes: {
          opened:
            "Context skips the components that only forward props. Several middle managers have requested that you stop reading.",
          read: "useContext reads the nearest matching provider. Finding someone nearby who provides anything is already an office miracle.",
        },
      },
      {
        id: "react-context-page-2",
        title: "Share state and actions through a provider",
        markdown: "course/scrum-board/react-context-2.md",
        jokes: {
          opened:
            "One provider, shared state and actions. Please enjoy this brief demonstration of departments working together.",
          read: "Two separate providers give you two separate counters. Congratulations: you've recreated Accounting and Sales.",
        },
      },
    ],
  },
  {
    id: "react-effects",
    title: "Effects and synchronization",
    description:
      "Use an effect for the document title, not for ordinary calculations.",
    unlockAfter: ["board-context"],
    pages: [
      {
        id: "react-effects-page-1",
        title: "Synchronize outside React rendering",
        markdown: "course/scrum-board/react-effects-1.md",
        jokes: {
          opened:
            "Effects keep React in sync with the outside world. We are still investigating whether the outside world wants this.",
          read: "The city changed and the title followed. Please invite our office noticeboard to the next training session.",
        },
      },
      {
        id: "react-effects-page-2",
        title: "Dependencies, cleanup and avoiding extra effects",
        markdown: "course/scrum-board/react-effects-2.md",
        jokes: {
          opened:
            "If your effect starts a timer, it needs cleanup. 'Leave it for the next shift' is not a cleanup function.",
          read: "Your timer now stops when its component leaves. It has a healthier work-life balance than either of us.",
        },
      },
    ],
  },
];
