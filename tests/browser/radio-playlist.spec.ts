import { expect, test } from "@playwright/test";

test("radio plays both MP3s as one looping playlist", async ({ page }) => {
  await page.route("**/radio-check", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<html><body><div id="root" style="width:900px;height:650px"></div><p id="quote"></p><script type="module">import RefreshRuntime from "/@react-refresh"; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => (type) => type; window.__vite_plugin_react_preamble_installed__ = true; await import("/tests/fixtures/radio-harness.tsx");</script></body></html>',
    }),
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/radio-check");
  const audio = page.locator("audio");
  await page
    .getByRole("button", { name: "Play Focus Flow on the radio" })
    .click();
  await expect
    .poll(() =>
      audio.evaluate((el: HTMLAudioElement) => ({
        paused: el.paused,
        error: el.error?.message,
        ready: el.readyState,
        time: el.currentTime,
      })),
    )
    .toMatchObject({ paused: false });
  await expect
    .poll(() => audio.evaluate((el: HTMLAudioElement) => el.currentTime))
    .toBeGreaterThan(0);
  const quote = page.locator("#quote");
  await expect(quote).toContainText("Focus Flow");
  const firstQuote = await quote.textContent();
  await audio.evaluate((el: HTMLAudioElement) => {
    el.currentTime = el.duration - 0.1;
  });
  await expect(audio).toHaveAttribute("src", /all-vibes\.mp3$/);
  await expect
    .poll(() => audio.evaluate((el: HTMLAudioElement) => el.currentTime))
    .toBeGreaterThan(0);
  await expect(quote).toHaveText(firstQuote!);
  await page
    .getByRole("button", { name: "Pause All Vibes on the radio" })
    .click();
  await expect(audio).toHaveJSProperty("paused", true);
  await page
    .getByRole("button", { name: "Play All Vibes on the radio" })
    .click();
  await expect(audio).toHaveJSProperty("paused", false);
  await expect(quote).toContainText("All Vibes");
  const resumedQuote = await quote.textContent();
  await audio.evaluate((el: HTMLAudioElement) => {
    el.currentTime = el.duration - 0.1;
  });
  await expect(audio).toHaveAttribute("src", /focus-flow\.mp3$/);
  await expect
    .poll(() => audio.evaluate((el: HTMLAudioElement) => el.currentTime))
    .toBeGreaterThan(0);
  await expect(
    page.getByRole("button", { name: "Next radio track" }),
  ).toHaveCount(0);
  await expect(quote).toHaveText(resumedQuote!);
  expect(errors).toEqual([]);
});
