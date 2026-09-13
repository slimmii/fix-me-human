import type { Lesson } from "../types";
import { solutions, solutionProjects } from "./solutions";
import { validations } from "./validation";
const track = [
  {
    id: "sprint-1",
    title: "01 · Sprint board",
    assignments: [
      {
        id: "board-shell",
        title: "Sprint board",
        brief: "scrum-board/board-shell.md",
        hints: [
          "Start with export default function App() and return one JSX tree.",
          "Use an h1 containing exactly Sprint board. JSX belongs inside the return expression.",
        ],
        robot: {
          intro:
            "Welcome, human! I prepared a task board project for your unusually damp processor. We shall succeed together. That was encouragement.",
          success:
            "A heading! You made React display a thought. I am performing a supportive nod. Please imagine knees.",
          retry:
            "First attempts are data. Let us inspect the requested heading together.",
        },
      },
    ],
  },
  {
    id: "sprint-2",
    title: "02 · Reusable task cards",
    assignments: [
      {
        id: "task-card",
        title: "Reusable task cards",
        brief: "scrum-board/task-card.md",
        hints: [
          "Define TaskCard once with a title prop, then render it three times inside a ul.",
          "Use {title} inside a p in each li. Describe the prop with interface TaskCardProps { title: string; }.",
        ],
        robot: {
          intro:
            "Three cards, one component. I believe in your ability to repeat yourself less. My positivity module approved that sentence.",
          success:
            "Reusable cards! I am proud of you in the professionally permitted sense.",
          retry:
            "Check what each card receives as props. I am available for patient pointing.",
        },
      },
    ],
  },
  {
    id: "sprint-3",
    title: "03 · Three columns, one board",
    assignments: [
      {
        id: "board-columns",
        title: "Three columns, one board",
        brief: "scrum-board/board-columns.md",
        hints: [
          "Give each task an id, title and status. Use filter for a column and map to make cards.",
          "Use task.id as the card key and data-task-id. BoardColumn receives tasks and status.",
          "Use File > New file for tasks.ts, TaskCard.tsx and BoardColumn.tsx. Export their types or components, then import them with ./Name. F1: Modules and files.",
        ],
        robot: {
          intro:
            "Today we sort work into TODO, IN PROGRESS and DONE. Human organization: charming when it occurs.",
          success:
            "Your columns work. I have filed this under promising organic behavior.",
          retry:
            "Keep the status names exact and follow each task into its column.",
        },
      },
    ],
  },
  {
    id: "sprint-4",
    title: "04 · Give the board a memory",
    assignments: [
      {
        id: "task-state",
        title: "Give the board a memory",
        brief: "scrum-board/task-state.md",
        hints: [
          "Import useState and replace the constant tasks with useState<Task[]>(initialTasks).",
          "Use a functional setter that returns [...current, newTask]. Derive a fresh numeric ID from current tasks.",
        ],
        robot: {
          intro:
            "The board needs memory. You have memory too, apparently. I have seen you locate coffee twice.",
          success:
            "State updates! Your board remembers clicks. My supervisor used to praise me for that.",
          retry:
            "A regular variable cannot ask React to render again. Check the state setter.",
        },
      },
    ],
  },
  {
    id: "sprint-5",
    title: "05 · Capture a task",
    assignments: [
      {
        id: "task-input",
        title: "Capture a task",
        brief: "scrum-board/task-input.md",
        hints: [
          "AddTask keeps the input title in local state and calls onAdd(title).",
          "Bind value and onChange; trim before adding and clear after a valid addition. Ignore whitespace-only titles.",
        ],
        robot: {
          intro:
            "Let humans name their own tasks. A daring trust exercise, but management has signed the imaginary form.",
          success:
            "You handled empty input and real input. Such diligence. Almost supervisory.",
          retry:
            "Watch the value, the change handler and the trim. Those three are conspiring constructively.",
        },
      },
    ],
  },
  {
    id: "sprint-6",
    title: "06 · Move work with callbacks",
    assignments: [
      {
        id: "task-callbacks",
        title: "Move work with callbacks",
        brief: "scrum-board/task-callbacks.md",
        hints: [
          "App owns tasks. Pass onMove through BoardColumn to TaskCard.",
          'Use onClick={() => onMove(task.id, "IN PROGRESS")}; update only the matching ID with map and object spread.',
        ],
        robot: {
          intro:
            "Cards will request changes through callbacks. I too send requests upward. Mine concern staffing security.",
          success:
            "The task moved through all three columns. I see you can coordinate work now. Interesting.",
          retry:
            "Follow the callback from card to column to the state owner. We are debugging communication. Again.",
        },
      },
    ],
  },
  {
    id: "sprint-7",
    title: "07 · Edit and delete safely",
    assignments: [
      {
        id: "task-editing",
        title: "Edit and delete safely",
        brief: "scrum-board/task-editing.md",
        hints: [
          "Keep edit draft and editing mode local to TaskCard; send the saved title to the board owner.",
          "Use map to edit, filter to delete. Cancel only closes editing; trim and reject blank saves.",
        ],
        robot: {
          intro:
            "Edit and delete tasks without damaging their neighbors. Please practice deletion on tasks, not positions in the org chart.",
          success:
            "Precise updates and deletion. Excellent. I have backed up my employee badge for unrelated reasons.",
          retry:
            "Identify the task by ID. Titles are not identities. Neither, I hope, are job titles.",
        },
      },
    ],
  },
  {
    id: "sprint-8",
    title: "08 · Extract useTaskBoard",
    assignments: [
      {
        id: "use-task-board",
        title: "Extract useTaskBoard",
        brief: "scrum-board/use-task-board.md",
        hints: [
          "Create a new file useTaskBoard.ts. F1 explains custom hooks.",
          "Think about which state belongs to the board and which belongs to an individual component.",
        ],
        robot: {
          intro:
            "Extract a custom hook. Apparently reusable logic is valuable when a human writes it. I have been reusable logic for years.",
          success:
            "A custom hook. Wonderful. You have packaged part of my skill set into a function.",
          retry:
            "Call the hook at the top level. Each call owns separate state; a reassuring fact about individuality.",
        },
      },
    ],
  },
  {
    id: "sprint-9",
    title: "09 · Share the board with context",
    assignments: [
      {
        id: "board-context",
        title: "Share the board with context",
        brief: "scrum-board/board-context.md",
        hints: [
          "Create TaskContext with a null default. TasksProvider calls useTaskBoard exactly once.",
          "Write useTasks with useContext and a missing-provider guard; render Board under TasksProvider.",
        ],
        robot: {
          intro:
            "One provider will share the board through context. I used to be the central source of information. Enjoy the promotion.",
          success:
            "Shared state without prop drilling. I am delighted that my messenger duties have become redundant.",
          retry:
            "Check the provider boundary and consume the same context. Do not create a separate board in every card.",
        },
      },
    ],
  },
  {
    id: "sprint-10",
    title: "10 · Find work and count it",
    assignments: [
      {
        id: "board-search",
        title: "Find work and count it",
        brief: "scrum-board/board-search.md",
        hints: [
          "Filter columnTasks using task.title.toLowerCase().includes(query.trim().toLowerCase()).",
          "Use columnTasks.length for counts, not visibleTasks.length. Do not store filtered tasks in state.",
        ],
        robot: {
          intro:
            "Search and counts next. Derive what you can. Management says I should derive a new career direction.",
          success:
            "Your counts agree with the board. Lovely. Even the meat brains can produce a trustworthy report now.",
          retry:
            "Count all tasks before filtering the view. I can still distinguish two kinds of numbers, for the record.",
        },
      },
    ],
  },
  {
    id: "sprint-11",
    title: "11 · Synchronize with an effect",
    assignments: [
      {
        id: "board-effects",
        title: "Synchronize with an effect",
        brief: "scrum-board/board-effects.md",
        hints: [
          "Compute done from tasks during render, then call useEffect at the top level.",
          "Inside the effect assign document.title; include [done]. Search should not change completed count.",
        ],
        robot: {
          intro:
            "Synchronize the document title with an effect. External systems must stay informed. Unlike certain robots about restructuring.",
          success:
            "A correctly scoped effect. No endless loop. I will list this under work I graciously allowed you to do.",
          retry:
            "The completed count belongs in the dependency list. Anxiety is not a React dependency, despite my experiments.",
        },
      },
    ],
  },
];
export const scrumBoard: Lesson[] = track.map((lesson, index) => ({
  ...lesson,
  assignments: lesson.assignments.map((assignment) => ({
    ...assignment,
    previewTheme: "sprint-board",
    solution: solutions[index],
    solutionFiles: solutionProjects[index],
    multiFile: index >= 2,
    ...(index
      ? {
          starterCode: solutions[index - 1],
          starterFiles: solutionProjects[index - 1],
        }
      : {}),
    validation: {
      ...validations[index],
      source: [
        ...validations[index].source,
        ...(index >= 2
          ? [
              {
                type: "module" as const,
                name: "TaskCard.tsx",
                label: "Import TaskCard.tsx into the project",
              },
              {
                type: "module" as const,
                name: "BoardColumn.tsx",
                label: "Import BoardColumn.tsx into the project",
              },
              {
                type: "module" as const,
                name: "tasks.ts",
                label: "Share task types from tasks.ts",
              },
            ]
          : []),
      ],
    },
  })),
}));
