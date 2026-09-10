import type { RuntimeRule, Validation } from "../../validation/types";

const check1: RuntimeRule = {
  type: "visible-heading",
  text: "Sprint board",
  label: "Show a visible h1 reading Sprint board",
};

const check2: RuntimeRule = {
  type: "visible-text",
  selector: "li p",
  text: "Plan sprint",
  label: "Render the task Plan sprint",
};

const check3: RuntimeRule = {
  type: "visible-text",
  selector: "li p",
  text: "Build board",
  label: "Render the task Build board",
};

const check4: RuntimeRule = {
  type: "visible-text",
  selector: "li p",
  text: "Ship demo",
  label: "Render the task Ship demo",
};

const check5: RuntimeRule = {
  type: "visible-text",
  selector: 'section[aria-label="TODO"] h2',
  text: "TODO",
  label: "Label the TODO column",
};

const check6: RuntimeRule = {
  type: "visible-text",
  selector: 'section[aria-label="IN PROGRESS"] h2',
  text: "IN PROGRESS",
  label: "Label the IN PROGRESS column",
};

const check7: RuntimeRule = {
  type: "visible-text",
  selector: 'section[aria-label="DONE"] h2',
  text: "DONE",
  label: "Label the DONE column",
};

const check8: RuntimeRule = {
  type: "visible-text",
  selector: 'section[aria-label="TODO"] li[data-task-id="1"] p',
  text: "Plan sprint",
  label: "Place Plan sprint in TODO",
};

const check9: RuntimeRule = {
  type: "visible-text",
  selector: 'section[aria-label="IN PROGRESS"] li[data-task-id="2"] p',
  text: "Build board",
  label: "Place Build board in IN PROGRESS",
};

const check10: RuntimeRule = {
  type: "visible-text",
  selector: 'section[aria-label="DONE"] li[data-task-id="3"] p',
  text: "Ship demo",
  label: "Place Ship demo in DONE",
};

const check11: RuntimeRule = {
  type: "interaction",
  label: "Each click appends one sample task without losing existing tasks",
  steps: [
    {
      action: "click",
      selector: 'button[aria-label="Add sample task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] li p',
      text: "Review backlog",
    },
    {
      action: "expect",
      selector: "li",
      count: 4,
    },
    {
      action: "click",
      selector: 'button[aria-label="Add sample task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] li',
      count: 3,
    },
    {
      action: "expect",
      selector: "li",
      count: 5,
    },
  ],
};

const check12: RuntimeRule = {
  type: "interaction",
  label:
    "Add trimmed TODO tasks, clear the input, ignore blanks and keep duplicate titles separate",
  steps: [
    {
      action: "input",
      selector: 'input[aria-label="Task title"]',
      value: "   ",
    },
    {
      action: "click",
      selector: 'button[aria-label="Add task"]',
    },
    {
      action: "expect",
      selector: "li",
      count: 3,
    },
    {
      action: "input",
      selector: 'input[aria-label="Task title"]',
      value: "  Write tests  ",
    },
    {
      action: "click",
      selector: 'button[aria-label="Add task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] li p',
      text: "Write tests",
    },
    {
      action: "expect",
      selector: 'input[aria-label="Task title"]',
      value: "",
    },
    {
      action: "input",
      selector: 'input[aria-label="Task title"]',
      value: "Write tests",
    },
    {
      action: "click",
      selector: 'button[aria-label="Add task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] li',
      count: 3,
    },
    {
      action: "expect",
      selector: "li",
      count: 5,
    },
  ],
};

const check13: RuntimeRule = {
  type: "interaction",
  label:
    "Start, finish and reopen the same task without changing its neighbors",
  steps: [
    {
      action: "click",
      selector: 'li[data-task-id="1"] button[aria-label="Start task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] li',
      count: 0,
    },
    {
      action: "expect",
      selector: 'section[aria-label="IN PROGRESS"] li[data-task-id="1"] p',
      text: "Plan sprint",
    },
    {
      action: "expect",
      selector: 'section[aria-label="IN PROGRESS"] li[data-task-id="2"]',
      count: 1,
    },
    {
      action: "click",
      selector: 'li[data-task-id="1"] button[aria-label="Finish task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="DONE"] li',
      count: 2,
    },
    {
      action: "click",
      selector: 'li[data-task-id="1"] button[aria-label="Reopen task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] li[data-task-id="1"]',
      count: 1,
    },
    {
      action: "expect",
      selector: 'section[aria-label="DONE"] li[data-task-id="3"]',
      count: 1,
    },
  ],
};

const check14: RuntimeRule = {
  type: "interaction",
  label:
    "Edit and trim one title; ignore a blank edit; cancel preserves the original",
  steps: [
    {
      action: "click",
      selector: 'li[data-task-id="1"] button[aria-label="Edit task"]',
    },
    {
      action: "input",
      selector: 'input[aria-label="Edit task title"]',
      value: "   ",
    },
    {
      action: "click",
      selector: 'button[aria-label="Save task"]',
    },
    {
      action: "expect",
      selector: 'input[aria-label="Edit task title"]',
      count: 1,
    },
    {
      action: "input",
      selector: 'input[aria-label="Edit task title"]',
      value: "  Plan next sprint  ",
    },
    {
      action: "click",
      selector: 'button[aria-label="Save task"]',
    },
    {
      action: "expect",
      selector: 'li[data-task-id="1"] p',
      text: "Plan next sprint",
    },
    {
      action: "expect",
      selector: 'li[data-task-id="2"] p',
      text: "Build board",
    },
    {
      action: "click",
      selector: 'li[data-task-id="1"] button[aria-label="Edit task"]',
    },
    {
      action: "input",
      selector: 'input[aria-label="Edit task title"]',
      value: "Discard this",
    },
    {
      action: "click",
      selector: 'button[aria-label="Cancel edit"]',
    },
    {
      action: "expect",
      selector: 'li[data-task-id="1"] p',
      text: "Plan next sprint",
    },
  ],
};

const check15: RuntimeRule = {
  type: "interaction",
  label: "Delete only the selected task, then add a usable new task",
  steps: [
    {
      action: "click",
      selector: 'li[data-task-id="2"] button[aria-label="Delete task"]',
    },
    {
      action: "expect",
      selector: 'li[data-task-id="2"]',
      count: 0,
    },
    {
      action: "expect",
      selector: "li",
      count: 2,
    },
    {
      action: "input",
      selector: 'input[aria-label="Task title"]',
      value: "After deletion",
    },
    {
      action: "click",
      selector: 'button[aria-label="Add task"]',
    },
    {
      action: "expect",
      selector: "li",
      count: 3,
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] li p',
      text: "After deletion",
    },
  ],
};

const check16: RuntimeRule = {
  type: "interaction",
  label: "Duplicate titles have independent identities",
  steps: [
    {
      action: "input",
      selector: 'input[aria-label="Task title"]',
      value: "Plan sprint",
    },
    {
      action: "click",
      selector: 'button[aria-label="Add task"]',
    },
    {
      action: "click",
      selector: 'li[data-task-id="1"] button[aria-label="Delete task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] li p',
      text: "Plan sprint",
    },
    {
      action: "expect",
      selector: "li",
      count: 3,
    },
  ],
};

const check17: RuntimeRule = {
  type: "interaction",
  label:
    "Search ignores case and outer spaces; counts describe all tasks, even with no matches",
  steps: [
    {
      action: "input",
      selector: 'input[aria-label="Search tasks"]',
      value: "  BUILD  ",
    },
    {
      action: "expect",
      selector: "li",
      count: 1,
    },
    {
      action: "expect",
      selector: 'li[data-task-id="2"] p',
      text: "Build board",
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] [aria-label="Task count"]',
      text: "1 tasks",
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] p',
      text: "No matching tasks",
    },
    {
      action: "input",
      selector: 'input[aria-label="Search tasks"]',
      value: "nothing matches this",
    },
    {
      action: "expect",
      selector: "li",
      count: 0,
    },
    {
      action: "expect",
      selector: 'section[aria-label="DONE"] [aria-label="Task count"]',
      text: "1 tasks",
    },
    {
      action: "input",
      selector: 'input[aria-label="Search tasks"]',
      value: "",
    },
    {
      action: "expect",
      selector: "li",
      count: 3,
    },
  ],
};

const check18: RuntimeRule = {
  type: "interaction",
  label: "Counts update after moves and deletions",
  steps: [
    {
      action: "click",
      selector: 'li[data-task-id="1"] button[aria-label="Start task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] [aria-label="Task count"]',
      text: "0 tasks",
    },
    {
      action: "expect",
      selector: 'section[aria-label="IN PROGRESS"] [aria-label="Task count"]',
      text: "2 tasks",
    },
    {
      action: "click",
      selector: 'li[data-task-id="2"] button[aria-label="Delete task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="IN PROGRESS"] [aria-label="Task count"]',
      text: "1 tasks",
    },
  ],
};

const check19: RuntimeRule = {
  type: "interaction",
  label: "Synchronize the preview document title with completed tasks",
  steps: [
    {
      action: "title",
      text: "Sprint board — 1 done",
    },
    {
      action: "click",
      selector: 'li[data-task-id="2"] button[aria-label="Finish task"]',
    },
    {
      action: "title",
      text: "Sprint board — 2 done",
    },
    {
      action: "click",
      selector: 'li[data-task-id="3"] button[aria-label="Reopen task"]',
    },
    {
      action: "title",
      text: "Sprint board — 1 done",
    },
  ],
};

const check20: RuntimeRule = {
  type: "interaction",
  label:
    "A new task survives editing, the full workflow, searching, reopening and deletion",
  steps: [
    {
      action: "input",
      selector: 'input[aria-label="Task title"]',
      value: "End to end",
    },
    {
      action: "click",
      selector: 'button[aria-label="Add task"]',
    },
    {
      action: "click",
      selector: 'li[data-task-id="4"] button[aria-label="Edit task"]',
    },
    {
      action: "input",
      selector: 'input[aria-label="Edit task title"]',
      value: "  Release checklist  ",
    },
    {
      action: "click",
      selector: 'button[aria-label="Save task"]',
    },
    {
      action: "click",
      selector: 'li[data-task-id="4"] button[aria-label="Start task"]',
    },
    {
      action: "click",
      selector: 'li[data-task-id="4"] button[aria-label="Finish task"]',
    },
    {
      action: "input",
      selector: 'input[aria-label="Search tasks"]',
      value: "release",
    },
    {
      action: "expect",
      selector: 'section[aria-label="DONE"] li[data-task-id="4"] p',
      text: "Release checklist",
    },
    {
      action: "expect",
      selector: 'section[aria-label="DONE"] [aria-label="Task count"]',
      text: "2 tasks",
    },
    {
      action: "click",
      selector: 'li[data-task-id="4"] button[aria-label="Reopen task"]',
    },
    {
      action: "expect",
      selector: 'section[aria-label="TODO"] li[data-task-id="4"]',
      count: 1,
    },
    {
      action: "click",
      selector: 'li[data-task-id="4"] button[aria-label="Delete task"]',
    },
    {
      action: "expect",
      selector: "li",
      count: 0,
    },
    {
      action: "input",
      selector: 'input[aria-label="Search tasks"]',
      value: "",
    },
    {
      action: "expect",
      selector: "li",
      count: 3,
    },
  ],
};

export const validations: Validation[] = [
  {
    source: [{ type: "exported-component", label: "Export a React component" }],
    runtime: [check1],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
    ],
    runtime: [check1, check2, check3, check4],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
      {
        type: "component",
        name: "BoardColumn",
        label: "Define and render BoardColumn",
      },
    ],
    runtime: [check1, check5, check6, check7, check8, check9, check10],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
      {
        type: "component",
        name: "BoardColumn",
        label: "Define and render BoardColumn",
      },
      {
        type: "uses-call",
        name: "useState",
        label: "Use React state for changing data",
      },
    ],
    runtime: [check1, check5, check6, check7, check8, check9, check10, check11],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
      {
        type: "component",
        name: "BoardColumn",
        label: "Define and render BoardColumn",
      },
      {
        type: "uses-call",
        name: "useState",
        label: "Use React state for changing data",
      },
      {
        type: "component",
        name: "AddTask",
        label: "Define and render AddTask",
      },
    ],
    runtime: [check1, check5, check6, check7, check8, check9, check10, check12],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
      {
        type: "component",
        name: "BoardColumn",
        label: "Define and render BoardColumn",
      },
      {
        type: "uses-call",
        name: "useState",
        label: "Use React state for changing data",
      },
      {
        type: "component",
        name: "AddTask",
        label: "Define and render AddTask",
      },
    ],
    runtime: [
      check1,
      check5,
      check6,
      check7,
      check8,
      check9,
      check10,
      check12,
      check13,
    ],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
      {
        type: "component",
        name: "BoardColumn",
        label: "Define and render BoardColumn",
      },
      {
        type: "uses-call",
        name: "useState",
        label: "Use React state for changing data",
      },
      {
        type: "component",
        name: "AddTask",
        label: "Define and render AddTask",
      },
    ],
    runtime: [
      check1,
      check5,
      check6,
      check7,
      check8,
      check9,
      check10,
      check12,
      check13,
      check14,
      check15,
      check16,
    ],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
      {
        type: "component",
        name: "BoardColumn",
        label: "Define and render BoardColumn",
      },
      {
        type: "uses-call",
        name: "useState",
        label: "Use React state for changing data",
      },
      {
        type: "component",
        name: "AddTask",
        label: "Define and render AddTask",
      },
      {
        type: "uses-call",
        name: "useTaskBoard",
        label: "Extract and call useTaskBoard",
      },
    ],
    runtime: [
      check1,
      check5,
      check6,
      check7,
      check8,
      check9,
      check10,
      check12,
      check13,
      check14,
      check15,
      check16,
    ],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
      {
        type: "component",
        name: "BoardColumn",
        label: "Define and render BoardColumn",
      },
      {
        type: "uses-call",
        name: "useState",
        label: "Use React state for changing data",
      },
      {
        type: "component",
        name: "AddTask",
        label: "Define and render AddTask",
      },
      {
        type: "uses-call",
        name: "useTaskBoard",
        label: "Extract and call useTaskBoard",
      },
      {
        type: "component",
        name: "TasksProvider",
        label: "Wrap the board in TasksProvider",
      },
      {
        type: "uses-call",
        name: "createContext",
        label: "Use createContext for shared board state",
      },
      {
        type: "uses-call",
        name: "useContext",
        label: "Use useContext for shared board state",
      },
      {
        type: "uses-call",
        name: "useTasks",
        label: "Use useTasks for shared board state",
      },
    ],
    runtime: [
      check1,
      check5,
      check6,
      check7,
      check8,
      check9,
      check10,
      check12,
      check13,
      check14,
      check15,
      check16,
    ],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
      {
        type: "component",
        name: "BoardColumn",
        label: "Define and render BoardColumn",
      },
      {
        type: "uses-call",
        name: "useState",
        label: "Use React state for changing data",
      },
      {
        type: "component",
        name: "AddTask",
        label: "Define and render AddTask",
      },
      {
        type: "uses-call",
        name: "useTaskBoard",
        label: "Extract and call useTaskBoard",
      },
      {
        type: "component",
        name: "TasksProvider",
        label: "Wrap the board in TasksProvider",
      },
      {
        type: "uses-call",
        name: "createContext",
        label: "Use createContext for shared board state",
      },
      {
        type: "uses-call",
        name: "useContext",
        label: "Use useContext for shared board state",
      },
      {
        type: "uses-call",
        name: "useTasks",
        label: "Use useTasks for shared board state",
      },
    ],
    runtime: [
      check1,
      check5,
      check6,
      check7,
      check8,
      check9,
      check10,
      check12,
      check13,
      check14,
      check15,
      check16,
      check17,
      check18,
    ],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
      {
        type: "component",
        name: "BoardColumn",
        label: "Define and render BoardColumn",
      },
      {
        type: "uses-call",
        name: "useState",
        label: "Use React state for changing data",
      },
      {
        type: "component",
        name: "AddTask",
        label: "Define and render AddTask",
      },
      {
        type: "uses-call",
        name: "useTaskBoard",
        label: "Extract and call useTaskBoard",
      },
      {
        type: "component",
        name: "TasksProvider",
        label: "Wrap the board in TasksProvider",
      },
      {
        type: "uses-call",
        name: "createContext",
        label: "Use createContext for shared board state",
      },
      {
        type: "uses-call",
        name: "useContext",
        label: "Use useContext for shared board state",
      },
      {
        type: "uses-call",
        name: "useTasks",
        label: "Use useTasks for shared board state",
      },
      {
        type: "uses-call",
        name: "useEffect",
        label: "Synchronize the title with useEffect",
      },
    ],
    runtime: [
      check1,
      check5,
      check6,
      check7,
      check8,
      check9,
      check10,
      check12,
      check13,
      check14,
      check15,
      check16,
      check17,
      check18,
      check19,
    ],
  },
  {
    source: [
      { type: "exported-component", label: "Export a React component" },
      {
        type: "component",
        name: "TaskCard",
        label: "Define and render TaskCard",
      },
      {
        type: "component",
        name: "BoardColumn",
        label: "Define and render BoardColumn",
      },
      {
        type: "uses-call",
        name: "useState",
        label: "Use React state for changing data",
      },
      {
        type: "component",
        name: "AddTask",
        label: "Define and render AddTask",
      },
      {
        type: "uses-call",
        name: "useTaskBoard",
        label: "Extract and call useTaskBoard",
      },
      {
        type: "component",
        name: "TasksProvider",
        label: "Wrap the board in TasksProvider",
      },
      {
        type: "uses-call",
        name: "createContext",
        label: "Use createContext for shared board state",
      },
      {
        type: "uses-call",
        name: "useContext",
        label: "Use useContext for shared board state",
      },
      {
        type: "uses-call",
        name: "useTasks",
        label: "Use useTasks for shared board state",
      },
      {
        type: "uses-call",
        name: "useEffect",
        label: "Synchronize the title with useEffect",
      },
    ],
    runtime: [
      check1,
      check5,
      check6,
      check7,
      check8,
      check9,
      check10,
      check12,
      check13,
      check14,
      check15,
      check16,
      check17,
      check18,
      check19,
      check20,
    ],
  },
];

validations[11].runtime.push({
  type: "column-layout",
  selector:
    'section[aria-label="TODO"], section[aria-label="IN PROGRESS"], section[aria-label="DONE"]',
  count: 3,
  minWidth: 640,
  label:
    "Arrange all three columns side by side when the preview is at least 640px wide",
});
