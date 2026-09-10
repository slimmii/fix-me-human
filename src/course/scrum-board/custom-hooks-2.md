Calling useTaskBoard in App creates state for that call. Calling useTaskBoard separately in AddTask or in each column creates independent state for those calls. A custom hook does not magically make a global store.

For this exercise, call useTaskBoard once in App and continue passing its results through props and callbacks. In the next exercise a provider will own that one call and expose the result through context.

Return a focused API. `addTask(title)` is easier for a caller to use correctly than giving every component direct access to setTasks. Keep validation of task titles inside the operation as well as the form interaction. Pure update functions remain safe regardless of which component invokes them.

Custom hooks can reuse stateful logic across many independent boards. That independence is useful when you intend it; it is a bug when all three columns are meant to coordinate one board.

**Try it:** explain why clicking Add in one independently mounted board should not alter another. Then explain how the three columns in this project remain connected.

**Apply it:** exercise 8, Extract useTaskBoard. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/reusing-logic-with-custom-hooks).
