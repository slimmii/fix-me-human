**FROM:** B.U.G. · **TASK 03/11**

Apparently “somewhere in my inbox” is not a task status. Give our work three proper homes.

**Your job**

1. Define `TaskStatus` as a union of **TODO**, **IN PROGRESS**, and **DONE**. Define a Task with a numeric `id`, a `title`, and a `status` of that type.
2. Create an `initialTasks` array of three tasks: **1: Plan sprint → TODO**, **2: Build board → IN PROGRESS**, and **3: Ship demo → DONE**.
3. Create a `statuses` array containing the three allowed statuses and a `BoardColumn` component with `tasks` and `status` props. Render one column for each status, passing the array of **all tasks** to each `BoardColumn`'s `tasks` prop. Inside `BoardColumn`, use `filter` to select that column's tasks and `map` to render its cards; use task IDs as keys.
4. Each column needs a `section` with `aria-label={status}` and an `h2` showing that status.
5. Update `TaskCard` to receive an entire Task object through a `task` prop instead of just a title. When mapping tasks in `BoardColumn`, pass each task object to its `TaskCard`. Each card needs `<li data-task-id={task.id}>` and a `p` containing the task's title.

Keep all types, data and components in App.tsx for this assignment. Preserve the heading and your subtitle paragraph above the columns.

The browser automatically arranges the status sections into columns and stacks them on narrow screens.
