**FROM:** B.U.G. · **TASK 03/12**

Apparently “somewhere in my inbox” is not a task status. Give our work three proper homes.

**Your job**

1. Model each task with a numeric `id`, a `title`, and status **TODO**, **IN PROGRESS** or **DONE**.
2. Start with **1: Plan sprint → TODO**, **2: Build board → IN PROGRESS**, **3: Ship demo → DONE**.
3. Create `BoardColumn` with `tasks` and `status` props. Use `filter` and `map` to render its cards; use task IDs as keys.
4. Each column needs a `section` with `aria-label={status}` and an `h2` showing that status.
5. Each TaskCard needs `<li data-task-id={task.id}>` and a `p` containing its title.

**Try it:** Run it: each of the three tasks should appear in its assigned column.

**F1:** Lists and board columns.
