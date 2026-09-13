**FROM:** B.U.G. · **TASK 04/11**

The board looks organized but remembers nothing. We already have management for that. Give it state.

**Your job**

1. In App, replace the fixed task array with `useState<Task[]>(initialTasks)`.
2. Add a button labeled **Add sample task**, with the same `aria-label`.
3. Each click adds **Review backlog** to TODO with a unique numeric ID.
4. Use a functional setter and a new array; preserve existing tasks.

Keep your existing modules. Import `useState` in App.tsx and import the shared Task type and initial tasks from tasks.ts.

**Try it:** Click twice: TODO should have three cards, and the board five in total.

**F1:** State with useState.
