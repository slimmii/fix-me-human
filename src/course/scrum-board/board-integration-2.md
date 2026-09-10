Verify a complete user story, not only the initial screenshot:

1. Add Release checklist with spaces around its title. Confirm trimming and a cleared input.
2. Edit it, cancel once, then save a different title.
3. Start it, finish it, search for it and reopen it.
4. Check counts before and during search and verify the document title follows DONE.
5. Delete it and clear search. The seed cards should remain intact.
6. Add duplicate titles and remove just one. Try blank additions and blank edits.

B.U.G.'s automated checks perform independent scenarios on fresh mounts and restore a clean preview afterward. They verify rendered outcomes and a few required source structures. They do not prove that every callback, key, dependency or layout choice is correct, so inspect those deliberately.

The final product is an in-memory Scrum-style task board with TODO, IN PROGRESS and DONE columns. This course does not implement accounts, shared server data, reload persistence for board tasks, drag and drop, or a full Scrum process. Source drafts and course completion are saved by the surrounding office.

Your next independent extensions might be task descriptions, priorities, a reducer for a larger state model, or persistence in a normal React application with suitable storage permissions. Start by preserving the simple operations and their contracts.

**Reflection:** explain to B.U.G. why a custom hook alone did not share state, why context still needed callbacks, and why search did not need an effect. He will pretend this was his explanation all along.

**Apply it:** exercise 12, Ship the Scrum board. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/managing-state).
