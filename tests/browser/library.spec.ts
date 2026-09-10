import { test, expect } from "@playwright/test";
import { curriculum } from "../../src/curriculum";
import { KEY } from "../../src/progression";
import { codingSave } from "../fixtures/curriculum";

test("Tasks menu restores previous tasks and Help grows with completed exercises", async ({
  page,
}) => {
  const first = curriculum[0].assignments[0];
  const second = curriculum[1].assignments[0];
  const third = curriculum[2].assignments[0];
  const save = codingSave();
  save.settings.graphicsQuality = 0;
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
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByRole("textbox", { name: "Your React code" });
  const help = page.getByRole("complementary", {
    name: "Course material",
    exact: true,
  });
  const topics = page.getByRole("list", { name: "Unlocked course topics" });
  const tasks = page.getByRole("list", { name: "Available tasks" });
  const open = async () => {
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Tasks", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Open task", exact: true }),
    ).toBeVisible();
  };
  const playerCode = first.solution.replace(
    "A home for our team's tasks.",
    "My own sprint board.",
  );
  await editor.fill(playerCode);
  await open();
  await expect(tasks.getByRole("button")).toHaveCount(1);
  await expect(
    tasks.getByRole("button", { name: `Open task: ${second.title}` }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Cancel · Esc" }).click();
  await expect(editor).toBeFocused();
  await expect(editor).toHaveText(playerCode, { useInnerText: true });
  await editor.press("F1");
  await expect(topics.getByRole("button")).toHaveCount(1);
  await expect(topics).toContainText("React fundamentals");
  await page.getByRole("button", { name: "Close course material" }).click();

  await editor.press("F5");
  await page
    .getByRole("button", { name: "Submit assignment" })
    .click({ timeout: 15000 });
  await page.locator('[data-surface="crt-glass"]').click();
  await open();
  await expect(tasks.getByRole("button")).toHaveCount(2);
  await expect(tasks).toContainText("Completed");
  await page
    .getByRole("button", { name: `Open task: ${second.title}` })
    .click();
  await expect(editor).toHaveText(playerCode, { useInnerText: true });
  await editor.fill(second.solution);
  await open();
  await page.getByRole("button", { name: `Open task: ${first.title}` }).click();
  await expect(editor).toHaveText(playerCode, { useInnerText: true });
  await editor.press("F1");
  await expect(topics.getByRole("button")).toHaveCount(2);
  await expect(
    topics.getByRole("button", { name: "Read topic: Lists and identity" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Read topic: Components and props" })
    .click();
  await expect(
    help.getByRole("heading", { name: "One component, different inputs" }),
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
  await expect(editor).toHaveText(playerCode, { useInnerText: true });
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
  await open();
  await expect(tasks.getByRole("button")).toHaveCount(3);
  await tasks.screenshot({ path: "test-results/open-previous-tasks.png" });
  await page.getByRole("button", { name: `Open task: ${third.title}` }).click();
  await editor.press("F1");
  await expect(topics.getByRole("button")).toHaveCount(4);
  await topics.screenshot({ path: "test-results/unlocked-course-topics.png" });
  await page
    .getByRole("button", { name: "Read topic: Lists and identity" })
    .click();
  await expect(
    help.getByRole("heading", { name: "Turn data into a list" }),
  ).toBeVisible();
  await help.screenshot({ path: "test-results/course-list-material.png" });
  await page.getByRole("button", { name: "Close course material" }).click();
  expect(errors).toEqual([]);
});
