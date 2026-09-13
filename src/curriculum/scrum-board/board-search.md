**FROM:** B.U.G. · **TASK 10/11**

Management wants to find work and count it. Two skills I once thought would secure my pension.

**Your job**

1. Add a controlled input with `aria-label="Search tasks"`.
2. Filter titles case-insensitively and trim the query. Clearing it restores all cards.
3. In each column, show **N tasks** in a `p` with `aria-label="Task count"`. Count all its tasks before filtering; use this format even for 1.
4. When no cards match in a column, show **No matching tasks**.
5. Store only the query. Derive filtered lists and counts during render, without an effect.

Keep the query in Board.tsx and pass it to BoardColumn.tsx. Preserve your existing component, hook and shared-type modules.

**Try it:** Search for “ BUILD ”, then something nonexistent. Counts should stay accurate; clearing search restores the board.

**F1:** Search and derived state.
