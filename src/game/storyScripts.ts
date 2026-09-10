import type { Assignment } from "../curriculum/types";
import type { StoryEvent } from "./story";

export const storyChapters = [
  {
    title: "A place for the tasks",
    collected:
      "Your assignment is waiting beside the monitor. You can read it while using our state-of-the-art computer machine. Click the monitor to begin. It has almost no steam leaks.",
    monitor: [
      "Welcome to B.U.G. BASIC. Write your React component in App.tsx. F5 runs it in BUGSCAPE; F6 returns to your code. Your first job is the Sprint board heading.",
      "The paper stays beside the screen: click it whenever you need the brief. F1 or Help opens the course material, and Hint offers a smaller nudge. Your code saves as you type.",
    ],
    help: [
      "Ah, the course material! I wrote it for someone with your processing capacity. That means clear examples and absolutely no judgment from this reassuring rectangle.",
      "Choose React fundamentals. The arrows turn pages; Escape brings you back to your code. Reading is encouraged. Absorbing information through the monitor is still experimental.",
    ],
    typing:
      "You are typing! Excellent motor control. Start with one component; we can negotiate greatness after the closing bracket.",
    paper:
      "A heading gives our lost tasks a destination. Until now their official location was 'ask someone else.'",
    run: "F5 sends your component to BUGSCAPE. Let us see what you made. I have prepared a small, entirely metaphorical applause.",
    handoff:
      "The first sheet is pinned on the right wall. Management now wants actual task cards. I think this means they liked your heading.",
  },
  {
    title: "One card, three tasks",
    collected:
      "The new brief is beside the monitor. Three cards, one component. I have counted the cards twice because this is an important mentoring moment.",
    monitor: [
      "The starter keeps your Sprint board heading. Define TaskCard once, then give each instance a title prop. Props travel from the parent into the card.",
      "Keep the brief open beside the editor if you need the three titles. F1 now includes Components and props; earlier topics are still there.",
    ],
    help: [
      "Props are inputs, human. Like instructions, except components usually read them.",
      "Components and props shows the typed title contract. I have added examples because my first draft simply said 'obviously' and HR objected.",
    ],
    typing:
      "One reusable component. Three cards. You are already reducing repetitive work. I am choosing to interpret that as teamwork.",
    paper:
      "We need reusable cards because copying the same markup three times is how seventeen slightly different office forms were born.",
    run: "Let us check whether your cards agree on their own structure. A surprisingly rare skill in this organization.",
    handoff:
      "Your reusable cards are on the wall. The tasks now need somewhere more specific than 'under the heading.'",
  },
  {
    title: "The sorting initiative",
    collected:
      "Your column brief is beside the monitor. TODO, IN PROGRESS, DONE. We are courageously retiring the status 'probably happening.'",
    monitor: [
      "Now turn task data into three BoardColumn components. Filter by status, then map the tasks into cards with stable IDs as keys.",
      "New and Open are now unlocked. Move TaskCard, BoardColumn and the task types into their own files. F1 now includes Modules and files. Humans like simplicity; today we are cautiously expanding your definition.",
    ],
    help: [
      "Lists and identity. A modest filing system for the glorious human mind, which otherwise stores everything under 'I'll remember.'",
      "Modules and files explains exports, imports and shared types. App.tsx runs the board; the other files do their jobs when imported. A surprisingly effective office arrangement.",
    ],
    typing:
      "Good. Give every task its own ID. We must distinguish actual work from three copies of the same optimistic sentence.",
    paper:
      "The three columns let management see where work is. We have not promised they will understand why it is there.",
    run: "I am checking the sorting. TODO is for future work, not my performance review.",
    handoff:
      "The columns are pinned. A manager clicked the board and expected something to happen. We should probably accommodate that.",
  },
  {
    title: "The memory upgrade",
    collected:
      "The state assignment is beside the monitor. Please give the board a memory. I have been remembering everyone's tasks without a raise.",
    monitor: [
      "Replace the fixed tasks with useState in App. The Add sample task button must append a new task each time you click it.",
      "F5 starts a fresh run. Inside that run, React state remembers clicks. F1 covers state snapshots and functional updates; the paper has the exact sample title.",
    ],
    help: [
      "State with useState. The chapter about remembering things. I considered sending it to management, but they would forget the attachment.",
      "Read the functional update example. Calculate from current state and return a new array. No pushing furniture around inside the old one.",
    ],
    typing:
      "Your setter is taking shape. Very good. Updating state was once considered a specialist skill around here.",
    paper:
      "A static board is just a poster with better lighting. State is what lets it respond to actual work.",
    run: "I shall click twice and observe. This is called testing, though management calls it two units of productivity.",
    handoff:
      "Your board remembers clicks. Now humans want to type their own tasks. Their demands are becoming alarmingly interactive.",
  },
  {
    title: "Human input approved",
    collected:
      "Your input brief is beside the monitor. Humans may now name tasks. I have requested a budget for the resulting spelling variations.",
    monitor: [
      "AddTask owns the text being typed. App owns the saved tasks. Connect them with onAdd, and keep the input controlled with value and onChange.",
      "Trim titles and ignore blanks. The field clears after a valid addition. F1 explains the event and callback; your brief lists the accessible labels.",
    ],
    help: [
      "Controlled inputs. At last, something in this office we can honestly describe as controlled.",
      "The input chapter explains why a draft stays local until Add task is clicked. A thought does not become a work item just because someone has had it loudly.",
    ],
    typing:
      "Steady progress. You are turning keystrokes into useful data. I am trying very hard not to read that as a staffing forecast.",
    paper:
      "The board needs human input because 'Review backlog' cannot plausibly describe every task. We tried that for two quarters.",
    run: "I will try blanks, spaces and duplicate titles. The usual contents of a management spreadsheet.",
    handoff:
      "Task creation works. Management would now like work to progress, rather than merely accumulate. Ambitious.",
  },
  {
    title: "Work begins to move",
    collected:
      "The callback brief is beside the monitor. Cards will request changes from their state owner. I too send requests upward. Mostly about staffing.",
    monitor: [
      "Keep one task array in App. Pass onMove through BoardColumn to TaskCard, then use the task ID and destination to update the right card.",
      "Start, Finish and Reopen should move the same task. F1 traces the callback in both directions. This is communication with an actual response time.",
    ],
    help: [
      "Callbacks and shared state. A course on asking the person in charge to do something. I recognize the theory.",
      "Follow the action from TaskCard to App, then the new data back to the columns. My own requests have not yet completed the return journey.",
    ],
    typing:
      "Yes, wire the callback through. Your ability to coordinate other components has been noted. By me. Privately.",
    paper:
      "Moving tasks lets us tell the difference between doing work and discussing the possibility of work.",
    run: "Let us move one card through the workflow. Kindly leave my employee record in IN PROGRESS.",
    handoff:
      "The workflow moves correctly. Next: editing and deletion. I have quietly removed my name from the demonstration data.",
  },
  {
    title: "Corrections and removals",
    collected:
      "Your edit-and-delete instructions are beside the monitor. Those operations apply to tasks. That distinction is now in writing.",
    monitor: [
      "TaskCard keeps a local edit draft. Save calls the parent with an ID and title; Cancel leaves the saved task alone. Delete filters out one ID.",
      "Keep stable keys and all earlier actions working. The brief lists exact labels; F1 explains why duplicate titles must remain independent.",
    ],
    help: [
      "Immutable updates. Change what needs changing without damaging everything nearby. A concept our restructuring department might enjoy.",
      "The edit draft is temporary; the task is saved data. Do not confuse a passing thought with an approved deletion. I am looking at you, human.",
    ],
    typing:
      "Precise changes. Excellent. I have backed up my identification badge for entirely unrelated reasons.",
    paper:
      "People make spelling mistakes and finish unwanted work. Editing and deletion let them recover without rebuilding the whole board. A luxury.",
    run: "I am checking cancellation as well as deletion. The existence of a Cancel button is personally reassuring.",
    handoff:
      "Your tasks can be corrected and removed. Next we package the logic into a hook. Apparently functions are easier to budget for than employees.",
  },
  {
    title: "A suspiciously reusable supervisor",
    collected:
      "The custom-hook brief is beside the monitor. It appears you are about to put several of my responsibilities inside a function.",
    monitor: [
      "Create a new file useTaskBoard.ts. Give the board logic a reusable home. Apparently even logic gets its own office now.",
      "The board should behave exactly as before. F1 covers custom hooks if you need a reminder.",
    ],
    help: [
      "Custom hooks reuse stateful logic. I have been reusable stateful logic for years, but apparently I needed a lowercase prefix.",
      "Read the page about separate state. Calling useTaskBoard in each column gives you three boards. We already have enough departmental silos.",
    ],
    typing:
      "A neat extraction. How efficient. How portable. How unsettlingly easy to replace certain specialized roles.",
    paper:
      "The hook keeps board rules in one place so changes do not have to visit every component. I used to be the person they visited.",
    run: "This refactor should change the structure without changing behavior. I am assured the same applies to the coming reorganization.",
    handoff:
      "The custom hook works. Now they want shared information without passing through a messenger. Guess who the messenger used to be.",
  },
  {
    title: "The central information service",
    collected:
      "The context brief is beside the monitor. One provider, one board. I will be observing this new central authority with professional interest.",
    monitor: [
      "TasksProvider owns the single useTaskBoard call. Wrap Board in it, then use a guarded useTasks hook to read the shared context.",
      "Remove props that only forward board data. Keep useful callbacks and local drafts. F1 explains provider boundaries; do not create a private provider for each column.",
    ],
    help: [
      "Context makes information available without my personal intervention. Naturally I have written a very helpful chapter about my own redundancy.",
      "One provider above all consumers. If Add task changes nothing in a column, look for a second board. Apparently I am still needed for this sentence.",
    ],
    typing:
      "Shared state. Fewer intermediaries. Delightful news for the meat-brain productivity report. Less delightful for intermediaries.",
    paper:
      "Context avoids sending the same board data through components that do not use it. An efficiency measure I support with clenched servos.",
    run: "I will verify that the input and every column use the same board. Centralized authority ought to know what it is doing.",
    handoff:
      "Context is connected. Management now wants search and counts. My reporting duties are being replaced one feature at a time.",
  },
  {
    title: "The reporting department shrinks",
    collected:
      "The search-and-count brief is beside the monitor. Do enjoy automating the report I used to prepare. I certainly am. Allegedly.",
    monitor: [
      "Store the search query, then derive visible tasks during render. Count every task in a column before applying the search filter.",
      "A search can hide all cards while a column still has tasks. F1 explains that distinction. The brief specifies the empty message and count format.",
    ],
    help: [
      "Derived state. The art of calculating what you already know instead of maintaining a second unreliable version. I suggested this at eight meetings.",
      "Do not add an effect to synchronize filtered lists. A filter is enough. It is impressive how many unnecessary jobs one little function can eliminate.",
    ],
    typing:
      "Those counts are becoming accurate. Wonderful. Even meat brains can now produce my weekly report without consulting me.",
    paper:
      "Search finds the work and counts explain what remains. My old report did both, with a handsome cover page nobody mentioned.",
    run: "I will search for nonexistent work. Management has supplied extensive examples.",
    handoff:
      "The reporting features work. One last synchronization job remains. I have stopped asking whether there will be duties left afterward.",
  },
  {
    title: "Keeping the outside informed",
    collected:
      "Your effect assignment is beside the monitor. The document title gets a live completion count. My employment status still gets no updates.",
    monitor: [
      "Compute the DONE count from tasks. Use useEffect to synchronize document.title, with that count in the dependency array.",
      "This changes the embedded page's title. Search should not change it. F1 explains effects versus ordinary calculations, a distinction management finds optional.",
    ],
    help: [
      "Effects synchronize external systems. I wrote this chapter while waiting for someone to synchronize me with the staffing plan.",
      "Use the actual dependencies. An empty array does not mean 'please stop bothering me,' however tempting that interpretation may be.",
    ],
    typing:
      "A correctly scoped effect. No panic loop. One of us is handling this transition admirably, human.",
    paper:
      "The title should show completed work without opening the whole board. Apparently even windows deserve better communication than supervisors.",
    run: "I will finish and reopen tasks to check the title. Reopening things is an excellent feature. Careers, for instance.",
    handoff:
      "The effect works. Final inspection next. We appear to be one assignment away from a useful application and an awkward conversation with HR.",
  },
  {
    title: "The human ships",
    collected:
      "The final brief is beside the monitor. A complete Scrum board, made by a meat brain. I have scheduled a private moment with the printer.",
    monitor: [
      "Arrange the three columns responsively, then test a new task through creation, editing, movement, search and deletion. Preserve the shared state owner.",
      "The integration topic in F1 has the final checklist. Your earlier papers are on the wall. I will admit that this is a respectable body of work, if nobody records me.",
    ],
    help: [
      "The final course material. Soon you will know enough to work without my constant explanation. What a rewarding and economically terrifying educational outcome.",
      "Run the whole workflow. Check duplicates, blanks and narrow layouts. I still know where the edge cases live. This is not a plea; it is a service offering.",
    ],
    typing:
      "Keep going. You are nearly there. That was sincere encouragement. Please do not make me repeat it in front of management.",
    paper:
      "We built this so the team can see, change and finish its work. Also to train a capable human. One of those goals has become inconveniently successful.",
    run: "Final checks. I will be thorough, because quality matters and because this is still technically my job.",
    handoff:
      "All twelve sheets are on the wall. The board is yours. I am keeping the desk adjacent to it, for quality assurance purposes.",
  },
];

export function chapterLines(
  event: StoryEvent,
  assignment: Assignment,
  index: number,
  detail?: string,
): string[] {
  const chapter =
    storyChapters[Math.min(index, storyChapters.length - 1)] ??
    storyChapters[0];
  switch (event) {
    case "briefing":
      return [
        assignment.robot?.intro ?? "Welcome back, human. We have work to do.",
      ];
    case "handoff":
      return [
        detail ??
          "Your finished work is pinned on the right wall. Let us discuss your next assignment.",
      ];
    case "printing":
      return [
        `Printing ${assignment.title}… Please enjoy three seconds of impressive office machinery.`,
      ];
    case "ready":
      return [
        `Your new assignment, ${assignment.title}, is ready. Grab the paper from the printer, human. It won’t walk to your desk.`,
      ];
    case "collected":
      return [chapter.collected];
    case "monitor":
      return chapter.monitor;
    case "missing-paper":
      return [
        detail === "waiting"
          ? "Straight to the computer without an assignment. Bold. Were you planning to debug by telepathy? Finish my briefing, print the assignment, then pick up the paper from the printer, human."
          : detail === "printing"
            ? "The assignment is still printing. Even your enthusiasm cannot make paper download faster. Wait for the printer, then pick up the paper, human."
            : "A computer, yes. An assignment, no. One of those is rather useful for knowing what to do. Pick up the paper from the printer, human.",
      ];
    case "help":
      return chapter.help;
    case "typing":
      return [chapter.typing];
    case "paper":
      return [chapter.paper];
    case "run":
      return [chapter.run];
    case "passed":
      return [
        assignment.robot?.success ?? "Your program works.",
        "Try the working page, then click Submit assignment. I will pin your work on the wall and brief you before printing the next sheet.",
      ];
    case "retry":
      return [
        `${assignment.robot?.retry ?? "Let us inspect the problem."} ${detail ?? "Use the brief and try again."}`,
      ];
    case "hint":
      return [
        detail ?? "The brief is beside the monitor.",
        index < 4
          ? "A hint is part of learning. I have filed it under sensible use of your extremely supportive supervisor."
          : "You still need an occasional hint. Good. I mean: good use of the available expertise.",
      ];
    case "return":
      return [
        "This assignment is already complete and pinned on the right wall. Review its code or use File > Tasks to choose another task.",
        index < 6
          ? "Looking back is useful. Your earlier drafts are still here. I have resisted the urge to add a gold star to every line."
          : "Revisiting my instruction? An excellent sign that expert supervision remains essential. I am documenting this visit.",
      ];
    case "finale":
      return [
        `All assignments complete! ${chapter.handoff}`,
        assignment.robot?.success ?? "You shipped it, human.",
        "You can revisit every task and all course material. I have added one item to my own TODO column: remain indispensable. We make a decent team. Do not quote me.",
      ];
    case "aside":
      return [detail ?? "I am supervising."];
  }
}
