import { test, expect } from "@playwright/test";
import {
  lessons,
  finale,
  sourceFor,
  generate,
  type Exercise,
} from "../../src/content";
import { fresh, KEY } from "../../src/progression";
const solution = (e: Exercise) =>
  sourceFor(e, Object.fromEntries(e.slots.map((s) => [s.name, s.answer])));
test("type and render the complete React campaign, finale, and endless rounds", async ({
  page,
}) => {
  const initial = fresh();
  initial.settings.reducedMotion = true;
  initial.settings.mute = true;
  await page.addInitScript(
    ([key, value]) => {
      if (window !== window.top) return;
      if (!localStorage.getItem(key)) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(initial)],
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  async function briefing() {
    await page.getByRole("button", { name: "Go on, B.U.G." }).click();
    await page.getByRole("button", { name: "Go on, B.U.G." }).click();
    await page.getByRole("button", { name: "Let me type" }).click();
  }
  async function solve(e: Exercise) {
    console.log("Typing", e.id);
    await page.getByLabel("Your React code").fill(solution(e));
    await page.getByRole("button", { name: "Run my code" }).click();
    await expect(
      page.getByRole("button", { name: "Repair complete" }),
    ).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "Repair complete" }).click();
  }
  for (let i = 0; i < 11; i++) {
    await briefing();
    if (i === 0) {
      await page
        .getByLabel("Your React code")
        .fill(
          'export default function Welcome(){ return <h1 className="welcome">Hello, {name}</h1>; }',
        );
      await page.getByRole("button", { name: "Run my code" }).click();
      await expect(
        page.getByRole("button", { name: "Repair complete" }),
      ).toHaveCount(0);
      await page.getByRole("button", { name: "← Editor F6" }).click();
      await page
        .getByLabel("Your React code")
        .fill(solution(lessons[0].exercises[0]));
      await page.reload();
      await page.locator('[data-surface="crt-glass"]').click();
      await expect(page.getByLabel("Your React code")).toHaveText(
        solution(lessons[0].exercises[0]),
        { useInnerText: true },
      );
    }
    await solve(lessons[i].exercises[0]);
    await page
      .getByRole("button", { name: "Try the independent repair" })
      .click();
    await solve(lessons[i].exercises[1]);
    await page
      .getByRole("button", {
        name: i === 10 ? "Build my final project" : "Next assignment",
      })
      .click();
  }
  for (const e of finale) await solve(e);
  await expect(
    page.getByText("UNLIMITED EMPLOYMENT.", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/ending.png" });
  await page.getByRole("button", { name: "Begin Endless Shift" }).click();
  for (let i = 0; i < 4; i++) {
    const s = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      KEY,
    );
    await solve(
      generate(
        s.endless.seed,
        s.endless.topic,
        s.endless.difficulty,
        s.endless.previousFamily,
      ),
    );
  }
  await expect(page.getByText("4 repaired")).toBeVisible();
  await page.reload();
  await page.locator('[data-surface="crt-glass"]').click();
  await expect(page.getByText("4 repaired")).toBeVisible();
  expect(errors).toEqual([]);
});
test("the playable interface is inside the CRT and supports keyboard, settings, and real rendered output", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "test-results/desk.png" });
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Reduce motion").check();
  await page.getByLabel("Mute sound").check();
  await page.getByRole("button", { name: "Back to work" }).click();
  await page.locator('[data-surface="crt-glass"]').click();
  // Demand rendering must update the HTML transform in the same frame as the camera.
  await expect
    .poll(async () => {
      const screen = await page
        .locator('[data-surface="crt-glass"]')
        .boundingBox();
      return screen?.width ?? 0;
    })
    .toBeGreaterThan(1000);

  await page.getByRole("button", { name: "Go on, B.U.G." }).click();
  await page.getByRole("button", { name: "Go on, B.U.G." }).click();
  await page.getByRole("button", { name: "Let me type" }).click();
  await page
    .getByLabel("Your React code")
    .fill(
      'const name = "Actual typed human";\nexport default function Welcome(){ return <h1 className="welcome">Hello, {name}</h1>; }',
    );
  await page.getByLabel("Your React code").press("Control+Enter");
  await expect(
    page
      .frameLocator("iframe")
      .getByRole("heading", { name: "Hello, Actual typed human" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".machine-screen")).toHaveCount(1);
  await expect(page.locator(".terminal")).toHaveCount(0);
  await expect(page.locator(".slot select")).toHaveCount(0);
  await page.screenshot({ path: "test-results/computer.png" });
  for (const size of [
    { width: 1280, height: 800 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(size);
    await page.screenshot({ path: `test-results/computer-${size.width}.png` });
  }
  await page.getByRole("button", { name: "← Editor F6" }).click();
  await page.getByLabel("Your React code").press("Escape");
  await expect(page.locator("main")).not.toHaveClass(/focused/);
  await expect(page.getByRole("button", { name: "Sound off" })).toBeVisible();
});
