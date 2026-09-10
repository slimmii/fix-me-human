import { expect, test } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";

for (const reducedMotion of [false, true]) {
  test(`desk radio plays the supplied track and obeys mute (reduced motion: ${reducedMotion})`, async ({
    page,
  }) => {
    const save = fresh();
    save.settings.reducedMotion = reducedMotion;
    save.settings.graphicsQuality = 0;
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [KEY, JSON.stringify(save)],
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    const audio = page.locator("audio");
    const play = page.getByRole("button", {
      name: "Play Focus Flow on the radio",
    });
    const pause = page.getByRole("button", {
      name: "Pause Focus Flow on the radio",
    });
    await expect(play).toBeVisible({ timeout: 30000 });
    await expect(audio).toHaveJSProperty("paused", true);
    await play.click();
    await expect(pause).toHaveAttribute("aria-pressed", "true", {
      timeout: 15000,
    });
    await expect(page.getByRole("status")).toContainText(
      "Do try to keep up with the background music.",
    );
    await page
      .getByRole("button", { name: "BACK TO WORK", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Welcome, human!");
    await expect(
      page.getByRole("region", { name: "Conversation with B.U.G." }),
    ).toHaveAttribute("data-story-event", "briefing");
    await expect
      .poll(() =>
        audio.evaluate((element: HTMLAudioElement) => element.currentTime),
      )
      .toBeGreaterThan(0);
    await expect(audio).toHaveJSProperty("loop", false);
    await page.getByRole("button", { name: "Sound on", exact: true }).click();
    await expect(audio).toHaveJSProperty("muted", true);
    await expect(pause).toContainText("MUTED");
    await page.getByRole("button", { name: "Sound off", exact: true }).click();
    await expect(audio).toHaveJSProperty("muted", false);
    await page.screenshot({
      path: `test-results/radio-playing-${reducedMotion}.png`,
    });
    await pause.focus();
    await page.keyboard.press("Enter");
    await expect(play).toBeVisible();
    await expect(audio).toHaveJSProperty("paused", true);
    const pausedAt = await audio.evaluate(
      (element: HTMLAudioElement) => element.currentTime,
    );
    await play.click();
    await expect
      .poll(() =>
        audio.evaluate((element: HTMLAudioElement) => element.currentTime),
      )
      .toBeGreaterThan(pausedAt);
    await expect(
      page.getByRole("button", { name: "Next radio track" }),
    ).toHaveCount(0);
    await audio.evaluate((element: HTMLAudioElement) => {
      element.currentTime = element.duration - 0.1;
    });
    await expect(audio).toHaveAttribute("src", /all-vibes\.mp3$/);
    const pauseVibes = page.getByRole("button", {
      name: "Pause All Vibes on the radio",
    });
    await expect(pauseVibes).toHaveAttribute("aria-pressed", "true", {
      timeout: 15000,
    });
    await expect
      .poll(() =>
        audio.evaluate((element: HTMLAudioElement) => element.currentTime),
      )
      .toBeGreaterThan(0);
    await pauseVibes.click();
    await expect(audio).toHaveJSProperty("paused", true);
    await page
      .getByRole("button", { name: "Play All Vibes on the radio" })
      .click();
    await expect(pauseVibes).toHaveAttribute("aria-pressed", "true");
    await audio.evaluate((element: HTMLAudioElement) => {
      element.currentTime = element.duration - 0.1;
    });
    await expect(audio).toHaveAttribute("src", /focus-flow\.mp3$/);
    await expect(pause).toHaveAttribute("aria-pressed", "true", {
      timeout: 15000,
    });
    await page.locator('[data-surface="crt-glass"]').click();
    await expect(audio).toHaveJSProperty("paused", false);
    expect(errors).toEqual([]);
  });
}
