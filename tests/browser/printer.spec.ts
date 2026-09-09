import { test, expect } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";
import { curriculum } from "../../src/curriculum";

for (const reducedMotion of [false, true]) {
  test(`assignments print automatically and wait for collection (reduced motion: ${reducedMotion})`, async ({
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
    const pickup = page.getByRole("button", {
      name: "Grab new assignment: Hello B.U.G.",
      exact: true,
    });
    const sheet = page.getByRole("button", {
      name: "Read printed assignment: Hello B.U.G.",
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
      "Your assignment is beside the monitor",
    );
    await page.screenshot({
      path: `test-results/assignment-collected-${reducedMotion}.png`,
    });
    await sheet.click();
    await expect(brief).toContainText("Hello B.U.G.");
    await expect(brief).toContainText("FROM:");
    await page.getByRole("button", { name: "Put assignment down" }).click();
    await expect(sheet).toBeVisible();
    await sheet.click();
    await expect(brief).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("a new task prints automatically, and returning to a collected task keeps its paper", async ({
  page,
}) => {
  const save = fresh();
  save.phase = "coding";
  save.completed = [save.assignmentId];
  save.settings.mute = true;
  save.settings.reducedMotion = true;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  const next = curriculum[1].assignments[0];
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Grab new assignment: Hello B.U.G.",
      exact: true,
    })
    .click();
  await page.locator('[data-surface="crt-glass"]').click();
  await page.getByLabel("Your React code").press("ControlOrMeta+o");
  await page.getByRole("button", { name: `Open task: ${next.title}` }).click();
  await expect(
    page.getByRole("button", { name: "Open printed assignment" }),
  ).toHaveCount(0);
  // Step back from the screen to pick up the newly printed task.
  await page.getByLabel("Your React code").press("Escape");
  const pickup = page.getByRole("button", {
    name: `Grab new assignment: ${next.title}`,
    exact: true,
  });
  await expect(pickup).toBeEnabled({ timeout: 15000 });
  await expect(page.getByRole("status")).toContainText(
    `Your new assignment, ${next.title}, is ready`,
  );
  await expect(
    page.getByRole("button", {
      name: `Read printed assignment: ${next.title}`,
    }),
  ).toHaveCount(0);
  await pickup.click();
  await page
    .getByRole("button", { name: `Read printed assignment: ${next.title}` })
    .click();
  await expect(
    page.getByRole("complementary", {
      name: "Printed assignment",
      exact: true,
    }),
  ).toContainText(next.title);
  await page.getByRole("button", { name: "Put assignment down" }).click();
  await page.locator('[data-surface="crt-glass"]').click();
  await page.getByLabel("Your React code").press("ControlOrMeta+o");
  await page.getByRole("button", { name: "Open task: Hello B.U.G." }).click();
  await expect(
    page.getByRole("button", {
      name: "Grab new assignment: Hello B.U.G.",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /^Read printed assignment:/ }).click();
  await expect(
    page.getByRole("complementary", {
      name: "Printed assignment",
      exact: true,
    }),
  ).toContainText("Hello B.U.G.");
});
