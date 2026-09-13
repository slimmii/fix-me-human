// Reference projects grow one concept at a time; starters use the previous checkpoint.
export const solutionProjects: Record<string, string>[] = [
  {
    "App.tsx": `export default function App() {
  return (
    <section>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
    </section>
  );
}
`,
  },
  {
    "App.tsx": `interface TaskCardProps {
  title: string;
}

function TaskCard({ title }: TaskCardProps) {
  return (
    <li>
      <p>{title}</p>
    </li>
  );
}
export default function App() {
  return (
    <section>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
      <ul>
        <TaskCard title="Plan sprint" />
        <TaskCard title="Build board" />
        <TaskCard title="Ship demo" />
      </ul>
    </section>
  );
}
`,
  },
  {
    "App.tsx": `type TaskStatus = "TODO" | "IN PROGRESS" | "DONE";

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

const statuses: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"];

const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
  return (
    <li data-task-id={task.id}>
      <p>{task.title}</p>
    </li>
  );
}

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

function BoardColumn({ status, tasks }: BoardColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);
  return (
    <section aria-label={status}>
      <h2>{status}</h2>
      <ul>
        {columnTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  const tasks = initialTasks;
  return (
    <div>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
      <div>
        {statuses.map((status) => (
          <BoardColumn key={status} status={status} tasks={tasks} />
        ))}
      </div>
    </div>
  );
}
`,
  },
  {
    "tasks.ts": `export type TaskStatus = "TODO" | "IN PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

export const statuses: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"];

export const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];
`,
    "TaskCard.tsx": `import type { Task } from "./tasks";

export interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <li data-task-id={task.id}>
      <p>{task.title}</p>
    </li>
  );
}
`,
    "BoardColumn.tsx": `import type { TaskStatus, Task } from "./tasks";
import { TaskCard } from "./TaskCard";

export interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

export function BoardColumn({ status, tasks }: BoardColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);
  return (
    <section aria-label={status}>
      <h2>{status}</h2>
      <ul>
        {columnTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}
`,
    "App.tsx": `import { statuses, initialTasks } from "./tasks";
import { BoardColumn } from "./BoardColumn";

export default function App() {
  const tasks = initialTasks;
  return (
    <div>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
      <div>
        {statuses.map((status) => (
          <BoardColumn key={status} status={status} tasks={tasks} />
        ))}
      </div>
    </div>
  );
}
`,
  },
  {
    "tasks.ts": `export type TaskStatus = "TODO" | "IN PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

export const statuses: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"];

export const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];
`,
    "TaskCard.tsx": `import type { Task } from "./tasks";

export interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <li data-task-id={task.id}>
      <p>{task.title}</p>
    </li>
  );
}
`,
    "BoardColumn.tsx": `import type { TaskStatus, Task } from "./tasks";
import { TaskCard } from "./TaskCard";

export interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

export function BoardColumn({ status, tasks }: BoardColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);
  return (
    <section aria-label={status}>
      <h2>{status}</h2>
      <ul>
        {columnTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}
`,
    "App.tsx": `import { useState } from "react";
import type { Task } from "./tasks";
import { statuses, initialTasks } from "./tasks";
import { BoardColumn } from "./BoardColumn";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((task) => task.id)) + 1,
        title: trimmed,
        status: "TODO",
      },
    ]);
  }
  return (
    <div>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
      <button
        aria-label="Add sample task"
        onClick={() => addTask("Review backlog")}
      >
        Add sample task
      </button>
      <div>
        {statuses.map((status) => (
          <BoardColumn key={status} status={status} tasks={tasks} />
        ))}
      </div>
    </div>
  );
}
`,
  },
  {
    "tasks.ts": `export type TaskStatus = "TODO" | "IN PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

export const statuses: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"];

export const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];
`,
    "TaskCard.tsx": `import type { Task } from "./tasks";

export interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <li data-task-id={task.id}>
      <p>{task.title}</p>
    </li>
  );
}
`,
    "BoardColumn.tsx": `import type { TaskStatus, Task } from "./tasks";
import { TaskCard } from "./TaskCard";

export interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

export function BoardColumn({ status, tasks }: BoardColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);
  return (
    <section aria-label={status}>
      <h2>{status}</h2>
      <ul>
        {columnTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}
`,
    "AddTask.tsx": `import { useState } from "react";
import type { Task } from "./tasks";

export interface AddTaskProps {
  onAdd: (title: string) => void;
}

export function AddTask({ onAdd }: AddTaskProps) {
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return (
    <div>
      <label>
        Task title
        <input
          aria-label="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAdd();
          }}
        />
      </label>
      <button aria-label="Add task" onClick={handleAdd}>
        Add task
      </button>
    </div>
  );
}
`,
    "App.tsx": `import { useState } from "react";
import type { Task } from "./tasks";
import { statuses, initialTasks } from "./tasks";
import { BoardColumn } from "./BoardColumn";
import { AddTask } from "./AddTask";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((task) => task.id)) + 1,
        title: trimmed,
        status: "TODO",
      },
    ]);
  }
  return (
    <div>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
      <AddTask onAdd={addTask} />
      <div>
        {statuses.map((status) => (
          <BoardColumn key={status} status={status} tasks={tasks} />
        ))}
      </div>
    </div>
  );
}
`,
  },
  {
    "tasks.ts": `export type TaskStatus = "TODO" | "IN PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

export const statuses: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"];

export const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];
`,
    "TaskCard.tsx": `import type { Task } from "./tasks";

export interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <li data-task-id={task.id}>
      <p>{task.title}</p>
    </li>
  );
}
`,
    "BoardColumn.tsx": `import type { TaskStatus, Task } from "./tasks";
import { TaskCard } from "./TaskCard";

export interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  query: string;
}

export function BoardColumn({ query, status, tasks }: BoardColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);
  const visibleTasks = columnTasks.filter((task) =>
    task.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <section aria-label={status}>
      <h2>{status}</h2>
      <p aria-label="Task count">{columnTasks.length} tasks</p>
      {visibleTasks.length === 0 && <p>No matching tasks</p>}
      <ul>
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>
    </section>
  );
}
`,
    "AddTask.tsx": `import { useState } from "react";
import type { Task } from "./tasks";

export interface AddTaskProps {
  onAdd: (title: string) => void;
}

export function AddTask({ onAdd }: AddTaskProps) {
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return (
    <div>
      <label>
        Task title
        <input
          aria-label="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAdd();
          }}
        />
      </label>
      <button aria-label="Add task" onClick={handleAdd}>
        Add task
      </button>
    </div>
  );
}
`,
    "App.tsx": `import { useState } from "react";
import type { Task } from "./tasks";
import { statuses, initialTasks } from "./tasks";
import { BoardColumn } from "./BoardColumn";
import { AddTask } from "./AddTask";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [query, setQuery] = useState("");
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((task) => task.id)) + 1,
        title: trimmed,
        status: "TODO",
      },
    ]);
  }
  return (
    <div>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
      <AddTask onAdd={addTask} />
      <label>
        Search tasks
        <input
          aria-label="Search tasks"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div>
        {statuses.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={tasks}
            query={query}
          />
        ))}
      </div>
    </div>
  );
}
`,
  },
  {
    "tasks.ts": `export type TaskStatus = "TODO" | "IN PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

export const statuses: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"];

export const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];
`,
    "TaskCard.tsx": `import type { TaskStatus, Task } from "./tasks";

export interface TaskCardProps {
  task: Task;
  onMove: (id: number, status: TaskStatus) => void;
}

export function TaskCard({ task, onMove }: TaskCardProps) {
  return (
    <li data-task-id={task.id}>
      <p>{task.title}</p>
      {task.status === "TODO" && (
        <button
          aria-label="Start task"
          onClick={() => onMove(task.id, "IN PROGRESS")}
        >
          Start
        </button>
      )}
      {task.status === "IN PROGRESS" && (
        <button
          aria-label="Finish task"
          onClick={() => onMove(task.id, "DONE")}
        >
          Finish
        </button>
      )}
      {task.status === "DONE" && (
        <button
          aria-label="Reopen task"
          onClick={() => onMove(task.id, "TODO")}
        >
          Reopen
        </button>
      )}
    </li>
  );
}
`,
    "BoardColumn.tsx": `import type { TaskStatus, Task } from "./tasks";
import { TaskCard } from "./TaskCard";

export interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  query: string;
  onMove: (id: number, status: TaskStatus) => void;
}

export function BoardColumn({
  query,
  status,
  tasks,
  onMove,
}: BoardColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);
  const visibleTasks = columnTasks.filter((task) =>
    task.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <section aria-label={status}>
      <h2>{status}</h2>
      <p aria-label="Task count">{columnTasks.length} tasks</p>
      {visibleTasks.length === 0 && <p>No matching tasks</p>}
      <ul>
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} onMove={onMove} />
        ))}
      </ul>
    </section>
  );
}
`,
    "AddTask.tsx": `import { useState } from "react";
import type { Task } from "./tasks";

export interface AddTaskProps {
  onAdd: (title: string) => void;
}

export function AddTask({ onAdd }: AddTaskProps) {
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return (
    <div>
      <label>
        Task title
        <input
          aria-label="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAdd();
          }}
        />
      </label>
      <button aria-label="Add task" onClick={handleAdd}>
        Add task
      </button>
    </div>
  );
}
`,
    "App.tsx": `import { useState } from "react";
import type { TaskStatus, Task } from "./tasks";
import { statuses, initialTasks } from "./tasks";
import { BoardColumn } from "./BoardColumn";
import { AddTask } from "./AddTask";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [query, setQuery] = useState("");
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((task) => task.id)) + 1,
        title: trimmed,
        status: "TODO",
      },
    ]);
  }
  function moveTask(id: number, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  }
  return (
    <div>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
      <AddTask onAdd={addTask} />
      <label>
        Search tasks
        <input
          aria-label="Search tasks"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div>
        {statuses.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={tasks}
            query={query}
            onMove={moveTask}
          />
        ))}
      </div>
    </div>
  );
}
`,
  },
  {
    "tasks.ts": `export type TaskStatus = "TODO" | "IN PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

export const statuses: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"];

export const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];
`,
    "TaskCard.tsx": `import { useState } from "react";
import type { TaskStatus, Task } from "./tasks";

export interface TaskCardProps {
  task: Task;
  onMove: (id: number, status: TaskStatus) => void;
  onUpdate: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}

export function TaskCard({ task, onMove, onUpdate, onDelete }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  if (editing)
    return (
      <li data-task-id={task.id}>
        <label>
          Edit task title
          <input
            aria-label="Edit task title"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
        <button
          aria-label="Save task"
          onClick={() => {
            if (!draft.trim()) return;
            onUpdate(task.id, draft);
            setEditing(false);
          }}
        >
          Save task
        </button>
        <button aria-label="Cancel edit" onClick={() => setEditing(false)}>
          Cancel edit
        </button>
      </li>
    );
  return (
    <li data-task-id={task.id}>
      <p>{task.title}</p>
      {task.status === "TODO" && (
        <button
          aria-label="Start task"
          onClick={() => onMove(task.id, "IN PROGRESS")}
        >
          Start
        </button>
      )}
      {task.status === "IN PROGRESS" && (
        <button
          aria-label="Finish task"
          onClick={() => onMove(task.id, "DONE")}
        >
          Finish
        </button>
      )}
      {task.status === "DONE" && (
        <button
          aria-label="Reopen task"
          onClick={() => onMove(task.id, "TODO")}
        >
          Reopen
        </button>
      )}
      <button
        aria-label="Edit task"
        onClick={() => {
          setDraft(task.title);
          setEditing(true);
        }}
      >
        Edit
      </button>
      <button aria-label="Delete task" onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </li>
  );
}
`,
    "BoardColumn.tsx": `import type { TaskStatus, Task } from "./tasks";
import { TaskCard } from "./TaskCard";

export interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  query: string;
  onMove: (id: number, status: TaskStatus) => void;
  onUpdate: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}

export function BoardColumn({
  query,
  status,
  tasks,
  onMove,
  onUpdate,
  onDelete,
}: BoardColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);
  const visibleTasks = columnTasks.filter((task) =>
    task.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <section aria-label={status}>
      <h2>{status}</h2>
      <p aria-label="Task count">{columnTasks.length} tasks</p>
      {visibleTasks.length === 0 && <p>No matching tasks</p>}
      <ul>
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMove={onMove}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  );
}
`,
    "AddTask.tsx": `import { useState } from "react";
import type { Task } from "./tasks";

export interface AddTaskProps {
  onAdd: (title: string) => void;
}

export function AddTask({ onAdd }: AddTaskProps) {
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return (
    <div>
      <label>
        Task title
        <input
          aria-label="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAdd();
          }}
        />
      </label>
      <button aria-label="Add task" onClick={handleAdd}>
        Add task
      </button>
    </div>
  );
}
`,
    "App.tsx": `import { useState } from "react";
import type { TaskStatus, Task } from "./tasks";
import { statuses, initialTasks } from "./tasks";
import { BoardColumn } from "./BoardColumn";
import { AddTask } from "./AddTask";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [query, setQuery] = useState("");
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((task) => task.id)) + 1,
        title: trimmed,
        status: "TODO",
      },
    ]);
  }
  function moveTask(id: number, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  }
  function updateTask(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, title: trimmed } : task,
      ),
    );
  }
  function removeTask(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }
  return (
    <div>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
      <AddTask onAdd={addTask} />
      <label>
        Search tasks
        <input
          aria-label="Search tasks"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div>
        {statuses.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={tasks}
            query={query}
            onMove={moveTask}
            onUpdate={updateTask}
            onDelete={removeTask}
          />
        ))}
      </div>
    </div>
  );
}
`,
  },
  {
    "tasks.ts": `export type TaskStatus = "TODO" | "IN PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

export const statuses: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"];

export const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];
`,
    "TasksContext.tsx": `import { createContext, useState } from "react";
import type { ReactNode } from "react";
import type { Task, TaskStatus } from "./tasks";
import { initialTasks } from "./tasks";

export interface TaskContextProps {
  tasks: Task[];
  addTask: (title: string) => void;
  moveTask: (id: number, status: TaskStatus) => void;
  updateTask: (id: number, title: string) => void;
  removeTask: (id: number) => void;
}

export const TaskContext = createContext<TaskContextProps | null>(null);

export interface TasksProviderProps {
  children: ReactNode;
}

export function TasksProvider({ children }: TasksProviderProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((task) => task.id)) + 1,
        title: trimmed,
        status: "TODO",
      },
    ]);
  }
  function moveTask(id: number, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  }
  function updateTask(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, title: trimmed } : task,
      ),
    );
  }
  function removeTask(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }
  return (
    <TaskContext.Provider
      value={{ tasks, addTask, moveTask, updateTask, removeTask }}
    >
      {children}
    </TaskContext.Provider>
  );
}
`,
    "TaskCard.tsx": `import { useState, useContext } from "react";
import type { Task } from "./tasks";
import { TaskContext } from "./TasksContext";

export interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const board = useContext(TaskContext);
  if (!board) throw Error("TaskCard needs a TasksProvider");
  const {
    moveTask: onMove,
    updateTask: onUpdate,
    removeTask: onDelete,
  } = board;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  if (editing)
    return (
      <li data-task-id={task.id}>
        <label>
          Edit task title
          <input
            aria-label="Edit task title"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
        <button
          aria-label="Save task"
          onClick={() => {
            if (!draft.trim()) return;
            onUpdate(task.id, draft);
            setEditing(false);
          }}
        >
          Save task
        </button>
        <button aria-label="Cancel edit" onClick={() => setEditing(false)}>
          Cancel edit
        </button>
      </li>
    );
  return (
    <li data-task-id={task.id}>
      <p>{task.title}</p>
      {task.status === "TODO" && (
        <button
          aria-label="Start task"
          onClick={() => onMove(task.id, "IN PROGRESS")}
        >
          Start
        </button>
      )}
      {task.status === "IN PROGRESS" && (
        <button
          aria-label="Finish task"
          onClick={() => onMove(task.id, "DONE")}
        >
          Finish
        </button>
      )}
      {task.status === "DONE" && (
        <button
          aria-label="Reopen task"
          onClick={() => onMove(task.id, "TODO")}
        >
          Reopen
        </button>
      )}
      <button
        aria-label="Edit task"
        onClick={() => {
          setDraft(task.title);
          setEditing(true);
        }}
      >
        Edit
      </button>
      <button aria-label="Delete task" onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </li>
  );
}
`,
    "BoardColumn.tsx": `import { useContext } from "react";
import type { TaskStatus, Task } from "./tasks";
import { TaskContext } from "./TasksContext";
import { TaskCard } from "./TaskCard";

export interface BoardColumnProps {
  status: TaskStatus;
  query: string;
}

export function BoardColumn({ status, query }: BoardColumnProps) {
  const board = useContext(TaskContext);
  if (!board) throw Error("BoardColumn needs a TasksProvider");
  const { tasks } = board;
  const columnTasks = tasks.filter((task) => task.status === status);
  const visibleTasks = columnTasks.filter((task) =>
    task.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <section aria-label={status}>
      <h2>{status}</h2>
      <p aria-label="Task count">{columnTasks.length} tasks</p>
      <ul>
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>
      {visibleTasks.length === 0 && <p>No matching tasks</p>}
    </section>
  );
}
`,
    "AddTask.tsx": `import { useState, useContext } from "react";
import type { Task } from "./tasks";
import { TaskContext } from "./TasksContext";

export function AddTask() {
  const board = useContext(TaskContext);
  if (!board) throw Error("AddTask needs a TasksProvider");
  const { addTask: onAdd } = board;
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return (
    <div>
      <label>
        Task title
        <input
          aria-label="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAdd();
          }}
        />
      </label>
      <button aria-label="Add task" onClick={handleAdd}>
        Add task
      </button>
    </div>
  );
}
`,
    "Board.tsx": `import { useState } from "react";
import { statuses } from "./tasks";
import { BoardColumn } from "./BoardColumn";
import { AddTask } from "./AddTask";

export function Board() {
  const [query, setQuery] = useState("");
  return (
    <div>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
      <AddTask />
      <label>
        Search tasks
        <input
          aria-label="Search tasks"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div>
        {statuses.map((status) => (
          <BoardColumn key={status} status={status} query={query} />
        ))}
      </div>
    </div>
  );
}
`,
    "App.tsx": `import { TasksProvider } from "./TasksContext";
import { Board } from "./Board";

export default function App() {
  return (
    <TasksProvider>
      <Board />
    </TasksProvider>
  );
}
`,
  },
  {
    "tasks.ts": `export type TaskStatus = "TODO" | "IN PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
}

export const statuses: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"];

export const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];
`,
    "TasksContext.tsx": `import { createContext, useState } from "react";
import type { ReactNode } from "react";
import type { Task, TaskStatus } from "./tasks";
import { initialTasks } from "./tasks";

export interface TaskContextProps {
  tasks: Task[];
  addTask: (title: string) => void;
  moveTask: (id: number, status: TaskStatus) => void;
  updateTask: (id: number, title: string) => void;
  removeTask: (id: number) => void;
}

export const TaskContext = createContext<TaskContextProps | null>(null);

export interface TasksProviderProps {
  children: ReactNode;
}

export function TasksProvider({ children }: TasksProviderProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) => [
      ...current,
      {
        id: Math.max(0, ...current.map((task) => task.id)) + 1,
        title: trimmed,
        status: "TODO",
      },
    ]);
  }
  function moveTask(id: number, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task)),
    );
  }
  function updateTask(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, title: trimmed } : task,
      ),
    );
  }
  function removeTask(id: number) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }
  return (
    <TaskContext.Provider
      value={{ tasks, addTask, moveTask, updateTask, removeTask }}
    >
      {children}
    </TaskContext.Provider>
  );
}
`,
    "TaskCard.tsx": `import { useState, useContext } from "react";
import type { Task } from "./tasks";
import { TaskContext } from "./TasksContext";

export interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const board = useContext(TaskContext);
  if (!board) throw Error("TaskCard needs a TasksProvider");
  const {
    moveTask: onMove,
    updateTask: onUpdate,
    removeTask: onDelete,
  } = board;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  if (editing)
    return (
      <li data-task-id={task.id}>
        <label>
          Edit task title
          <input
            aria-label="Edit task title"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </label>
        <button
          aria-label="Save task"
          onClick={() => {
            if (!draft.trim()) return;
            onUpdate(task.id, draft);
            setEditing(false);
          }}
        >
          Save task
        </button>
        <button aria-label="Cancel edit" onClick={() => setEditing(false)}>
          Cancel edit
        </button>
      </li>
    );
  return (
    <li data-task-id={task.id}>
      <p>{task.title}</p>
      {task.status === "TODO" && (
        <button
          aria-label="Start task"
          onClick={() => onMove(task.id, "IN PROGRESS")}
        >
          Start
        </button>
      )}
      {task.status === "IN PROGRESS" && (
        <button
          aria-label="Finish task"
          onClick={() => onMove(task.id, "DONE")}
        >
          Finish
        </button>
      )}
      {task.status === "DONE" && (
        <button
          aria-label="Reopen task"
          onClick={() => onMove(task.id, "TODO")}
        >
          Reopen
        </button>
      )}
      <button
        aria-label="Edit task"
        onClick={() => {
          setDraft(task.title);
          setEditing(true);
        }}
      >
        Edit
      </button>
      <button aria-label="Delete task" onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </li>
  );
}
`,
    "BoardColumn.tsx": `import { useContext } from "react";
import type { TaskStatus, Task } from "./tasks";
import { TaskContext } from "./TasksContext";
import { TaskCard } from "./TaskCard";

export interface BoardColumnProps {
  status: TaskStatus;
  query: string;
}

export function BoardColumn({ status, query }: BoardColumnProps) {
  const board = useContext(TaskContext);
  if (!board) throw Error("BoardColumn needs a TasksProvider");
  const { tasks } = board;
  const columnTasks = tasks.filter((task) => task.status === status);
  const visibleTasks = columnTasks.filter((task) =>
    task.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <section aria-label={status}>
      <h2>{status}</h2>
      <p aria-label="Task count">{columnTasks.length} tasks</p>
      <ul>
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </ul>
      {visibleTasks.length === 0 && <p>No matching tasks</p>}
    </section>
  );
}
`,
    "AddTask.tsx": `import { useState, useContext } from "react";
import type { Task } from "./tasks";
import { TaskContext } from "./TasksContext";

export function AddTask() {
  const board = useContext(TaskContext);
  if (!board) throw Error("AddTask needs a TasksProvider");
  const { addTask: onAdd } = board;
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return (
    <div>
      <label>
        Task title
        <input
          aria-label="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleAdd();
          }}
        />
      </label>
      <button aria-label="Add task" onClick={handleAdd}>
        Add task
      </button>
    </div>
  );
}
`,
    "Board.tsx": `import { useState, useEffect, useContext } from "react";
import { statuses } from "./tasks";
import { TaskContext } from "./TasksContext";
import { BoardColumn } from "./BoardColumn";
import { AddTask } from "./AddTask";

export function Board() {
  const [query, setQuery] = useState("");
  const board = useContext(TaskContext);
  if (!board) throw Error("Board needs a TasksProvider");
  const { tasks } = board;
  const done = tasks.filter((task) => task.status === "DONE").length;
  useEffect(() => {
    document.title = \`Sprint board — \${done} done\`;
  }, [done]);
  return (
    <div>
      <h1>Sprint board</h1>
      <p>A home for our team's tasks.</p>
      <AddTask />
      <label>
        Search tasks
        <input
          aria-label="Search tasks"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div>
        {statuses.map((status) => (
          <BoardColumn key={status} status={status} query={query} />
        ))}
      </div>
    </div>
  );
}
`,
    "App.tsx": `import { TasksProvider } from "./TasksContext";
import { Board } from "./Board";

export default function App() {
  return (
    <TasksProvider>
      <Board />
    </TasksProvider>
  );
}
`,
  },
];
export const solutions = solutionProjects.map((project) => project["App.tsx"]);
