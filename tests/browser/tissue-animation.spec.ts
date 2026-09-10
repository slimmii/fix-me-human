import { expect, test } from "@playwright/test";

test("tissue lifts out before a replacement emerges", async ({ page }) => {
  await page.route("**/tissue-check", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<html><body style="margin:0"><div id="root" style="width:900px;height:650px"></div><p id="quote"></p><script type="module">import RefreshRuntime from "/@react-refresh"; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => (type) => type; window.__vite_plugin_react_preamble_installed__ = true; await import("/tests/fixtures/tissue-harness.tsx");</script></body></html>',
    }),
  );
  await page.clock.install();
  await page.goto("/tissue-check");
  const tissueBox = page.getByRole("button", { name: "Pull a tissue" });
  await expect(tissueBox).toBeVisible({ timeout: 30000 });
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 60000));
  const clip = { x: 0, y: 0, width: 900, height: 650 };
  await page.screenshot({ path: "test-results/tissue-0-resting.png", clip });
  const box = (await tissueBox.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.clock.runFor(16);
  await expect(tissueBox).toBeDisabled();
  await page.screenshot({ path: "test-results/tissue-1-start.png", clip });
  await page.clock.runFor(320);
  await page.screenshot({ path: "test-results/tissue-2-pulling.png", clip });
  await page.clock.runFor(620);
  await expect(tissueBox).toBeEnabled();
  await page.screenshot({ path: "test-results/tissue-3-released.png", clip });
  await page.clock.runFor(1000);
  await page.screenshot({ path: "test-results/tissue-4-settled.png", clip });
  await expect(page.locator("#quote")).toContainText("and other bodily fluids");
});
