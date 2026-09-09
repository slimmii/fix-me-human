import { codingSave } from "../fixtures/curriculum";
import { test, expect } from "@playwright/test";
import { KEY } from "../../src/progression";
test("QBasic menus run a separate CRT browser and return to the intact editor", async ({
  page,
}) => {
  const code =
    'import { useState } from "react";\nconst name = "Human";\nexport default function Welcome() {\n  const [count, setCount] = useState(0);\n  return <><h1 className="welcome">Hello, {name}</h1>\n    <p>Office status: questionable.</p>\n    <button onClick={() => setCount(c => c + 1)}>Coffee {count}</button></>;\n}';
  const save = codingSave();
  save.settings.reducedMotion = true;
  save.settings.mute = true;
  save.drafts["hello-bug"] = code;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  const editor = page.getByRole("textbox", { name: "Your React code" });
  await expect(editor).toBeVisible();
  await expect(page.locator('.cm-line[data-line-number="1"]')).toBeVisible();
  await expect(page.locator(".qbasic-source")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await editor.press("Alt+r");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.screenshot({ path: "test-results/qbasic-editor.png" });
  await page.getByRole("menuitem", { name: "Start F5" }).click();
  await expect(editor).toBeHidden();
  const browser = page.frameLocator("iframe");
  await expect(
    browser.getByRole("heading", { name: "Hello, Human" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(browser.locator("body")).toHaveCSS(
    "background-color",
    "rgb(0, 0, 128)",
  );
  await expect(browser.getByRole("button", { name: "Coffee 0" })).toHaveCSS(
    "border-radius",
    "0px",
  );
  await browser.getByRole("button", { name: "Coffee 0" }).click();
  await expect(browser.getByRole("button", { name: "Coffee 1" })).toBeVisible();
  await page.screenshot({ path: "test-results/retro-browser.png" });
  await browser.getByRole("button", { name: "Coffee 1" }).press("F6");
  await expect(editor).toBeVisible();
  await expect(editor).toHaveText(code, { useInnerText: true });
  await page.getByRole("menuitem", { name: "Search", exact: true }).click();
  await page
    .getByRole("menuitem", { name: "Find / Replace... Ctrl+F" })
    .click();
  await expect(page.getByPlaceholder("Find")).toBeVisible();
});
