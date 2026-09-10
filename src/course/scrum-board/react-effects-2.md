Dependencies describe the values your effect reads; they are not a switch for suppressing updates you dislike. If an effect reads tasks directly, it depends on tasks. Our effect reads a derived number, so [done] captures what it uses.

Some effects acquire resources: subscriptions, timers or event listeners. Those need a returned cleanup function to release the previous resource before re-synchronizing and when unmounting. Assigning this preview's owned title acquires no continuing resource, so this exercise needs no cleanup. In a shared document, an application may choose to restore a previous title when a screen closes.

React development checks may run an extra setup/cleanup cycle to reveal missing cleanup. Effects should tolerate repeated synchronization. Keep user-triggered operations such as addTask in their event handlers, not in an effect watching an input value.

For the board, filtering tasks, counting statuses and deciding which button to display are all render calculations. Only synchronizing the external document title calls for this effect.

**Try it:** classify each action: typing into a field, computing a count, updating the document title, deleting a task. Which are state updates, render calculations and external synchronization?

**Apply it:** exercise 11, Synchronize with an effect. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/lifecycle-of-reactive-effects).
