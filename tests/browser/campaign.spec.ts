import { startAssignmentPrint } from "../fixtures/story";
import { test, expect } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";
import { assignment, codingSave } from "../fixtures/curriculum";

test("start coding immediately, consult the printed brief and integrated Help, submit and replay", async ({
  page,
}) => {
  const initial = fresh();
  initial.settings.reducedMotion = true;
  initial.settings.mute = true;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(initial)],
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await startAssignmentPrint(page);
  await expect(
    page.getByRole("button", { name: "Read printed assignment: Sprint board" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Grab new assignment: Sprint board",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Read printed assignment: Sprint board" }),
  ).toBeVisible({ timeout: 15000 });
  await page
    .getByRole("button", { name: "Read printed assignment: Sprint board" })
    .click();
  const paper = page.getByRole("complementary", {
    name: "Printed assignment",
    exact: true,
  });
  await expect(paper).toContainText("FROM:");
  await page.screenshot({ path: "test-results/printed-assignment-desk.png" });
  await page.getByRole("button", { name: "Put assignment down" }).click();
  await page.locator('[data-surface="crt-glass"]').click();
  const editor = page.getByRole("textbox", { name: "Your React code" });
  await expect(editor).toBeVisible();
  await expect(editor).toHaveText("");
  await expect(
    page.getByRole("button", { name: "Start assignment" }),
  ).toHaveCount(0);
  await editor.fill(assignment.solution);
  await page.getByRole("button", { name: /^Read printed assignment:/ }).click();
  await expect(paper).toBeVisible();
  await expect(editor).toBeVisible();
  await expect(page.locator("main")).toHaveClass(/focused/);
  await editor.press("ControlOrMeta+End");
  await editor.press("Enter");
  await editor.pressSequentially("// checking the brief");
  await expect(editor).toContainText("// checking the brief");
  await page.screenshot({ path: "test-results/editor-with-printout.png" });
  // The paper and screen occupy separate horizontal regions while coding.
  await expect
    .poll(async () => {
      const screen = await page
        .locator('[data-surface="crt-glass"]')
        .boundingBox();
      const sheet = await paper.boundingBox();
      return screen && sheet ? screen.x + screen.width <= sheet.x : false;
    })
    .toBe(true);
  await page.getByRole("button", { name: "Put assignment down" }).click();
  await page.getByRole("menuitem", { name: "Help", exact: true }).click();
  await page
    .getByRole("button", { name: "Read topic: React fundamentals" })
    .click();
  const help = page.getByRole("complementary", {
    name: "Course material",
    exact: true,
  });
  await expect(
    help.getByRole("heading", { name: "Meet the component" }),
  ).toBeVisible();
  await expect(editor).toBeHidden();
  await expect(help.locator("pre code").first()).toContainText(
    "export default function App()",
  );
  await page.screenshot({ path: "test-results/editor-course-help.png" });
  await page.getByRole("button", { name: "Close course material" }).click();
  await expect(editor).toBeFocused();
  await editor.press("ControlOrMeta+z");
  await expect(editor).not.toContainText("// checking the brief");
  await editor.fill(assignment.solution);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Read printed assignment: Sprint board" }),
  ).toBeVisible({ timeout: 15000 });
  await page.locator('[data-surface="crt-glass"]').click();
  await expect(editor).toHaveText(assignment.solution, { useInnerText: true });
  await editor.press("F5");
  const submit = page.getByRole("button", { name: "Submit assignment" });
  await expect(submit).toBeVisible({ timeout: 15000 });
  await expect(
    page
      .frameLocator("iframe")
      .getByRole("heading", { name: "Sprint board", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Read printed assignment:/ }).click();
  await expect(submit).toBeVisible();
  await page.getByRole("button", { name: "Put assignment down" }).click();
  await submit.click();
  await startAssignmentPrint(page);
  await expect(
    page.getByRole("button", {
      name: "Grab new assignment: Reusable task cards",
      exact: true,
    }),
  ).toBeEnabled({ timeout: 15000 });
  await expect(page.getByRole("status")).toContainText(
    "new assignment, Reusable task cards",
  );
  await expect(
    page.getByRole("button", {
      name: "Read printed assignment: Sprint board",
    }),
  ).toHaveCount(0);
  await page.locator('[data-surface="crt-glass"]').click();
  await expect(editor).toHaveText(assignment.solution, { useInnerText: true });
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).completed,
      KEY,
    ),
  ).toEqual([assignment.id]);
  expect(errors).toEqual([]);
});

test("editor and references fit desktop screen sizes", async ({ page }) => {
  const save = codingSave(assignment.solution);
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await startAssignmentPrint(page);
  await expect(
    page.getByRole("button", { name: "Read printed assignment: Sprint board" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Grab new assignment: Sprint board",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Read printed assignment: Sprint board" }),
  ).toBeVisible({ timeout: 15000 });
  await page.locator('[data-surface="crt-glass"]').click();
  await page.getByRole("button", { name: /^Read printed assignment:/ }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Reduce motion").check();
  await page.getByLabel("Mute sound").check();
  await page.getByRole("button", { name: "Back to work" }).click();
  await expect(
    page.getByRole("complementary", {
      name: "Printed assignment",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Put assignment down" }).click();
  for (const width of [1280, 1920]) {
    await page.setViewportSize({ width, height: width === 1280 ? 800 : 1080 });
    await page
      .getByRole("button", { name: /^Read printed assignment:/ })
      .click();
    await expect(
      page.getByRole("button", { name: "Put assignment down" }),
    ).toBeInViewport();
    await page.getByRole("button", { name: "Put assignment down" }).click();
    await page.getByLabel("Your React code").press("F1");
    await page
      .getByRole("button", { name: "Read topic: React fundamentals" })
      .click();
    await expect(
      page.getByRole("button", { name: "Next →", exact: true }),
    ).toBeInViewport();
    await expect(
      page.getByRole("scrollbar", { name: "Lesson scroll position" }),
    ).toBeVisible();
    await page.screenshot({ path: `test-results/editor-help-${width}.png` });
    await page.getByRole("button", { name: "Close course material" }).click();
  }
  await page.getByLabel("Your React code").press("Escape");
  await expect(page.locator("main")).not.toHaveClass(/focused/);
});
