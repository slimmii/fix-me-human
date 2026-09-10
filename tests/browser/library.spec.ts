import { test, expect } from "@playwright/test";
import { curriculum } from "../../src/curriculum";
import { KEY } from "../../src/progression";
import { codingSave } from "../fixtures/curriculum";

test("File Open restores previous tasks and Help grows with completed exercises", async ({
  page,
}) => {
  const first = curriculum[0].assignments[0];
  const second = curriculum[1].assignments[0];
  const third = curriculum[2].assignments[0];
  const save = codingSave();
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  const editor = page.getByRole("textbox", { name: "Your React code" });
  const help = page.getByRole("complementary", {
    name: "Course material",
    exact: true,
  });
  const topics = page.getByRole("list", { name: "Unlocked course topics" });
  const tasks = page.getByRole("list", { name: "Available tasks" });
  const open = async () => {
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page
      .getByRole("menuitem", { name: "Open Ctrl+O", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Open task", exact: true }),
    ).toBeVisible();
  };
  await editor.fill(first.solution);
  await open();
  await expect(tasks.getByRole("button")).toHaveCount(1);
  await expect(
    tasks.getByRole("button", { name: `Open task: ${second.title}` }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Cancel · Esc" }).click();
  await expect(editor).toBeFocused();
  await expect(editor).toHaveText(first.solution, { useInnerText: true });
  await editor.press("F1");
  await expect(topics.getByRole("button")).toHaveCount(1);
  await expect(topics).toContainText("React fundamentals");
  await page.getByRole("button", { name: "Close course material" }).click();

  await editor.press("F5");
  await page
    .getByRole("button", { name: "Submit assignment" })
    .click({ timeout: 15000 });
  await page.locator('[data-surface="crt-glass"]').click();
  await editor.press("ControlOrMeta+o");
  await expect(tasks.getByRole("button")).toHaveCount(2);
  await expect(tasks).toContainText("Completed");
  await page
    .getByRole("button", { name: `Open task: ${second.title}` })
    .click();
  await expect(editor).toHaveText(second.starterCode!, { useInnerText: true });
  await editor.fill(second.solution);
  await editor.press("ControlOrMeta+o");
  await page.getByRole("button", { name: `Open task: ${first.title}` }).click();
  await expect(editor).toHaveText(first.solution, { useInnerText: true });
  await editor.press("F1");
  await expect(topics.getByRole("button")).toHaveCount(2);
  await expect(
    topics.getByRole("button", { name: "Read topic: Lists and board columns" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Read topic: Components and props" })
    .click();
  await expect(
    help.getByRole("heading", { name: "Give each card its inputs" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next →", exact: true }).click();
  await expect(
    help.getByRole("heading", {
      name: "Describe the contract with TypeScript",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Topics", exact: true }).click();
  await expect(topics.getByRole("button")).toHaveCount(2);
  await page.getByRole("button", { name: "Close course material" }).click();

  await page.reload();
  await page.locator('[data-surface="crt-glass"]').click();
  await expect(editor).toHaveText(first.solution, { useInnerText: true });
  await open();
  await page
    .getByRole("button", { name: `Open task: ${second.title}` })
    .click();
  await expect(editor).toHaveText(second.solution, { useInnerText: true });
  await editor.press("F5");
  await page
    .getByRole("button", { name: "Submit assignment" })
    .click({ timeout: 15000 });
  await page.locator('[data-surface="crt-glass"]').click();
  await editor.press("ControlOrMeta+o");
  await expect(tasks.getByRole("button")).toHaveCount(3);
  await page.screenshot({ path: "test-results/open-previous-tasks.png" });
  await page.getByRole("button", { name: `Open task: ${third.title}` }).click();
  await editor.press("F1");
  await expect(topics.getByRole("button")).toHaveCount(3);
  await page.screenshot({ path: "test-results/unlocked-course-topics.png" });
  await page
    .getByRole("button", { name: "Read topic: Lists and board columns" })
    .click();
  await expect(
    help.getByRole("heading", { name: "Turn task data into columns" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close course material" }).click();
  await editor.fill(third.solution);
  await editor.press("F5");
  await page
    .getByRole("button", { name: "Submit assignment" })
    .click({ timeout: 15000 });
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).completed,
      KEY,
    ),
  ).toEqual([first.id, second.id, third.id]);
  expect(errors).toEqual([]);
});
