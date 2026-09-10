import { startAssignmentPrint } from "../fixtures/story";
import { test, expect } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";
import { curriculum } from "../../src/curriculum";

for (const reducedMotion of [false, true]) {
  test(`assignments print after dialogue and wait for collection (reduced motion: ${reducedMotion})`, async ({
    page,
  }) => {
    const save = fresh();
    save.settings.mute = true;
    save.settings.reducedMotion = reducedMotion;
    await page.addInitScript(
      ([key, value]) => {
        if (window === window.top) localStorage.setItem(key, value);
      },
      [KEY, JSON.stringify(save)],
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await startAssignmentPrint(page);
    const pickup = page.getByRole("button", {
      name: "Grab new assignment: Sprint board",
      exact: true,
    });
    const sheet = page.getByRole("button", {
      name: "Read printed assignment: Sprint board",
    });
    const brief = page.getByRole("complementary", {
      name: "Printed assignment",
      exact: true,
    });
    const shortcut = page.getByRole("button", {
      name: "Open printed assignment",
    });
    await expect(
      page.getByRole("button", { name: "Print assignment", exact: true }),
    ).toHaveCount(0);
    await expect(pickup).toBeEnabled({ timeout: 15000 });
    await expect(page.getByRole("status")).toContainText(
      "Grab the paper from the printer",
    );
    await expect(sheet).toHaveCount(0);
    await expect(shortcut).toHaveCount(0);
    await expect(brief).toHaveCount(0);
    await page.screenshot({
      path: `test-results/assignment-awaiting-pickup-${reducedMotion}.png`,
    });
    await pickup.click();
    await expect(pickup).toHaveCount(0);
    await expect(sheet).toBeVisible();
    await expect(shortcut).toHaveCount(0);
    await expect(brief).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText(
      "Your assignment is waiting beside the monitor",
    );
    await page.screenshot({
      path: `test-results/assignment-collected-${reducedMotion}.png`,
    });
    await sheet.click();
    await expect(brief).toContainText("Sprint board");
    await expect(brief).toContainText("FROM:");
    await page.getByRole("button", { name: "Put assignment down" }).click();
    await expect(sheet).toBeVisible();
    await sheet.click();
    await expect(brief).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("reload advances completed work to a real new printout and preserves collected paper", async ({
  page,
}) => {
  const save = fresh();
  save.phase = "coding";
  save.completed = [save.assignmentId];
  save.collectedAssignments = [save.assignmentId];
  save.readAssignments = [save.assignmentId];
  save.settings.mute = true;
  save.settings.reducedMotion = true;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  const next = curriculum[1].assignments[0];
  await page.goto("/");
  await startAssignmentPrint(page);
  const pickup = page.getByRole("button", {
    name: `Grab new assignment: ${next.title}`,
    exact: true,
  });
  const sheet = page.getByRole("button", {
    name: `Read printed assignment: ${next.title}`,
    exact: true,
  });
  await expect(pickup).toBeEnabled({ timeout: 15000 });
  await expect(
    page.getByRole("button", {
      name: "Grab new assignment: Sprint board",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText(
    `Your new assignment, ${next.title}, is ready`,
  );
  await pickup.click();
  await sheet.click();
  await page.getByRole("button", { name: "Put assignment down" }).click();
  await page.reload();
  await expect(sheet).toBeVisible({ timeout: 15000 });
  await expect(pickup).toHaveCount(0);
  await sheet.click();
  await expect(
    page.getByRole("complementary", {
      name: "Printed assignment",
      exact: true,
    }),
  ).toContainText(next.title);
  await page.getByRole("button", { name: "Put assignment down" }).click();
  await page.locator('[data-surface="crt-glass"]').click();
  await page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code")
    .press("ControlOrMeta+o");
  await page
    .getByRole("button", { name: "Open task: Sprint board", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /^Read printed assignment:/ }),
  ).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText(
    "already complete and pinned on the right wall",
  );
});
