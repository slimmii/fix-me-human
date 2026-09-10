import { test, expect } from "@playwright/test";
import { curriculum } from "../../src/curriculum";
import { fresh, KEY } from "../../src/progression";
import { codingSave } from "../fixtures/curriculum";
import { useSimpleComputer } from "../fixtures/simple-computer";

test.beforeEach(async ({ page }) => {
  await useSimpleComputer(page);
});

test("a misspelled provider export identifies the file and name, then recovers after editing", async ({
  page,
}) => {
  const assignments = curriculum.flatMap((lesson) => lesson.assignments);
  const assignment = assignments.find((item) => item.id === "board-context")!;
  const files = { ...assignment.solutionFiles! };
  files["TasksContext.tsx"] = files["TasksContext.tsx"].replace(
    "export function TasksProvider(",
    "export function TaskProvider(",
  );
  const save = fresh();
  save.phase = "coding";
  save.lessonId = curriculum.find((lesson) =>
    lesson.assignments.includes(assignment),
  )!.id;
  save.assignmentId = assignment.id;
  save.completed = assignments
    .slice(0, assignments.indexOf(assignment))
    .map((item) => item.id);
  save.collectedAssignments = [...save.completed, assignment.id];
  save.readAssignments = [...save.collectedAssignments];
  save.settings = {
    ...save.settings,
    reducedMotion: true,
    mute: true,
    graphicsQuality: 0,
  };
  save.projects[assignment.id] = { files, activeFile: "TasksContext.tsx" };
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start", exact: true })
    .first()
    .click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await editor.press("F5");
  const error = page.getByRole("alert");
  await expect(error).toContainText(
    'App.tsx: Line 1: "TasksContext.tsx" does not export "TasksProvider"',
    { timeout: 15000 },
  );
  await expect(error).toContainText('Did you mean "TaskProvider"?');
  await expect(error).not.toContainText("Minified");
  await expect(
    page.getByRole("button", { name: "Submit assignment" }),
  ).toHaveCount(0);
  await error.screenshot({ path: "test-results/provider-name-error.png" });
  await page
    .getByRole("button", { name: "Return to editor", exact: true })
    .click();
  await expect(editor).toBeFocused();
  await editor.fill(assignment.solutionFiles!["TasksContext.tsx"]);
  await editor.press("F5");
  await expect(
    page.getByRole("button", { name: "Submit assignment" }),
  ).toBeVisible({ timeout: 15000 });
});

test("undefined components and invalid component values show readable runtime guidance", async ({
  page,
}) => {
  const save = codingSave();
  save.settings.graphicsQuality = 0;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start", exact: true })
    .first()
    .click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  for (const value of ["undefined", "{}", "null"]) {
    await editor.fill(
      `const TaskProvider = ${value}; export default function App() { return <TaskProvider><h1>Sprint board</h1></TaskProvider>; }`,
    );
    await editor.press("F5");
    const error = page.getByRole("alert");
    await expect(error).toContainText("React could not render a component", {
      timeout: 15000,
    });
    await expect(error).toContainText("Named exports use braces");
    await expect(error).not.toContainText("Minified");
    await expect(
      page.getByRole("button", { name: "Submit assignment" }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Return to editor", exact: true })
      .click();
    await expect(editor).toBeFocused();
  }
});
