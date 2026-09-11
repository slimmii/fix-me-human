import { expect, test } from "@playwright/test";
import { useSimpleComputer } from "../fixtures/simple-computer";

test.beforeEach(async ({ page }) => {
  await useSimpleComputer(page);
  await page.goto("/");
});

test("fullscreen enters the browser fullscreen mode and tracks external exits", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.fullscreenElement === document.documentElement,
      ),
    )
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "Exit fullscreen" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => document.exitFullscreen());
  await expect(
    page.getByRole("button", { name: "Fullscreen", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click();
  await page.getByRole("button", { name: "Exit fullscreen" }).click();
  await expect
    .poll(() => page.evaluate(() => document.fullscreenElement === null))
    .toBe(true);
});

test("the game fits short and resized viewports without page scrolling", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1280, height: 540 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.locator(".game")).toHaveCSS(
      "height",
      `${viewport.height}px`,
    );
    const size = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    expect(size).toEqual(viewport);
  }
});

test("a rejected fullscreen request leaves the toggle off and explains the failure", async ({
  page,
}) => {
  await page.evaluate(() => {
    document.documentElement.requestFullscreen = () =>
      Promise.reject(new Error("Denied"));
  });
  await page.getByRole("button", { name: "Fullscreen", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Fullscreen could not be changed",
  );
  await expect(
    page.getByRole("button", { name: "Fullscreen", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
});
