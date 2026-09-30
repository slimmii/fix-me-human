import { expect, test, type Page } from "@playwright/test";
import { useSimpleComputer } from "../fixtures/simple-computer";
import { coffeeHunt, fixedCoffee } from "../fixtures/bug-hunts";
import { KEY, fresh } from "../../src/progression";
import { DISPLAY } from "../../src/monitor";
import {
  startHunt,
  recordHuntRun,
  finishHuntRun,
} from "../../src/bug-hunts/progress";

const oldHunt = {
  ...coffeeHunt,
  id: "55555555-5555-4555-8555-555555555555",
  title: "An older case",
  slug: "an-older-case",
  publishDateTime: "2026-08-01T09:00:00Z",
};
const key = `${coffeeHunt.id}:1`;
const save = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), KEY);
const editor = (page: Page) =>
  page
    .frameLocator('iframe[title="Code editor"]')
    .getByRole("textbox", { name: "Your React code" });
async function run(page: Page) {
  await editor(page).press("F5");
  await expect(page.locator(".retro-browser-page")).toHaveAttribute(
    "aria-busy",
    "false",
  );
}
test.beforeEach(async ({ page }) => {
  await useSimpleComputer(page);
  await page.addInitScript((key) => {
    if (window === window.top)
      localStorage.setItem(`${key}:account-introduction`, "dismissed");
  }, KEY);
  await page.route("**/rest/v1/pfh_bug_hunts?*", (route) => {
    const id = new URL(route.request().url()).searchParams.get("id");
    return route.fulfill({
      json: id
        ? [coffeeHunt, oldHunt].find((hunt) => `eq.${hunt.id}` === id)
        : [coffeeHunt, oldHunt],
    });
  });
});

test("guest fixes a multi-file database hunt, sees check details and persists statistics independently of the course", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "WANTED: Open bug hunts" }).click();
  await expect(page.getByText("An older case", { exact: true })).toBeVisible();
  await page
    .getByRole("button", {
      name: "Open bug hunt: The coffee counter",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Start hunt", exact: true }).click();
  await page.locator(".machine-screen").evaluate((screen, display) => {
    screen.style.width = `${display.width}px`;
    screen.style.height = `${display.height}px`;
    screen.style.setProperty("--terminal-font-size", "20px");
  }, DISPLAY);
  const menuBounds = await page.locator(".qbasic-menu").boundingBox();
  const navigationBounds = await page
    .locator(".qbasic-menu .hunt-navigation")
    .boundingBox();
  expect(navigationBounds!.x + navigationBounds!.width).toBeLessThanOrEqual(
    menuBounds!.x + menuBounds!.width,
  );
  await page.locator(".machine-screen").evaluate((screen) => {
    screen.style.setProperty("--terminal-font-size", "14px");
  });
  await expect(page.locator(".hunt-toolbar")).toHaveCount(0);
  await expect(
    page
      .locator(".qbasic-menu")
      .getByRole("navigation", { name: "Bug hunt navigation" }),
  ).toBeVisible();
  const course = (await save(page)).assignmentId;
  await run(page);
  await expect(page.getByRole("status")).toContainText("3 checks failed");
  await expect(page.locator(".qbasic-source")).toBeHidden();
  await expect(page.locator(".retro-browser-title")).toHaveCount(0);
  await expect(
    page
      .locator(".retro-browser-tools")
      .getByRole("navigation", { name: "Bug hunt navigation" }),
  ).toBeVisible();
  const previewBounds = await page.locator(".retro-browser-page").boundingBox();
  await page.getByText(/^Check details/).click();
  await expect(
    page.getByRole("complementary", { name: "Hunt feedback" }),
  ).toContainText("One click should add one cup");
  await page.getByRole("button", { name: "Dismiss hunt message" }).click();
  await expect(
    page.getByRole("complementary", { name: "Hunt feedback" }),
  ).toHaveCount(0);
  expect(await page.locator(".retro-browser-page").boundingBox()).toEqual(
    previewBounds,
  );
  await page.getByRole("button", { name: "Brief & results" }).click();
  await expect(
    page.getByRole("region", { name: "Latest check results" }),
  ).toContainText("One click should add one cup");
  await page.getByRole("button", { name: "Continue hunt" }).click();
  await editor(page).press("Control+o");
  await page
    .getByLabel("Files:", { exact: true })
    .selectOption("CoffeeOrder.tsx");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await editor(page).fill("export function Broken( {");
  await run(page);
  await expect
    .poll(async () => (await save(page)).bugHunts[key].compileErrors)
    .toBe(1);
  await page.getByRole("button", { name: "Return to editor" }).click();
  await editor(page).fill(
    'export function CoffeeOrder() { throw new Error("Coffee exploded"); }',
  );
  await run(page);
  await expect
    .poll(async () => (await save(page)).bugHunts[key].runtimeErrors)
    .toBe(1);
  await page.getByRole("button", { name: "Return to editor" }).click();
  await editor(page).fill(fixedCoffee);
  await run(page);
  await expect(page.locator(".retro-browser-status")).toContainText(
    "Bug hunt solved",
  );
  const beforeReload = await save(page);
  expect(beforeReload.bugHunts[key]).toMatchObject({
    runs: 4,
    failedRuns: 1,
    compileErrors: 1,
    runtimeErrors: 1,
    successfulRuns: 1,
  });
  expect(beforeReload.assignmentId).toBe(course);
  expect(beforeReload.completed).toEqual([]);
  await page.reload();
  await page.getByRole("button", { name: "WANTED: Open bug hunts" }).click();
  await expect(
    page.getByRole("button", {
      name: "Open bug hunt: The coffee counter",
      exact: true,
    }),
  ).toContainText("Solved");
  await page
    .getByRole("button", { name: "Open bug hunt: An older case", exact: true })
    .click();
  await page.getByRole("button", { name: "Start hunt", exact: true }).click();
  await run(page);
  expect((await save(page)).bugHunts[key]).toEqual(beforeReload.bugHunts[key]);
  await page.getByRole("button", { name: "Back to course" }).click();
  await expect(page.locator(".qbasic-program")).toHaveText(
    "B.U.G. BASIC / REACT",
  );
});

test("paper interrupts an active bug hunt with a B.U.G. reminder", async ({
  page,
}) => {
  const saved = fresh();
  saved.collectedAssignments = [saved.assignmentId];
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    [KEY, JSON.stringify(saved)],
  );
  await page.goto("/");
  await page.getByRole("button", { name: "WANTED: Open bug hunts" }).click();
  await page
    .getByRole("button", { name: "Open bug hunt: The coffee counter" })
    .click();
  await page.getByRole("button", { name: "Start hunt", exact: true }).click();
  await page.getByRole("button", { name: /^Read printed assignment:/ }).click();
  await expect(page.getByRole("status")).toContainText(
    "shouldn't be reading that while you're doing a bug hunt",
  );
});

test("reopened solved hunts show practice feedback without changing recorded statistics", async ({
  page,
}) => {
  const solved = finishHuntRun(
    recordHuntRun(
      startHunt(
        {
          files: coffeeHunt.starter_files,
          activeFile: "CoffeeOrder.tsx",
        },
        100,
      ),
      200,
    ),
    {
      outcome: "passed",
      durationMs: 75,
      checks: [{ label: "Original successful solve", pass: true }],
    },
    275,
  );
  const { project: _project, ...originalStats } = solved;
  await page.addInitScript(
    ({ storageKey, saved }) => {
      if (
        window === window.top &&
        !localStorage.getItem("practice-test-seeded")
      ) {
        localStorage.setItem(storageKey, JSON.stringify(saved));
        localStorage.setItem("practice-test-seeded", "true");
      }
    },
    { storageKey: KEY, saved: { ...fresh(), bugHunts: { [key]: solved } } },
  );
  await page.goto("/");
  await page.getByRole("button", { name: "WANTED: Open bug hunts" }).click();
  await page
    .getByRole("button", {
      name: "Open bug hunt: The coffee counter",
      exact: true,
    })
    .click();
  await expect(page.getByText("Recorded solve", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Practice only. Your original solve statistics", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reopen for practice" }).click();
  await run(page);
  await expect(page.getByRole("status")).toContainText("3 checks failed");
  await page.getByRole("button", { name: "Brief & results" }).click();
  const results = page.getByRole("region", { name: "Latest check results" });
  await expect(results).toContainText("Latest practice run");
  await expect(results).toContainText("One click should add one cup");
  await expect(results).not.toContainText("Original successful solve");
  await page.getByRole("button", { name: "Reopen for practice" }).click();
  await editor(page).fill("export function Broken( {");
  await run(page);
  await page.getByRole("button", { name: "Return to editor" }).click();
  await editor(page).fill(fixedCoffee);
  await run(page);
  await expect(page.getByRole("status")).toContainText(
    "Practice checks passed. Your original statistics are unchanged.",
  );
  const { project, ...afterPractice } = (await save(page)).bugHunts[key];
  expect(afterPractice).toEqual(originalStats);
  expect(project.files["CoffeeOrder.tsx"]).toBe(fixedCoffee);
  await page.reload();
  await page.getByRole("button", { name: "WANTED: Open bug hunts" }).click();
  const hunt = page.getByRole("button", {
    name: "Open bug hunt: The coffee counter",
    exact: true,
  });
  await expect(hunt).toContainText("Solved");
  await hunt.click();
  await expect(results).toContainText("Recorded solve");
  await expect(results).toContainText("Original successful solve");
  const { project: _restoredProject, ...afterReload } = (await save(page))
    .bugHunts[key];
  expect(afterReload).toEqual(originalStats);
});

test("wanted board handles service failures and an empty schedule", async ({
  page,
}) => {
  await page.route("**/rest/v1/pfh_bug_hunts?*", (route) =>
    route.fulfill({ status: 503, json: { message: "offline" } }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "WANTED: Open bug hunts" }).click();
  await expect(page.getByRole("alert")).toContainText("Check your connection", {
    timeout: 15000,
  });
  await page.route("**/rest/v1/pfh_bug_hunts?*", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.getByRole("button", { name: "Refresh" }).click();
  await expect(
    page.getByText("No hunts published yet. Check back soon."),
  ).toBeVisible();
});

for (const testCode of ["// No tests registered", "test("]) {
  test(`an invalid test suite cannot award completion: ${testCode}`, async ({
    page,
  }) => {
    await page.route("**/rest/v1/pfh_bug_hunts?*", (route) =>
      route.fulfill({
        json: new URL(route.request().url()).searchParams.has("id")
          ? { ...coffeeHunt, test_code: testCode }
          : [coffeeHunt],
      }),
    );
    await page.goto("/");
    await page.getByRole("button", { name: "WANTED: Open bug hunts" }).click();
    await page
      .getByRole("button", {
        name: "Open bug hunt: The coffee counter",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Start hunt", exact: true }).click();
    await run(page);
    await expect
      .poll(async () => (await save(page)).bugHunts[key].runtimeErrors)
      .toBe(1);
    expect((await save(page)).bugHunts[key].completedAt).toBeNull();
  });
}

test("a non-responsive check records one timeout and allows a new attempt", async ({
  page,
}) => {
  await page.route("**/rest/v1/pfh_bug_hunts?*", (route) =>
    route.fulfill({
      json: new URL(route.request().url()).searchParams.has("id")
        ? {
            ...coffeeHunt,
            test_code: 'test("Never resolves", () => new Promise(() => {}));',
          }
        : [coffeeHunt],
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "WANTED: Open bug hunts" }).click();
  await page
    .getByRole("button", {
      name: "Open bug hunt: The coffee counter",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Start hunt", exact: true }).click();
  await editor(page).press("F5");
  await expect
    .poll(async () => (await save(page)).bugHunts[key].timeouts, {
      timeout: 18000,
    })
    .toBe(1);
  expect((await save(page)).bugHunts[key].runs).toBe(1);
  await page.getByRole("button", { name: "Return to editor" }).click();
  await editor(page).fill("export function Broken( {");
  await run(page);
  expect((await save(page)).bugHunts[key]).toMatchObject({
    runs: 2,
    timeouts: 1,
    compileErrors: 1,
    completedAt: null,
  });
});
