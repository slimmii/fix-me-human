import { expect, test, type Page } from "@playwright/test";

async function readCoffee(page: Page) {
  return JSON.parse((await page.locator("#coffee-state").textContent())!) as {
    x: number;
    y: number;
    tilt: number;
    level: number;
    drops: number;
    puddles: number;
  };
}

test.beforeEach(async ({ page }) => {
  await page.route("**/coffee-check*", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: '<html><body style="margin:0"><div id="root" style="width:900px;height:650px"></div><p id="quote"></p><output id="coffee-state"></output><script type="module">import RefreshRuntime from "/@react-refresh"; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => (type) => type; window.__vite_plugin_react_preamble_installed__ = true; await import("/tests/fixtures/coffee-harness.tsx");</script></body></html>',
    }),
  );
  await page.clock.install();
});

test("coffee sits below the lip, sloshes on click, and leaves a lower fill and puddles", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/coffee-check");
  await expect(page.locator("#coffee-state")).toContainText("level");
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  const initial = await readCoffee(page);
  expect(initial.level).toBeCloseTo(0.19);
  expect(initial.puddles).toBe(0);
  const clip = { x: 0, y: 0, width: 900, height: 650 };
  await page.screenshot({ path: "test-results/coffee-resting.png", clip });
  await page.mouse.click(initial.x, initial.y);
  await page.mouse.move(850, 600);
  await page.clock.runFor(250);
  const sloshing = await readCoffee(page);
  expect(sloshing.tilt).toBeGreaterThan(0.01);
  expect(sloshing.drops).toBeGreaterThan(0);
  await page.screenshot({ path: "test-results/coffee-sloshing.png", clip });
  await page.clock.runFor(5000);
  const settled = await readCoffee(page);
  expect(settled.level).toBeLessThan(initial.level - 0.005);
  expect(settled.tilt).toBeLessThan(0.001);
  expect(settled.drops).toBe(0);
  expect(settled.puddles).toBeGreaterThan(0);
  await page.screenshot({ path: "test-results/coffee-spilled.png", clip });
  await expect(page.locator("#quote")).toContainText("Coffee:");
  expect(errors).toEqual([]);
});

test("dragging outside the mug shakes it and releasing lets it settle", async ({
  page,
}) => {
  await page.goto("/coffee-check");
  await expect(page.locator("#coffee-state")).toContainText("level");
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  const initial = await readCoffee(page);
  await page.mouse.move(initial.x, initial.y);
  await page.mouse.down();
  for (const dx of [160, -160, 160]) {
    await page.mouse.move(initial.x + dx, initial.y, { steps: 4 });
    await page.clock.runFor(180);
  }
  await page.mouse.up();
  await page.clock.runFor(5000);
  const released = await readCoffee(page);
  expect(released.level).toBeLessThan(initial.level - 0.005);
  expect(released.puddles).toBeGreaterThan(0);
  expect(released.tilt).toBeLessThan(0.001);
  await page.mouse.move(initial.x, initial.y);
  await page.clock.runFor(1000);
  expect((await readCoffee(page)).tilt).toBeLessThan(0.001);
});

test("reduced motion keeps the mug and coffee still on click", async ({
  page,
}) => {
  await page.goto("/coffee-check?reduced");
  await expect(page.locator("#coffee-state")).toContainText("level");
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  const initial = await readCoffee(page);
  await page.mouse.click(initial.x, initial.y);
  await page.clock.runFor(1000);
  const after = await readCoffee(page);
  expect(after.level).toBe(initial.level);
  expect(after.tilt).toBe(0);
  expect(after.drops).toBe(0);
  expect(after.puddles).toBe(0);
  await expect(page.locator("#quote")).toContainText("Coffee:");
});
