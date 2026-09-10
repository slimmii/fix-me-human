import { test, expect } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";

test("course Help fills the terminal with retro scroll controls and arrow navigation", async ({
  page,
}) => {
  const save = fresh();
  save.settings.reducedMotion = true;
  save.settings.mute = true;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  await page
    .getByRole("region", { name: "Conversation with B.U.G." })
    .locator("p")
    .click();
  await expect(page.locator("main")).toHaveClass(/focused/);
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await editor.fill("const greeting = 'Hello';");
  await expect(page.locator(".machine-menubar")).toHaveCount(0);
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await expect(page.getByRole("menu").getByRole("menuitem")).toHaveText([
    "OpenCtrl+O",
    "SaveCtrl+S",
    "Exit",
  ]);
  await page.getByRole("menuitem", { name: "Save Ctrl+S" }).click();
  await expect(page.locator(".qbasic-status")).toContainText(
    "Office.tsx saved on local disk.",
  );
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Exit", exact: true }).click();
  await expect(page.locator("main")).not.toHaveClass(/focused/);
  await page.locator('[data-surface="crt-glass"]').click();
  const helpMenu = page.getByRole("menuitem", { name: "Help", exact: true });
  await expect(helpMenu).not.toHaveAttribute("aria-haspopup", "menu");
  await helpMenu.click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  const help = page.getByRole("complementary", {
    name: "Course material",
    exact: true,
  });
  await page
    .getByRole("button", { name: "Read topic: React fundamentals" })
    .click();
  await expect(editor).toBeHidden();
  await expect(page.getByRole("menubar", { name: "Editor menu" })).toBeHidden();
  await expect(
    page.getByRole("button", { name: "← Previous", exact: true }),
  ).toBeDisabled();
  const dimensions = await help.evaluate((el) => ({
    width: el.clientWidth,
    workspace: el.parentElement!.clientWidth,
    height: el.clientHeight,
    workspaceHeight: el.parentElement!.clientHeight,
  }));
  expect(dimensions.width).toBe(dimensions.workspace);
  expect(dimensions.height).toBe(dimensions.workspaceHeight);
  const heading = help.getByRole("heading", { level: 1 });
  await heading.press("ArrowRight");
  const reader = page.locator(".lesson-scroll");
  await page
    .getByRole("button", { name: "Scroll lesson down", exact: true })
    .click();
  await expect
    .poll(() => reader.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  await heading.press("End");
  await expect
    .poll(() => reader.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "← Previous", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Meet the component",
    }),
  ).toBeVisible();
  await expect.poll(() => reader.evaluate((el) => el.scrollTop)).toBe(0);
  await heading.press("ArrowLeft");
  await expect(help).toContainText("Page 1 of");
  await heading.press("ArrowRight");
  await expect(help).toContainText("Page 2 of");
  await page.screenshot({ path: "test-results/full-screen-terminal-help.png" });
  await heading.press("Escape");
  await expect(help).toHaveCount(0);
  await expect(editor).toBeFocused();
  await expect(editor).toHaveText("const greeting = 'Hello';");
  await editor.press("ArrowRight");
  await expect(help).toHaveCount(0);
  await expect(page.locator("main")).toHaveClass(/focused/);
  await editor.press("Alt+h");
  await expect(help).toBeVisible();
  await heading.press("F1");
  await expect(editor).toBeFocused();
});
