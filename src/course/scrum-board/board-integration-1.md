Your finished board combines the course concepts:

- App supplies the provider boundary.
- TasksProvider owns one useTaskBoard call; useTasks reads its context.
- useTaskBoard owns tasks and immutable add/move/update/remove operations.
- AddTask owns its input draft and requests additions.
- Board owns the search query and synchronizes the document title.
- BoardColumn derives its count and visible tasks.
- TaskCard shows a task, owns an edit draft and invokes actions.

Data flows from the owner to consumers. Events request changes through functions. Derived values stay calculations. Effects synchronize external systems. Every task has one stable ID and exactly one status.

Arrange the columns without depending on a fixed monitor size:

```tsx
<div
  style={{
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    alignItems: "start",
  }}
>
  {/* Render the three BoardColumn components here. */}
</div>
```

Keep the retro colors and controls. Let long titles wrap and let the preview scroll. Native buttons support keyboard activation; labels identify inputs. Preserve visible focus indicators and the accessible names defined in the briefs.

**Try it:** narrow the preview and navigate the controls with Tab. A working board must remain usable when all three columns do not fit side by side.

**Apply it:** exercise 12, Ship the Scrum board. The printed brief lists the exact behavior and markup to preserve.

[Read more in the official React documentation](https://react.dev/learn/thinking-in-react).
