import { test, expect } from "@playwright/test";
import { KEY, type Save } from "../../src/progression";
import { curriculum } from "../../src/curriculum";
import { assignment, codingSave } from "../fixtures/curriculum";

test.use({ viewport: { width: 1600, height: 900 } });

test("startup resumes saved work instead of replaying hint encouragement", async ({
  page,
}) => {
  const lesson = curriculum[4];
  const current = lesson.assignments[0];
  const save = codingSave();
  save.lessonId = lesson.id;
  save.assignmentId = current.id;
  save.completed = curriculum
    .slice(0, 4)
    .flatMap((item) => item.assignments.map((task) => task.id));
  save.collectedAssignments = [...save.completed, current.id];
  save.readAssignments = [...save.collectedAssignments];
  save.settings.graphicsQuality = 0;
  save.projects[current.id] = {
    files: {
      "App.tsx": "// keep this draft",
      "tasks.ts": "export const tasks = [];",
    },
    activeFile: "App.tsx",
  };
  save.story[current.id] = {
    delivery: "ready",
    current: { event: "hint", page: 1, detail: `Hint 1: ${current.hints[0]}` },
    seen: ["monitor", "paper", "help", "typing", "run"],
    pending: [],
  };
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  const dialogue = page.getByRole("region", {
    name: "Conversation with B.U.G.",
  });
  await expect(dialogue).toHaveAttribute("data-story-event", "resume");
  await expect(dialogue).toContainText(
    `Welcome back, human. We were working on ${current.title}.`,
  );
  await page.locator('[data-surface="crt-glass"]').click();
  await expect(
    page
      .frameLocator('iframe[title="Code editor"]')
      .getByLabel("Your React code"),
  ).toHaveText("// keep this draft");
  await page.getByRole("button", { name: "Ask B.U.G. for a hint" }).click();
  await expect(dialogue).toContainText(`Hint 1: ${current.hints[0]}`);
  await page.getByRole("button", { name: "Continue B.U.G. dialogue" }).click();
  await expect(dialogue).toContainText(
    "You still need an occasional hint. Good. I mean: good use of the available expertise.",
  );
  await page.reload();
  await expect(dialogue).toHaveAttribute("data-story-event", "resume");
  await expect(dialogue).not.toContainText("occasional hint");
  const restored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!) as Save,
    KEY,
  );
  expect(restored.assignmentId).toBe(current.id);
  expect(restored.projects).toEqual(save.projects);
  expect(restored.completed).toEqual(save.completed);
  expect(restored.collectedAssignments).toEqual(save.collectedAssignments);
  expect(restored.readAssignments).toEqual(save.readAssignments);
  expect(restored.story[current.id].delivery).toBe("ready");
  await expect(
    page.getByRole("button", { name: /^Grab new assignment:/ }),
  ).toHaveCount(0);
});

test("clicking the supervisor gives successive hints without leaving the computer", async ({
  page,
}) => {
  const save = codingSave("// keep this draft");
  save.settings.graphicsQuality = 0;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  const dialogue = page.getByRole("region", {
    name: "Conversation with B.U.G.",
  });
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await expect(editor).toBeFocused();
  await expect(
    page.getByRole("menuitem", { name: "Hint", exact: true }),
  ).toHaveCount(0);
  await page.screenshot({ path: "test-results/robot-hint-target.png" });
  // The visible left side of the supervisor, beside the zoomed-in monitor.
  await page.mouse.click(1530, 250);
  await expect(page.locator("main")).toHaveClass(/focused/);
  await expect(dialogue).toContainText(`Hint 1: ${assignment.hints[0]}`);
  const ask = page.getByRole("button", { name: "Ask B.U.G. for a hint" });
  await ask.click();
  await expect(dialogue).toContainText(`Hint 2: ${assignment.hints[1]}`);
  await expect(editor).toHaveText("// keep this draft");
  await ask.focus();
  for (let index = 2; index < assignment.hints.length; index++)
    await ask.press("Enter");
  await expect(dialogue).toContainText(
    `Hint ${assignment.hints.length}: ${assignment.hints.at(-1)}`,
  );
  await ask.press("Enter");
  await expect(dialogue).toContainText(`Hint 1: ${assignment.hints[0]}`);
  await ask.press("Enter");
  await expect(dialogue).toContainText(`Hint 2: ${assignment.hints[1]}`);
  await expect(page.locator("main")).toHaveClass(/focused/);
  // Other parts of the room still leave computer mode.
  await page.mouse.click(20, 20);
  await expect(page.locator("main")).not.toHaveClass(/focused/);
  await expect(ask).toHaveCount(0);
});
