import { test, expect } from "@playwright/test";
import { lessons, sourceFor } from "../../src/content";
import { fresh, KEY } from "../../src/progression";
test("actual typed React handles state, refs, independent Hooks, and tag limits", async ({
  page,
}) => {
  await page.goto("/");
  async function open(topic: number, index: number) {
    const s = fresh();
    s.lesson = topic;
    s.exercise = index;
    s.phase = "exercise";
    s.settings.reducedMotion = true;
    s.completed = lessons
      .slice(0, topic)
      .flatMap((l) => l.exercises.map((e) => e.id));
    const e = lessons[topic].exercises[index];
    s.answers[e.id] = {
      code: sourceFor(
        e,
        Object.fromEntries(e.slots.map((slot) => [slot.name, slot.answer])),
      ),
    };
    await page.evaluate(
      ([key, value]) => localStorage.setItem(key, value),
      [KEY, JSON.stringify(s)],
    );
    await page.reload();
    await page.locator('[data-surface="crt-glass"]').click();
    await page.getByRole("button", { name: "Run my code" }).click();
    await expect(
      page.getByRole("button", { name: "Repair complete" }),
    ).toBeVisible({ timeout: 15000 });
  }
  await open(5, 0);
  let browser = page.frameLocator("iframe");
  await browser.getByRole("textbox").fill("Espresso");
  await browser.getByRole("button", { name: "Order", exact: true }).click();
  await browser.getByRole("textbox").fill("Tea");
  await browser.getByRole("button", { name: "Order", exact: true }).click();
  await expect(browser.locator("p")).toHaveText("Espresso, Tea");
  await open(5, 1);
  browser = page.frameLocator("iframe");
  await browser.getByRole("button", { name: "0 coffees" }).click();
  await expect(
    browser.getByRole("button", { name: "2 coffees" }),
  ).toBeVisible();
  await open(7, 0);
  browser = page.frameLocator("iframe");
  await browser.getByRole("button", { name: "Focus", exact: true }).click();
  await expect(browser.getByRole("textbox")).toBeFocused();
  await open(8, 1);
  browser = page.frameLocator("iframe");
  await browser
    .getByRole("button", { name: "false", exact: true })
    .first()
    .click();
  await expect(
    browser.getByRole("button", { name: "true", exact: true }),
  ).toHaveCount(1);
  await expect(
    browser.getByRole("button", { name: "false", exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "← Editor F6" }).click();
  await page
    .getByLabel("Your React code")
    .fill("export default function App(){return <video/>}");
  await page.getByRole("button", { name: "Run my code" }).click();
  await expect(page.locator(".robot-dialogue")).toContainText(
    "<video> is not in our tiny toolbox",
  );
  await expect(page.locator("iframe")).toHaveCount(0);
});
test("WebGL and storage failures preserve the simple coding interface", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl" || type === "webgl2") return null;
      return native.apply(this, [type, ...args] as never);
    } as typeof native;
    localStorage.setItem("please-fix-human:v2", "{invalid");
    Object.defineProperty(Storage.prototype, "setItem", {
      value: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your browser cannot start WebGL." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /^Start/ })
    .first()
    .click();
  await expect(
    page.getByText("Storage unavailable · this session only"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Repair the employee welcome page" }),
  ).toBeVisible();
});
