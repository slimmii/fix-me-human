import { test, expect, type Page } from "@playwright/test";
import { KEY } from "../../src/progression";
import { codingSave } from "../fixtures/curriculum";
import { useSimpleComputer } from "../fixtures/simple-computer";
import { MAX_SCREEN_FONT_SIZE } from "../../src/screen-font";

async function exitBasic(page: Page) {
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Exit", exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await useSimpleComputer(page);
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(codingSave())],
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Start", exact: true }).click();
});

test("Exit opens the desktop and Basic reopens with its draft, cursor and undo history", async ({
  page,
}) => {
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await editor.fill("// my work");
  await editor.press("End");
  await editor.press("Enter");
  await editor.press("x");
  await exitBasic(page);
  await expect(page.locator("main")).toHaveClass(/focused/);
  await expect(
    page.getByRole("region", { name: "B.U.G. OS desktop" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "B.U.G. Basic", exact: true }),
  ).toBeFocused();
  await expect(page.locator(".assignment-workspace")).toBeHidden();
  await page
    .locator(".machine-screen")
    .screenshot({ path: "test-results/bug-desktop.png" });
  await page.keyboard.press("Enter");
  await expect(editor).toBeFocused();
  await expect(editor).toContainText("// my work");
  await expect(editor).toContainText("x");
  await expect(page.locator(".qbasic-ruler")).toContainText("Ln 2, Col 2");
  await editor.press("ControlOrMeta+z");
  await expect(editor).not.toContainText("x");
  await expect(editor).toContainText("// my work");
  await exitBasic(page);
  await page.keyboard.press("Escape");
  await expect(page.locator("main")).not.toHaveClass(/focused/);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "B.U.G. OS desktop" }),
  ).toBeVisible();
});

test("Snake plays, pauses, saves a high score, restarts and exits to the desktop", async ({
  page,
}) => {
  await exitBasic(page);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Snake", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  const snake = page.getByRole("dialog", { name: "Snake", exact: true });
  await expect(snake).toBeFocused();
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 100));
  await snake.screenshot({ path: "test-results/snake-ready.png" });
  await page.keyboard.press("Space");
  await page.clock.runFor(1080);
  await expect(snake.getByLabel("Score: 10", { exact: true })).toBeVisible();
  await expect(snake.locator("[data-snake-head]")).toHaveAttribute("x", "120");
  await page.keyboard.press("Space");
  await expect(snake.getByRole("status")).toHaveText("PAUSED");
  await page.clock.runFor(1000);
  await expect(snake.locator("[data-snake-head]")).toHaveAttribute("x", "120");
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowUp");
  await page.clock.runFor(180);
  await expect(snake.locator("[data-snake-head]")).toHaveAttribute("y", "70");
  await snake.getByRole("button", { name: "Move left", exact: true }).click();
  await page.clock.runFor(180);
  await expect(snake.locator("[data-snake-head]")).toHaveAttribute("x", "110");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(snake.getByRole("status")).toHaveText("PAUSED");
  await page.keyboard.press("r");
  await expect(snake.getByLabel("Score: 0", { exact: true })).toBeVisible();
  await page.clock.runFor(3240);
  await expect(snake.getByRole("status")).toHaveText("GAME OVER");
  await snake.screenshot({ path: "test-results/snake-game-over.png" });
  await page.keyboard.press("Escape");
  await expect(snake).toHaveCount(0);
  await expect(page.locator("main")).toHaveClass(/focused/);
  await page.getByRole("button", { name: "Snake", exact: true }).click();
  await expect(
    snake.getByLabel("Best score: 10", { exact: true }),
  ).toBeVisible();
  await snake.getByRole("button", { name: "Close Snake" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await exitBasic(page);
  await page.getByRole("button", { name: "Snake", exact: true }).click();
  await expect(
    snake.getByLabel("Best score: 10", { exact: true }),
  ).toBeVisible();
});

test("Snake fits the physical monitor and largest screen font", async ({
  page,
}) => {
  await exitBasic(page);
  await page.locator(".machine-screen").evaluate((screen, fontSize) => {
    screen.style.width = "832px";
    screen.style.height = "472px";
    screen.style.setProperty("--screen-font-size", `${fontSize}px`);
  }, MAX_SCREEN_FONT_SIZE);
  await page.getByRole("button", { name: "Snake", exact: true }).click();
  const snake = page.getByRole("dialog", { name: "Snake", exact: true });
  await expect(
    snake.getByRole("button", { name: "Close Snake" }),
  ).toBeVisible();
  const overflow = await page.locator(".snake-content").evaluate((element) => ({
    horizontal: element.scrollWidth > element.clientWidth,
    vertical: element.scrollHeight > element.clientHeight,
  }));
  expect(overflow).toEqual({ horizontal: false, vertical: false });
  const screenBounds = await page.locator(".machine-screen").boundingBox();
  const windowBounds = await snake.boundingBox();
  expect(windowBounds!.y + windowBounds!.height).toBeLessThan(
    screenBounds!.y + screenBounds!.height,
  );
  await page
    .locator(".machine-screen")
    .screenshot({ path: "test-results/snake-monitor-large-font.png" });
  await page.keyboard.press("Shift+Tab");
  await expect(snake.getByRole("button", { name: "New game" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    snake.getByRole("button", { name: "Close Snake" }),
  ).toBeFocused();
});
