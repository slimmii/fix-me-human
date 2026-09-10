Choose where work belongs based on what causes it:

- An **event handler** handles a user action, such as confirming a name or removing an item.
- A **render calculation** filters a list, counts its entries or chooses which button to display.
- An **effect** keeps an external system, such as the document title, synchronized with the current data.

An effect can depend on a calculated number. Calculate that number from the relevant saved data during render, read it in the effect, and include it in the dependency array. If it describes a collection total, a search query should not change the number's source.

Dependencies follow the reactive values the effect uses. An effect reading `city` depends on `city`; one reading a calculated `total` depends on `total`. Do not omit a dependency to suppress updates. Avoid an effect that sets state only to calculate another value from existing state.

Some effects create ongoing work, such as a subscription or timer. Those return a cleanup function that stops the old work before setup runs again and when the component is removed. The title assignment creates no ongoing resource, so it needs no such cleanup. React's development checks can repeat setup and cleanup; effects should handle that safely.

Keep user actions in their handlers. An effect watching an input is not a substitute for a confirmation button: typing and confirming are different events.
