import { test, expect } from "@playwright/test";
import { KEY } from "../../src/progression";
import { codingSave } from "../fixtures/curriculum";

test("screen font size updates live, preserves editor and output state, and survives reload", async ({
  page,
}) => {
  const code = `import { useState } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  return <><h1>Sprint board</h1><button onClick={() => setCount(c => c + 1)}>Coffee {count}</button></>;
}`;
  const save = codingSave(code);
  save.settings.graphicsQuality = 0;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await expect(page.locator('[data-surface="crt-glass"]')).toBeVisible({
    timeout: 30000,
  });
  await page.screenshot({ path: "test-results/keyboard-on-desk.png" });
  await page.locator('[data-surface="crt-glass"]').click();
  const editorFrame = page.frameLocator('iframe[title="Code editor"]');
  const editor = editorFrame.getByRole("textbox", { name: "Your React code" });
  await expect(editor).toHaveCSS("font-size", "14px");
  await editor.press("ControlOrMeta+End");
  await editor.pressSequentially(" // font test");
  await page.screenshot({ path: "test-results/screen-font-default.png" });
  await editor.press("F5");
  const output = page.frameLocator('iframe[title="Your retro browser"]');
  await expect(page.locator(".retro-browser-page")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  await output.getByRole("button", { name: "Coffee 0" }).press("Enter");
  await expect(output.getByRole("button", { name: "Coffee 1" })).toBeVisible();
  await page.getByRole("button", { name: "← Editor F6" }).click();
  await editor.press("Escape");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const size = page.getByRole("slider", { name: "Screen font size" });
  await expect(size).toHaveValue("14");
  await size.focus();
  await size.press("End");
  await expect(size).toHaveValue("20");
  await expect(editor).toHaveCSS("font-size", "20px");
  await expect(output.locator("body")).toHaveCSS("font-size", "20px");
  await expect(output.locator("button")).toHaveText("Coffee 1");
  await expect(editor).toHaveText(code + " // font test", {
    useInnerText: true,
  });
  await page.screenshot({ path: "test-results/screen-font-settings.png" });
  await page.getByRole("button", { name: "Back to work" }).click();
  await page.locator('[data-surface="crt-glass"]').click();
  await page.screenshot({ path: "test-results/screen-font-large.png" });
  await page.getByRole("button", { name: "F6=Output", exact: true }).click();
  await expect(output.getByRole("button", { name: "Coffee 1" })).toBeVisible();
  await page.getByRole("button", { name: "← Editor F6" }).click();
  await editor.press("ControlOrMeta+z");
  await expect(editor).toHaveText(code, { useInnerText: true });
  await editor.press("F1");
  await expect(page.locator(".lesson-markdown")).toHaveCSS("font-size", "20px");
  await page.reload();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(size).toHaveValue("20");
  await size.focus();
  await size.press("Home");
  await expect(size).toHaveValue("10");
  await page.getByRole("button", { name: "Back to work" }).click();
  await page.locator('[data-surface="crt-glass"]').click();
  await expect(editor).toHaveCSS("font-size", "10px");
  await expect(editor).toHaveText(code, { useInnerText: true });
  await page.screenshot({ path: "test-results/screen-font-small.png" });
});
