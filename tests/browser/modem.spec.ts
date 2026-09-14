import { expect, test } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";

declare global {
  interface Window {
    modemPlayers: HTMLAudioElement[];
  }
}

test.beforeEach(async ({ page }) => {
  const save = fresh();
  save.settings.reducedMotion = true;
  save.settings.graphicsQuality = 0;
  await page.addInitScript(
    ([key, value]) => {
      localStorage.setItem(key, value);
      // Observe actual browser audio, without stubbing loading or playback.
      window.modemPlayers = [];
      const BrowserAudio = window.Audio;
      window.Audio = class extends BrowserAudio {
        constructor(src?: string) {
          super(src);
          if (src?.endsWith("audio/dial-up-handshake.mp3"))
            window.modemPlayers.push(this);
        }
      };
    },
    [KEY, JSON.stringify(save)],
  );
});

test("modem plays the real recording, restarts without overlap, and obeys sound settings", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const modem = page.getByRole("button", {
    name: "Play dial-up handshake on the U.S. Robotics modem",
  });
  await expect(modem).toBeVisible({ timeout: 60000 });
  await expect
    .poll(() => page.evaluate(() => window.modemPlayers.at(-1)?.readyState))
    .toBeGreaterThanOrEqual(2);
  const metadata = await page.evaluate(() => {
    const player = window.modemPlayers.at(-1)!;
    return {
      paused: player.paused,
      time: player.currentTime,
      duration: player.duration,
    };
  });
  expect(metadata.paused).toBe(true);
  expect(metadata.time).toBe(0);
  expect(metadata.duration).toBeGreaterThan(28);
  expect(metadata.duration).toBeLessThan(30);

  await modem.click();
  await expect
    .poll(() => page.evaluate(() => window.modemPlayers.at(-1)!.currentTime))
    .toBeGreaterThan(0);
  await expect(page.getByRole("status")).toContainText("stay off the phone");
  await page.getByRole("button", { name: "Sound on", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.modemPlayers.at(-1)!.muted))
    .toBe(true);
  await modem.click();
  expect(await page.evaluate(() => window.modemPlayers.at(-1)!.muted)).toBe(
    true,
  );
  await page.getByRole("button", { name: "Sound off", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.modemPlayers.at(-1)!.muted))
    .toBe(false);

  const count = await page.evaluate(() => window.modemPlayers.length);
  await page.evaluate(() => {
    window.modemPlayers.at(-1)!.currentTime = 12;
  });
  await modem.press("Enter");
  await expect
    .poll(() => page.evaluate(() => window.modemPlayers.at(-1)!.currentTime))
    .toBeLessThan(5);
  expect(await page.evaluate(() => window.modemPlayers.length)).toBe(count);
  expect(
    await page.evaluate(
      () => window.modemPlayers.filter((player) => !player.paused).length,
    ),
  ).toBe(1);

  await page.evaluate(() => {
    const player = window.modemPlayers.at(-1)!;
    player.currentTime = player.duration - 0.2;
  });
  await expect
    .poll(() => page.evaluate(() => window.modemPlayers.at(-1)!.ended))
    .toBe(true);
  await modem.click();
  await expect
    .poll(() => page.evaluate(() => window.modemPlayers.at(-1)!.paused))
    .toBe(false);
  await page.screenshot({ path: "test-results/modem-handshake.png" });
  expect(errors).toEqual([]);
});

test("unavailable handshake reports an error and can retry", async ({
  page,
}) => {
  await page.route("**/audio/dial-up-handshake.mp3", (route) =>
    route.fulfill({ status: 404, body: "Missing recording" }),
  );
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Play dial-up handshake on the U.S. Robotics modem",
    })
    .click({ timeout: 60000 });
  await expect(page.getByRole("status")).toContainText(
    "couldn't play its handshake",
  );
  await page.unroute("**/audio/dial-up-handshake.mp3");
  await page
    .getByRole("button", {
      name: "Play dial-up handshake on the U.S. Robotics modem",
    })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.modemPlayers.at(-1)!.currentTime))
    .toBeGreaterThan(0);
});
