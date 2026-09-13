**FROM:** B.U.G. · **TASK 08/11**

We need proof that work actually moves. I used to provide that proof verbally. Nobody appreciated the confidence.

**Your job**

1. Keep tasks in App. Pass `onMove(id, status)` through BoardColumn to TaskCard.
2. TODO cards: **Start task** moves to IN PROGRESS.
3. IN PROGRESS cards: **Finish task** moves to DONE.
4. DONE cards: **Reopen task** moves back to TODO.
5. Use those action names as button `aria-label`s. Update the matching ID with `map` and object spread; keep other tasks unchanged.

Update the prop interfaces in TaskCard.tsx and BoardColumn.tsx as callbacks pass through them. Import TaskStatus from tasks.ts wherever a callback needs it.

Keep the query in App and preserve the search input, query prop, counts and empty messages. Move tasks in the full saved array, using their IDs. Derive each column's total and visible cards again after the update; moving a card must not clear the query.

**Try it:** Search for “plan”, move Plan sprint through all three columns and reopen it. The matching card should follow its status, and counts should include hidden tasks. Clear search to reveal the unchanged neighbors. Adding tasks must still work.

**F1:** Callbacks and shared state.
