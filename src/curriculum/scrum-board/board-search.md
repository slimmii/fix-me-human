**FROM:** B.U.G. · **TASK 07/11**

Management wants to find work and count it. Two skills I once thought would secure my pension.

**Your job**

1. Keep the saved tasks in App. Add query state and a controlled input with `aria-label="Search tasks"` in App.tsx, alongside AddTask.
2. Filter titles case-insensitively and trim the query. Clearing it restores all cards.
3. In each column, show **N tasks** in a `p` with `aria-label="Task count"`. Count all its tasks before filtering; use this format even for 1.
4. When no cards match in a column, show **No matching tasks**.
5. Store only the query as new state. Derive filtered lists and counts from the saved tasks during render, without an effect. Searching must never change the saved task array.

Pass `query` from App to BoardColumn.tsx and add `query: string` to its prop interface. Each column first selects tasks by status, then filters their titles for display. Preserve your existing files and the AddTask callback.

**Try it:** Search for “ BUILD ”, then something nonexistent. With search active, add one matching title and one nonmatching title. Only the matching card appears, but the TODO count includes both additions. Clearing search restores every card. Adding a task must not clear the query.

**F1:** Search and derived state.
