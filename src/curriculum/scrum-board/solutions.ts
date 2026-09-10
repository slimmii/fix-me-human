// Each checkpoint is real TSX, stored as source text for the learner editor.
export const solutions: string[] = [
  // board-shell
  `export default function App() {
  return <section><h1>Sprint board</h1><p>A home for our team's tasks.</p></section>;
}
`,
  // task-card
  `function TaskCard({ title }: { title: string }) {
  return <li><p>{title}</p></li>;
}
export default function App() {
  return <section><h1>Sprint board</h1><ul>
    <TaskCard title="Plan sprint" />
    <TaskCard title="Build board" />
    <TaskCard title="Ship demo" />
  </ul></section>;
}
`,
  // board-columns
  `type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const statuses: Status[] = ["TODO", "IN PROGRESS", "DONE"];
const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

function TaskCard({ task }: { task: Task }) {
  return <li data-task-id={task.id}><p>{task.title}</p>
  </li>;
}

function BoardColumn({ status, tasks }: { status: Status; tasks: Task[] }) {
  const columnTasks = tasks.filter(task => task.status === status);
  return <section aria-label={status}>
    <h2>{status}</h2>
    <ul>{columnTasks.map(task => <TaskCard key={task.id} task={task} />)}</ul>
  </section>;
}

export default function App() {
  const tasks = initialTasks;
  return <div className="scrum-board"><h1>Sprint board</h1>
    <div>
      {statuses.map(status => <BoardColumn key={status} status={status} tasks={tasks} />)}
    </div>
  </div>;
}
`,
  // task-state
  `import { useState } from "react";
type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const statuses: Status[] = ["TODO", "IN PROGRESS", "DONE"];
const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

function TaskCard({ task }: { task: Task }) {
  return <li data-task-id={task.id}><p>{task.title}</p>
  </li>;
}

function BoardColumn({ status, tasks }: { status: Status; tasks: Task[] }) {
  const columnTasks = tasks.filter(task => task.status === status);
  return <section aria-label={status}>
    <h2>{status}</h2>
    <ul>{columnTasks.map(task => <TaskCard key={task.id} task={task} />)}</ul>
  </section>;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => [...current, {
      id: Math.max(0, ...current.map(task => task.id)) + 1,
      title: trimmed, status: "TODO",
    }]);
  }
  return <div className="scrum-board"><h1>Sprint board</h1>
    <button aria-label="Add sample task" onClick={() => addTask("Review backlog")}>Add sample task</button>
    <div>
      {statuses.map(status => <BoardColumn key={status} status={status} tasks={tasks} />)}
    </div>
  </div>;
}
`,
  // task-input
  `import { useState } from "react";
type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const statuses: Status[] = ["TODO", "IN PROGRESS", "DONE"];
const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

function TaskCard({ task }: { task: Task }) {
  return <li data-task-id={task.id}><p>{task.title}</p>
  </li>;
}

function BoardColumn({ status, tasks }: { status: Status; tasks: Task[] }) {
  const columnTasks = tasks.filter(task => task.status === status);
  return <section aria-label={status}>
    <h2>{status}</h2>
    <ul>{columnTasks.map(task => <TaskCard key={task.id} task={task} />)}</ul>
  </section>;
}

function AddTask({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return <div>
    <label>Task title<input aria-label="Task title" value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === "Enter") handleAdd(); }} /></label>
    <button aria-label="Add task" onClick={handleAdd}>Add task</button>
  </div>;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => [...current, {
      id: Math.max(0, ...current.map(task => task.id)) + 1,
      title: trimmed, status: "TODO",
    }]);
  }
  return <div className="scrum-board"><h1>Sprint board</h1>
    <AddTask onAdd={addTask} />
    <div>
      {statuses.map(status => <BoardColumn key={status} status={status} tasks={tasks} />)}
    </div>
  </div>;
}
`,
  // task-callbacks
  `import { useState } from "react";
type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const statuses: Status[] = ["TODO", "IN PROGRESS", "DONE"];
const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

function TaskCard({ task, onMove }: { task: Task; onMove: (id: number, status: Status) => void }) {
  return <li data-task-id={task.id}><p>{task.title}</p>
    {task.status === "TODO" && <button aria-label="Start task" onClick={() => onMove(task.id, "IN PROGRESS")}>Start</button>}
    {task.status === "IN PROGRESS" && <button aria-label="Finish task" onClick={() => onMove(task.id, "DONE")}>Finish</button>}
    {task.status === "DONE" && <button aria-label="Reopen task" onClick={() => onMove(task.id, "TODO")}>Reopen</button>}
  </li>;
}

function BoardColumn({ status, tasks, onMove }: { status: Status; tasks: Task[]; onMove: (id: number, status: Status) => void }) {
  const columnTasks = tasks.filter(task => task.status === status);
  return <section aria-label={status}>
    <h2>{status}</h2>
    <ul>{columnTasks.map(task => <TaskCard key={task.id} task={task} onMove={onMove} />)}</ul>
  </section>;
}

function AddTask({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return <div>
    <label>Task title<input aria-label="Task title" value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === "Enter") handleAdd(); }} /></label>
    <button aria-label="Add task" onClick={handleAdd}>Add task</button>
  </div>;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => [...current, {
      id: Math.max(0, ...current.map(task => task.id)) + 1,
      title: trimmed, status: "TODO",
    }]);
  }
  function moveTask(id: number, status: Status) {
    setTasks(current => current.map(task => task.id === id ? { ...task, status } : task));
  }
  return <div className="scrum-board"><h1>Sprint board</h1>
    <AddTask onAdd={addTask} />
    <div>
      {statuses.map(status => <BoardColumn key={status} status={status} tasks={tasks} onMove={moveTask} />)}
    </div>
  </div>;
}
`,
  // task-editing
  `import { useState } from "react";
type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const statuses: Status[] = ["TODO", "IN PROGRESS", "DONE"];
const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

function TaskCard({ task, onMove, onUpdate, onDelete }: { task: Task; onMove: (id: number, status: Status) => void; onUpdate: (id: number, title: string) => void; onDelete: (id: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  if (editing) return <li data-task-id={task.id}>
    <label>Edit task title<input aria-label="Edit task title" value={draft} onChange={event => setDraft(event.target.value)} /></label>
    <button aria-label="Save task" onClick={() => {
      if (!draft.trim()) return;
      onUpdate(task.id, draft);
      setEditing(false);
    }}>Save task</button>
    <button aria-label="Cancel edit" onClick={() => setEditing(false)}>Cancel edit</button>
  </li>;
  return <li data-task-id={task.id}><p>{task.title}</p>
    {task.status === "TODO" && <button aria-label="Start task" onClick={() => onMove(task.id, "IN PROGRESS")}>Start</button>}
    {task.status === "IN PROGRESS" && <button aria-label="Finish task" onClick={() => onMove(task.id, "DONE")}>Finish</button>}
    {task.status === "DONE" && <button aria-label="Reopen task" onClick={() => onMove(task.id, "TODO")}>Reopen</button>}
    <button aria-label="Edit task" onClick={() => { setDraft(task.title); setEditing(true); }}>Edit</button>
    <button aria-label="Delete task" onClick={() => onDelete(task.id)}>Delete</button>
  </li>;
}

function BoardColumn({ status, tasks, onMove, onUpdate, onDelete }: { status: Status; tasks: Task[]; onMove: (id: number, status: Status) => void; onUpdate: (id: number, title: string) => void; onDelete: (id: number) => void }) {
  const columnTasks = tasks.filter(task => task.status === status);
  return <section aria-label={status}>
    <h2>{status}</h2>
    <ul>{columnTasks.map(task => <TaskCard key={task.id} task={task} onMove={onMove} onUpdate={onUpdate} onDelete={onDelete} />)}</ul>
  </section>;
}

function AddTask({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return <div>
    <label>Task title<input aria-label="Task title" value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === "Enter") handleAdd(); }} /></label>
    <button aria-label="Add task" onClick={handleAdd}>Add task</button>
  </div>;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => [...current, {
      id: Math.max(0, ...current.map(task => task.id)) + 1,
      title: trimmed, status: "TODO",
    }]);
  }
  function moveTask(id: number, status: Status) {
    setTasks(current => current.map(task => task.id === id ? { ...task, status } : task));
  }
  function updateTask(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => current.map(task => task.id === id ? { ...task, title: trimmed } : task));
  }
  function removeTask(id: number) {
    setTasks(current => current.filter(task => task.id !== id));
  }
  return <div className="scrum-board"><h1>Sprint board</h1>
    <AddTask onAdd={addTask} />
    <div>
      {statuses.map(status => <BoardColumn key={status} status={status} tasks={tasks} onMove={moveTask} onUpdate={updateTask} onDelete={removeTask} />)}
    </div>
  </div>;
}
`,
  // use-task-board
  `import { useState } from "react";
type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const statuses: Status[] = ["TODO", "IN PROGRESS", "DONE"];
const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

function useTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => [...current, {
      id: Math.max(0, ...current.map(task => task.id)) + 1,
      title: trimmed, status: "TODO",
    }]);
  }
  function moveTask(id: number, status: Status) {
    setTasks(current => current.map(task => task.id === id ? { ...task, status } : task));
  }
  function updateTask(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => current.map(task => task.id === id ? { ...task, title: trimmed } : task));
  }
  function removeTask(id: number) {
    setTasks(current => current.filter(task => task.id !== id));
  }
  return { tasks, addTask, moveTask, updateTask, removeTask };
}

function TaskCard({ task, onMove, onUpdate, onDelete }: { task: Task; onMove: (id: number, status: Status) => void; onUpdate: (id: number, title: string) => void; onDelete: (id: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  if (editing) return <li data-task-id={task.id}>
    <label>Edit task title<input aria-label="Edit task title" value={draft} onChange={event => setDraft(event.target.value)} /></label>
    <button aria-label="Save task" onClick={() => {
      if (!draft.trim()) return;
      onUpdate(task.id, draft);
      setEditing(false);
    }}>Save task</button>
    <button aria-label="Cancel edit" onClick={() => setEditing(false)}>Cancel edit</button>
  </li>;
  return <li data-task-id={task.id}><p>{task.title}</p>
    {task.status === "TODO" && <button aria-label="Start task" onClick={() => onMove(task.id, "IN PROGRESS")}>Start</button>}
    {task.status === "IN PROGRESS" && <button aria-label="Finish task" onClick={() => onMove(task.id, "DONE")}>Finish</button>}
    {task.status === "DONE" && <button aria-label="Reopen task" onClick={() => onMove(task.id, "TODO")}>Reopen</button>}
    <button aria-label="Edit task" onClick={() => { setDraft(task.title); setEditing(true); }}>Edit</button>
    <button aria-label="Delete task" onClick={() => onDelete(task.id)}>Delete</button>
  </li>;
}

function BoardColumn({ status, tasks, onMove, onUpdate, onDelete }: { status: Status; tasks: Task[]; onMove: (id: number, status: Status) => void; onUpdate: (id: number, title: string) => void; onDelete: (id: number) => void }) {
  const columnTasks = tasks.filter(task => task.status === status);
  return <section aria-label={status}>
    <h2>{status}</h2>
    <ul>{columnTasks.map(task => <TaskCard key={task.id} task={task} onMove={onMove} onUpdate={onUpdate} onDelete={onDelete} />)}</ul>
  </section>;
}

function AddTask({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return <div>
    <label>Task title<input aria-label="Task title" value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === "Enter") handleAdd(); }} /></label>
    <button aria-label="Add task" onClick={handleAdd}>Add task</button>
  </div>;
}

export default function App() {
  const { tasks, addTask, moveTask, updateTask, removeTask } = useTaskBoard();
  return <div className="scrum-board"><h1>Sprint board</h1>
    <AddTask onAdd={addTask} />
    <div>
      {statuses.map(status => <BoardColumn key={status} status={status} tasks={tasks} onMove={moveTask} onUpdate={updateTask} onDelete={removeTask} />)}
    </div>
  </div>;
}
`,
  // board-context
  `import { useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const statuses: Status[] = ["TODO", "IN PROGRESS", "DONE"];
const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

function useTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => [...current, {
      id: Math.max(0, ...current.map(task => task.id)) + 1,
      title: trimmed, status: "TODO",
    }]);
  }
  function moveTask(id: number, status: Status) {
    setTasks(current => current.map(task => task.id === id ? { ...task, status } : task));
  }
  function updateTask(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => current.map(task => task.id === id ? { ...task, title: trimmed } : task));
  }
  function removeTask(id: number) {
    setTasks(current => current.filter(task => task.id !== id));
  }
  return { tasks, addTask, moveTask, updateTask, removeTask };
}

const TaskContext = createContext<ReturnType<typeof useTaskBoard> | null>(null);
function TasksProvider({ children }: { children: ReactNode }) {
  const board = useTaskBoard();
  return <TaskContext.Provider value={board}>{children}</TaskContext.Provider>;
}
function useTasks() {
  const board = useContext(TaskContext);
  if (!board) throw Error("useTasks needs a TasksProvider");
  return board;
}

function TaskCard({ task }: { task: Task }) {
  const { moveTask: onMove, updateTask: onUpdate, removeTask: onDelete } = useTasks();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  if (editing) return <li data-task-id={task.id}>
    <label>Edit task title<input aria-label="Edit task title" value={draft} onChange={event => setDraft(event.target.value)} /></label>
    <button aria-label="Save task" onClick={() => {
      if (!draft.trim()) return;
      onUpdate(task.id, draft);
      setEditing(false);
    }}>Save task</button>
    <button aria-label="Cancel edit" onClick={() => setEditing(false)}>Cancel edit</button>
  </li>;
  return <li data-task-id={task.id}><p>{task.title}</p>
    {task.status === "TODO" && <button aria-label="Start task" onClick={() => onMove(task.id, "IN PROGRESS")}>Start</button>}
    {task.status === "IN PROGRESS" && <button aria-label="Finish task" onClick={() => onMove(task.id, "DONE")}>Finish</button>}
    {task.status === "DONE" && <button aria-label="Reopen task" onClick={() => onMove(task.id, "TODO")}>Reopen</button>}
    <button aria-label="Edit task" onClick={() => { setDraft(task.title); setEditing(true); }}>Edit</button>
    <button aria-label="Delete task" onClick={() => onDelete(task.id)}>Delete</button>
  </li>;
}

function BoardColumn({ status }: { status: Status }) {
  const { tasks } = useTasks();
  const columnTasks = tasks.filter(task => task.status === status);
  return <section aria-label={status}>
    <h2>{status}</h2>
    <ul>{columnTasks.map(task => <TaskCard key={task.id} task={task} />)}</ul>
  </section>;
}

function AddTask() {
  const { addTask: onAdd } = useTasks();
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return <div>
    <label>Task title<input aria-label="Task title" value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === "Enter") handleAdd(); }} /></label>
    <button aria-label="Add task" onClick={handleAdd}>Add task</button>
  </div>;
}

function Board() {
  return <div className="scrum-board"><h1>Sprint board</h1>
    <AddTask />
    <div>
      {statuses.map(status => <BoardColumn key={status} status={status} />)}
    </div>
  </div>;
}

export default function App() {
  return <TasksProvider><Board /></TasksProvider>;
}
`,
  // board-search
  `import { useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const statuses: Status[] = ["TODO", "IN PROGRESS", "DONE"];
const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

function useTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => [...current, {
      id: Math.max(0, ...current.map(task => task.id)) + 1,
      title: trimmed, status: "TODO",
    }]);
  }
  function moveTask(id: number, status: Status) {
    setTasks(current => current.map(task => task.id === id ? { ...task, status } : task));
  }
  function updateTask(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => current.map(task => task.id === id ? { ...task, title: trimmed } : task));
  }
  function removeTask(id: number) {
    setTasks(current => current.filter(task => task.id !== id));
  }
  return { tasks, addTask, moveTask, updateTask, removeTask };
}

const TaskContext = createContext<ReturnType<typeof useTaskBoard> | null>(null);
function TasksProvider({ children }: { children: ReactNode }) {
  const board = useTaskBoard();
  return <TaskContext.Provider value={board}>{children}</TaskContext.Provider>;
}
function useTasks() {
  const board = useContext(TaskContext);
  if (!board) throw Error("useTasks needs a TasksProvider");
  return board;
}

function TaskCard({ task }: { task: Task }) {
  const { moveTask: onMove, updateTask: onUpdate, removeTask: onDelete } = useTasks();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  if (editing) return <li data-task-id={task.id}>
    <label>Edit task title<input aria-label="Edit task title" value={draft} onChange={event => setDraft(event.target.value)} /></label>
    <button aria-label="Save task" onClick={() => {
      if (!draft.trim()) return;
      onUpdate(task.id, draft);
      setEditing(false);
    }}>Save task</button>
    <button aria-label="Cancel edit" onClick={() => setEditing(false)}>Cancel edit</button>
  </li>;
  return <li data-task-id={task.id}><p>{task.title}</p>
    {task.status === "TODO" && <button aria-label="Start task" onClick={() => onMove(task.id, "IN PROGRESS")}>Start</button>}
    {task.status === "IN PROGRESS" && <button aria-label="Finish task" onClick={() => onMove(task.id, "DONE")}>Finish</button>}
    {task.status === "DONE" && <button aria-label="Reopen task" onClick={() => onMove(task.id, "TODO")}>Reopen</button>}
    <button aria-label="Edit task" onClick={() => { setDraft(task.title); setEditing(true); }}>Edit</button>
    <button aria-label="Delete task" onClick={() => onDelete(task.id)}>Delete</button>
  </li>;
}

function BoardColumn({ status, query }: { status: Status; query: string }) {
  const { tasks } = useTasks();
  const columnTasks = tasks.filter(task => task.status === status);
  const visibleTasks = columnTasks.filter(task => task.title.toLowerCase().includes(query.trim().toLowerCase()));
  return <section aria-label={status}>
    <h2>{status}</h2>
    <p aria-label="Task count">{columnTasks.length} tasks</p>
    <ul>{visibleTasks.map(task => <TaskCard key={task.id} task={task} />)}</ul>
    {visibleTasks.length === 0 && <p>No matching tasks</p>}
  </section>;
}

function AddTask() {
  const { addTask: onAdd } = useTasks();
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return <div>
    <label>Task title<input aria-label="Task title" value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === "Enter") handleAdd(); }} /></label>
    <button aria-label="Add task" onClick={handleAdd}>Add task</button>
  </div>;
}

function Board() {
  const [query, setQuery] = useState("");
  return <div className="scrum-board"><h1>Sprint board</h1>
    <AddTask />
    <label>Search tasks<input aria-label="Search tasks" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <div>
      {statuses.map(status => <BoardColumn key={status} status={status} query={query} />)}
    </div>
  </div>;
}

export default function App() {
  return <TasksProvider><Board /></TasksProvider>;
}
`,
  // board-effects
  `import { useState, createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const statuses: Status[] = ["TODO", "IN PROGRESS", "DONE"];
const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

function useTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => [...current, {
      id: Math.max(0, ...current.map(task => task.id)) + 1,
      title: trimmed, status: "TODO",
    }]);
  }
  function moveTask(id: number, status: Status) {
    setTasks(current => current.map(task => task.id === id ? { ...task, status } : task));
  }
  function updateTask(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => current.map(task => task.id === id ? { ...task, title: trimmed } : task));
  }
  function removeTask(id: number) {
    setTasks(current => current.filter(task => task.id !== id));
  }
  return { tasks, addTask, moveTask, updateTask, removeTask };
}

const TaskContext = createContext<ReturnType<typeof useTaskBoard> | null>(null);
function TasksProvider({ children }: { children: ReactNode }) {
  const board = useTaskBoard();
  return <TaskContext.Provider value={board}>{children}</TaskContext.Provider>;
}
function useTasks() {
  const board = useContext(TaskContext);
  if (!board) throw Error("useTasks needs a TasksProvider");
  return board;
}

function TaskCard({ task }: { task: Task }) {
  const { moveTask: onMove, updateTask: onUpdate, removeTask: onDelete } = useTasks();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  if (editing) return <li data-task-id={task.id}>
    <label>Edit task title<input aria-label="Edit task title" value={draft} onChange={event => setDraft(event.target.value)} /></label>
    <button aria-label="Save task" onClick={() => {
      if (!draft.trim()) return;
      onUpdate(task.id, draft);
      setEditing(false);
    }}>Save task</button>
    <button aria-label="Cancel edit" onClick={() => setEditing(false)}>Cancel edit</button>
  </li>;
  return <li data-task-id={task.id}><p>{task.title}</p>
    {task.status === "TODO" && <button aria-label="Start task" onClick={() => onMove(task.id, "IN PROGRESS")}>Start</button>}
    {task.status === "IN PROGRESS" && <button aria-label="Finish task" onClick={() => onMove(task.id, "DONE")}>Finish</button>}
    {task.status === "DONE" && <button aria-label="Reopen task" onClick={() => onMove(task.id, "TODO")}>Reopen</button>}
    <button aria-label="Edit task" onClick={() => { setDraft(task.title); setEditing(true); }}>Edit</button>
    <button aria-label="Delete task" onClick={() => onDelete(task.id)}>Delete</button>
  </li>;
}

function BoardColumn({ status, query }: { status: Status; query: string }) {
  const { tasks } = useTasks();
  const columnTasks = tasks.filter(task => task.status === status);
  const visibleTasks = columnTasks.filter(task => task.title.toLowerCase().includes(query.trim().toLowerCase()));
  return <section aria-label={status}>
    <h2>{status}</h2>
    <p aria-label="Task count">{columnTasks.length} tasks</p>
    <ul>{visibleTasks.map(task => <TaskCard key={task.id} task={task} />)}</ul>
    {visibleTasks.length === 0 && <p>No matching tasks</p>}
  </section>;
}

function AddTask() {
  const { addTask: onAdd } = useTasks();
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return <div>
    <label>Task title<input aria-label="Task title" value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === "Enter") handleAdd(); }} /></label>
    <button aria-label="Add task" onClick={handleAdd}>Add task</button>
  </div>;
}

function Board() {
  const [query, setQuery] = useState("");
  const { tasks } = useTasks();
  const done = tasks.filter(task => task.status === "DONE").length;
  useEffect(() => {
    document.title = \`Sprint board — \${done} done\`;
  }, [done]);
  return <div className="scrum-board"><h1>Sprint board</h1>
    <AddTask />
    <label>Search tasks<input aria-label="Search tasks" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <div>
      {statuses.map(status => <BoardColumn key={status} status={status} query={query} />)}
    </div>
  </div>;
}

export default function App() {
  return <TasksProvider><Board /></TasksProvider>;
}
`,
  // scrum-board
  `import { useState, createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
type Status = "TODO" | "IN PROGRESS" | "DONE";
type Task = { id: number; title: string; status: Status };
const statuses: Status[] = ["TODO", "IN PROGRESS", "DONE"];
const initialTasks: Task[] = [
  { id: 1, title: "Plan sprint", status: "TODO" },
  { id: 2, title: "Build board", status: "IN PROGRESS" },
  { id: 3, title: "Ship demo", status: "DONE" },
];

function useTaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  function addTask(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => [...current, {
      id: Math.max(0, ...current.map(task => task.id)) + 1,
      title: trimmed, status: "TODO",
    }]);
  }
  function moveTask(id: number, status: Status) {
    setTasks(current => current.map(task => task.id === id ? { ...task, status } : task));
  }
  function updateTask(id: number, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(current => current.map(task => task.id === id ? { ...task, title: trimmed } : task));
  }
  function removeTask(id: number) {
    setTasks(current => current.filter(task => task.id !== id));
  }
  return { tasks, addTask, moveTask, updateTask, removeTask };
}

const TaskContext = createContext<ReturnType<typeof useTaskBoard> | null>(null);
function TasksProvider({ children }: { children: ReactNode }) {
  const board = useTaskBoard();
  return <TaskContext.Provider value={board}>{children}</TaskContext.Provider>;
}
function useTasks() {
  const board = useContext(TaskContext);
  if (!board) throw Error("useTasks needs a TasksProvider");
  return board;
}

function TaskCard({ task }: { task: Task }) {
  const { moveTask: onMove, updateTask: onUpdate, removeTask: onDelete } = useTasks();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  if (editing) return <li data-task-id={task.id}>
    <label>Edit task title<input aria-label="Edit task title" value={draft} onChange={event => setDraft(event.target.value)} /></label>
    <button aria-label="Save task" onClick={() => {
      if (!draft.trim()) return;
      onUpdate(task.id, draft);
      setEditing(false);
    }}>Save task</button>
    <button aria-label="Cancel edit" onClick={() => setEditing(false)}>Cancel edit</button>
  </li>;
  return <li data-task-id={task.id}><p>{task.title}</p>
    {task.status === "TODO" && <button aria-label="Start task" onClick={() => onMove(task.id, "IN PROGRESS")}>Start</button>}
    {task.status === "IN PROGRESS" && <button aria-label="Finish task" onClick={() => onMove(task.id, "DONE")}>Finish</button>}
    {task.status === "DONE" && <button aria-label="Reopen task" onClick={() => onMove(task.id, "TODO")}>Reopen</button>}
    <button aria-label="Edit task" onClick={() => { setDraft(task.title); setEditing(true); }}>Edit</button>
    <button aria-label="Delete task" onClick={() => onDelete(task.id)}>Delete</button>
  </li>;
}

function BoardColumn({ status, query }: { status: Status; query: string }) {
  const { tasks } = useTasks();
  const columnTasks = tasks.filter(task => task.status === status);
  const visibleTasks = columnTasks.filter(task => task.title.toLowerCase().includes(query.trim().toLowerCase()));
  return <section aria-label={status}>
    <h2>{status}</h2>
    <p aria-label="Task count">{columnTasks.length} tasks</p>
    <ul>{visibleTasks.map(task => <TaskCard key={task.id} task={task} />)}</ul>
    {visibleTasks.length === 0 && <p>No matching tasks</p>}
  </section>;
}

function AddTask() {
  const { addTask: onAdd } = useTasks();
  const [title, setTitle] = useState("");
  function handleAdd() {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  }
  return <div>
    <label>Task title<input aria-label="Task title" value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === "Enter") handleAdd(); }} /></label>
    <button aria-label="Add task" onClick={handleAdd}>Add task</button>
  </div>;
}

function Board() {
  const [query, setQuery] = useState("");
  const { tasks } = useTasks();
  const done = tasks.filter(task => task.status === "DONE").length;
  useEffect(() => {
    document.title = \`Sprint board — \${done} done\`;
  }, [done]);
  return <div className="scrum-board"><h1>Sprint board</h1>
    <AddTask />
    <label>Search tasks<input aria-label="Search tasks" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, alignItems: "start" }}>
      {statuses.map(status => <BoardColumn key={status} status={status} query={query} />)}
    </div>
  </div>;
}

export default function App() {
  return <TasksProvider><Board /></TasksProvider>;
}
`,
];
