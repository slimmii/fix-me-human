import { expect, test } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";

for (const reducedMotion of [false, true]) {
  test(`tissues dispense without losing the briefing (reduced motion: ${reducedMotion})`, async ({
    page,
  }) => {
    const save = fresh();
    save.settings.mute = true;
    save.settings.reducedMotion = reducedMotion;
    await page.addInitScript(
      ([key, value]) => {
        localStorage.setItem(key, value);
      },
      [KEY, JSON.stringify(save)],
    );
    await page.goto("/");
    const tissueBox = page.getByRole("button", { name: "Pull a tissue" });
    await expect(tissueBox).toBeVisible({ timeout: 30000 });
    await page.screenshot({
      path: `test-results/tissues-resting-${reducedMotion ? "reduced" : "animated"}.png`,
    });
    const caption = page.getByRole("status");
    const briefing = await caption.textContent();
    await tissueBox.click();
    if (!reducedMotion) await expect(tissueBox).toBeDisabled();
    await expect(tissueBox).toBeEnabled();
    await expect(caption).toContainText("and other bodily fluids");
    for (let i = 0; i < 8; i++) await tissueBox.click();
    await expect(caption).toContainText("filthy little habits");
    await page
      .getByRole("button", { name: "BACK TO WORK", exact: true })
      .click();
    await expect(caption).toHaveText(briefing!);
    await expect(tissueBox).toBeEnabled();
    await tissueBox.focus();
    await tissueBox.press("Enter");
    await expect(caption).toContainText("and other bodily fluids");
    await page.screenshot({
      path: `test-results/tissues-${reducedMotion ? "reduced" : "animated"}.png`,
    });
  });
}
