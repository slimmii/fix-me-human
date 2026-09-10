import { test, expect } from "@playwright/test";
import { KEY } from "../../src/progression";
import { createOfficeClock, OFFICE_DAY_MS } from "../../src/game/officeTime";
import { codingSave } from "../fixtures/curriculum";
import { useSimpleComputer } from "../fixtures/simple-computer";

const start = new Date("2026-09-10T09:00:00Z").getTime();
test.beforeEach(async ({ page }) => {
  await useSimpleComputer(page);
  await page.clock.setFixedTime(start);
  const save = codingSave();
  save.officeClock = createOfficeClock(start);
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
});

test("the clock and bug streak advance, survive reload, and reset for every code error", async ({
  page,
}) => {
  const clock = page.getByRole("timer", { name: "Office clock" });
  const counter = page.getByLabel("Days without a bug", { exact: true });
  const setDay = (days: number) =>
    page.clock.setFixedTime(start + days * OFFICE_DAY_MS);
  await expect(clock).toHaveText("Day 1 · 09:00");
  await expect(counter).toHaveText("0");
  await setDay(0.5);
  await expect(clock).toHaveText("Day 1 · 21:00");
  await expect(counter).toHaveText("0");
  await setDay(2.75);
  await expect(clock).toHaveText("Day 3 · 03:00");
  await expect(counter).toHaveText("2");
  await page.reload();
  await expect(clock).toHaveText("Day 3 · 03:00");
  await expect(counter).toHaveText("2");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");

  // Incomplete assignment checks aren't a crashed or invalid program.
  await editor.fill(
    "export default function App() { return <p>Work in progress</p>; }",
  );
  await editor.press("F5");
  await expect(
    page
      .getByText("● Program running. Assignment needs another look.", {
        exact: true,
      })
      .first(),
  ).toBeVisible({ timeout: 15000 });
  await expect(counter).toHaveText("2");
  await page.getByRole("button", { name: "Close browser" }).click();

  // The same compile error can recur: every occurrence starts a fresh streak.
  await editor.fill("export default function App() { return <h1>broken; }");
  for (const day of [2.75, 4.25]) {
    await setDay(day);
    await editor.press("F5");
    await expect(page.getByRole("alert")).toContainText("COMPILE ERROR", {
      timeout: 15000,
    });
    await expect(counter).toHaveText("0");
    await setDay(day + 0.999);
    await expect(counter).toHaveText("0");
    await setDay(day + 1);
    await expect(counter).toHaveText("1");
    await page
      .getByRole("button", { name: "Return to editor", exact: true })
      .click();
  }

  await editor.fill(
    'export default function App() { return <><h1>Sprint board</h1><button onClick={() => { throw new Error("Oops"); }}>Break</button></>; }',
  );
  await editor.press("F5");
  await expect(
    page.getByRole("button", { name: "Submit assignment" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(counter).toHaveText("1");
  await setDay(5.75);
  await page
    .frameLocator('iframe[title="Your retro browser"]')
    .getByRole("button", { name: "Break" })
    .click();
  await expect(page.getByRole("alert")).toContainText("RUNTIME ERROR");
  await expect(counter).toHaveText("0");
  await expect(clock).toHaveText("Day 6 · 03:00");
  await page.reload();
  await expect(counter).toHaveText("0");
  await setDay(6.75);
  await expect(counter).toHaveText("1");
});

test("an unresponsive preview also resets the streak", async ({ page }) => {
  await page.route("**/src/sandbox/document.ts", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: 'export function browserDocument() { return "<p>Unresponsive preview</p>"; }',
    }),
  );
  await page.reload();
  await page.clock.setFixedTime(start + 2 * OFFICE_DAY_MS);
  await expect(
    page.getByLabel("Days without a bug", { exact: true }),
  ).toHaveText("2");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await editor.fill(
    "export default function App() { return <h1>Sprint board</h1>; }",
  );
  await editor.press("F5");
  await expect(page.getByRole("alert")).toContainText(
    "Program did not respond",
    { timeout: 20000 },
  );
  await expect(
    page.getByLabel("Days without a bug", { exact: true }),
  ).toHaveText("0");
});
