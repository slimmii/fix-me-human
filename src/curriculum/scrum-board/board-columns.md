**FROM:** B.U.G. · **TASK 03/12**

Apparently “somewhere in my inbox” is not a task status. Give our work three proper homes.

**Your job**

1. Define a Task: it contains a numeric `id`, a `title`, and a `status`. The status must only allow **TODO**, **IN PROGRESS**, or **DONE**.
2. Create an array of three tasks: **1: Plan sprint → TODO**, **2: Build board → IN PROGRESS**, and **3: Ship demo → DONE**.
3. Create `BoardColumn` with `tasks` and `status` props. Render one column for each status, passing the array of **all tasks** to each `BoardColumn`'s `tasks` prop. Inside `BoardColumn`, use `filter` to select that column's tasks and `map` to render its cards; use task IDs as keys.
4. Each column needs a `section` with `aria-label={status}` and an `h2` showing that status.
5. Update `TaskCard` to receive an entire Task object through a `task` prop instead of just a title. When mapping tasks in `BoardColumn`, pass each task object to its `TaskCard`. Each card needs `<li data-task-id={task.id}>` and a `p` containing the task's title.

**Try it:** Run it: each of the three tasks should appear in its assigned column.

**F1:** Lists and identity.
