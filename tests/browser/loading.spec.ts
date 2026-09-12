import { test, expect } from "@playwright/test";
import { KEY } from "../../src/progression";
import { assignment, codingSave } from "../fixtures/curriculum";
import { useSimpleComputer } from "../fixtures/simple-computer";

test.beforeEach(async ({ page }) => {
  await useSimpleComputer(page);
  const save = codingSave(assignment.solution);
  save.settings.reducedMotion = false;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Start", exact: true }).click();
});

test("one readable processing panel covers compilation and checks before revealing output", async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  const started = await page.evaluate(() => performance.now());
  await page.getByRole("menuitem", { name: "Run", exact: true }).click();
  await page.getByRole("menuitem", { name: "Start F5" }).click();
  const progress = page.getByRole("progressbar", {
    name: "Processing your program",
  });
  await expect(progress).toBeVisible();
  const panel = await page.locator(".retro-run-loading").elementHandle();
  const message = await page.locator(".retro-run-message").textContent();
  expect(message).toMatch(/\S.+\.\.\.$/);
  await expect(page.locator(".retro-run-blocks")).toHaveCSS(
    "animation-name",
    "retro-processing",
  );
  const preview = page.locator('iframe[title="Your retro browser"]');
  await expect(preview).toBeAttached();
  expect(await panel!.evaluate((element) => element.isConnected)).toBe(true);
  await expect(page.locator(".retro-run-message")).toHaveText(message!);
  await expect(preview).toHaveAttribute("inert", "");
  await expect(preview).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("button", { name: "Reload" })).toBeDisabled();
  await page.locator(".retro-browser-page").screenshot({
    path: "test-results/retro-processing.png",
  });

  await expect(
    page.frameLocator('iframe[title="Your retro browser"]').locator("#app"),
  ).toContainText("Sprint board");
  await page.clock.runFor(1400);
  await expect(progress).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Submit assignment" }),
  ).toHaveCount(0);
  await page.clock.runFor(200);
  await expect(
    page.getByRole("button", { name: "Submit assignment" }),
  ).toBeVisible();
  expect(
    (await page.evaluate(() => performance.now())) - started,
  ).toBeGreaterThan(1400);
  await expect(progress).toHaveCount(0);
  await expect(preview).not.toHaveAttribute("inert");
  await expect(preview).toHaveAttribute("aria-hidden", "false");
  await expect(page.locator(".retro-browser-page")).toHaveAttribute(
    "aria-busy",
    "false",
  );
});

test("reduced motion keeps the bar still and editing cancels a pending reveal", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await editor.press("F5");
  await expect(page.getByRole("progressbar")).toBeVisible();
  await expect(page.locator(".retro-run-blocks")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(
    page.locator('iframe[title="Your retro browser"]'),
  ).toBeAttached();
  await page.getByRole("button", { name: "← Editor F6" }).click();
  await editor.fill("export default function App() { return <h1>broken }");
  await page.clock.runFor(2000);
  await expect(page.locator(".qbasic-ruler")).toContainText(
    "Modified — saved locally",
  );
  await expect(
    page.getByRole("button", { name: "Submit assignment" }),
  ).toHaveCount(0);

  await editor.press("F5");
  await expect(page.getByRole("progressbar")).toBeVisible();
  await page.clock.runFor(2000);
  await expect(page.getByRole("alert")).toContainText("COMPILE ERROR");
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reload" })).toBeEnabled();
});
