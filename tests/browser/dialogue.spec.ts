import { test, expect } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";

for (const phase of ["briefing", "review"] as const) {
  test(`B.U.G. advances ${phase} from the conversation without leaving the computer`, async ({
    page,
  }) => {
    const save = fresh();
    save.phase = phase;
    if (phase === "review") save.completed = ["0-0"];
    save.settings.reducedMotion = true;
    save.settings.mute = true;
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [KEY, JSON.stringify(save)],
    );
    await page.goto("/");
    await page.locator('[data-surface="crt-glass"]').click();
    const dialogue = page.getByRole("region", {
      name: "Conversation with B.U.G.",
    });
    await dialogue.locator("p").click();
    await expect(page.locator("main")).toHaveClass(/focused/);
    if (phase === "briefing") {
      await dialogue.getByRole("button", { name: "Go on, B.U.G." }).click();
      await dialogue.getByRole("button", { name: "Go on, B.U.G." }).click();
      await dialogue.getByRole("button", { name: "Let me type" }).click();
    } else {
      await dialogue
        .getByRole("button", { name: "Try the independent repair" })
        .click();
    }
    await expect(
      page.getByRole("textbox", { name: "Your React code" }),
    ).toBeVisible();
    await expect(page.locator("main")).toHaveClass(/focused/);
    await page.mouse.click(10, 500);
    await expect(page.locator("main")).not.toHaveClass(/focused/);
  });
}
