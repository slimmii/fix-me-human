import { test, expect } from "@playwright/test";
import { KEY } from "../../src/progression";
import { assignment, codingSave } from "../fixtures/curriculum";

test.use({ viewport: { width: 1600, height: 900 } });

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
