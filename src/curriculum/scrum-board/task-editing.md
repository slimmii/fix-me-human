**FROM:** B.U.G. · **TASK 07/12**

Tasks need corrections and removal. Practice on the cards, please. My position in the org chart is not a typo.

**Your job**

1. Add **Edit task** and **Delete task** buttons to each card, using those `aria-label`s.
2. Edit opens a controlled input labeled `aria-label="Edit task title"`, starting with the saved title.
3. Add **Save task** and **Cancel edit** buttons with matching `aria-label`s. Keep the edit draft local to TaskCard.
4. Save trims and updates only that ID through a parent callback. Blank saves keep editing open; Cancel preserves the saved title.
5. Delete removes only that ID with `filter`. Preserve adding and moving.

**Try it:** Edit, cancel, save, then delete one of two identically named tasks. Its twin must survive.

**F1:** Immutable editing and deletion.
