**FROM:** B.U.G. · **TASK 05/12**

Humans insist on naming their own work. Fine. Build an input. I have prepared a small folder for spelling incidents.

**Your job**

1. Create `AddTask` with local `useState` for the title and an `onAdd(title)` callback to App.
2. Add a controlled input with `aria-label="Task title"` and an **Add task** button with `aria-label="Add task"`.
3. Replace the sample button. New tasks start in TODO with unique numeric IDs.
4. Trim titles, ignore blank input, and clear the field after adding. Duplicate titles are allowed.

Create `AddTask.tsx` for the new component, export it, and import it in App.tsx. Import `useState` in AddTask.tsx for its local input draft.

**Try it:** Add two tasks with the same title. Both should appear. Spaces alone should add nothing.

**F1:** Events and controlled inputs.
