import { test, expect } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";
import { curriculum } from "../../src/curriculum";
import { storyChapters } from "../../src/game/storyScripts";

async function seed(page: import("@playwright/test").Page) {
  const save = fresh();
  save.settings.mute = true;
  save.settings.reducedMotion = true;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
}

test("player-led story prints, remembers delivery and reacts to the whole first chapter", async ({
  page,
}) => {
  await seed(page);
  const first = curriculum[0].assignments[0];
  const second = curriculum[1].assignments[0];
  await page.goto("/");
  const dialogue = page.getByRole("region", {
    name: "Conversation with B.U.G.",
  });
  const caption = page.getByRole("status");
  const next = page.getByRole("button", {
    name: "Continue B.U.G. dialogue",
    exact: true,
  });
  const pickup = page.getByRole("button", {
    name: `Grab new assignment: ${first.title}`,
    exact: true,
  });
  await expect(caption).toHaveText(first.robot!.intro);
  await expect(dialogue).toHaveAttribute("data-story-event", "briefing");
  await expect(page.locator('[data-surface="crt-glass"]')).toBeVisible();
  // Deliberately wait longer than the printer duration to prove no timer starts it.
  await page.waitForTimeout(3300);
  await expect(pickup).toHaveCount(0);
  await page.screenshot({
    path: "test-results/bug-story-awaiting-continue.png",
  });
  await next.focus();
  await next.press("Enter");
  await expect(dialogue).toHaveAttribute("data-story-event", "printing");
  await page.reload();
  await expect(pickup).toBeEnabled({ timeout: 15000 });
  await expect(dialogue).toHaveAttribute("data-story-event", "ready");
  await page.reload();
  await expect(dialogue).toHaveAttribute("data-story-event", "ready");
  await expect(pickup).toBeEnabled({ timeout: 15000 });
  await pickup.click();
  await expect(caption).toHaveText(storyChapters[0].collected);
  await page
    .getByRole("button", {
      name: `Read printed assignment: ${first.title}`,
      exact: true,
    })
    .click();
  await expect(caption).toHaveText(storyChapters[0].paper);
  await page.getByRole("button", { name: "Put assignment down" }).click();
  await page.locator('[data-surface="crt-glass"]').click();
  await expect(caption).toHaveText(storyChapters[0].monitor[0]);
  await next.click();
  await expect(caption).toHaveText(storyChapters[0].monitor[1]);
  await page.getByRole("menuitem", { name: "Help", exact: true }).click();
  await expect(caption).toHaveText(storyChapters[0].help[0]);
  await next.click();
  await expect(caption).toHaveText(storyChapters[0].help[1]);
  await page.getByRole("button", { name: "Close course material" }).click();
  const editor = page.getByLabel("Your React code");
  await editor.fill(first.solution);
  await expect(caption).toHaveText(storyChapters[0].typing);
  await editor.press("End");
  await editor.press("Enter");
  await editor.pressSequentially("// keep going");
  await expect(caption).toHaveText(storyChapters[0].typing);
  await editor.press("F1");
  await expect(caption).toHaveText(storyChapters[0].typing);
  await page.getByRole("button", { name: "Close course material" }).click();
  await editor.fill(
    "export default function App() { return <h1>Wrong heading</h1>; }",
  );
  await editor.press("F5");
  await expect(dialogue).toHaveAttribute("data-story-event", "retry", {
    timeout: 15000,
  });
  await expect(caption).toContainText(first.robot!.retry);
  await expect(caption).toContainText("Sprint board");
  await page.getByRole("button", { name: "← Editor F6" }).click();
  await page.getByRole("button", { name: "Hint", exact: true }).click();
  await expect(caption).toContainText(first.hints[0]);
  await next.click();
  await expect(caption).toContainText("A hint is part of learning");
  await editor.fill(first.solution);
  await editor.press("F5");
  await expect(caption).toHaveText(first.robot!.success, { timeout: 15000 });
  await page.getByRole("button", { name: "Submit assignment" }).click();
  await expect(dialogue).toHaveAttribute("data-story-event", "handoff");
  await expect(caption).toHaveText(storyChapters[0].handoff);
  await expect(
    page.getByRole("button", { name: /^Grab new assignment:/ }),
  ).toHaveCount(0);
  await page.reload();
  await expect(dialogue).toHaveAttribute("data-story-event", "handoff");
  await next.click();
  await expect(caption).toHaveText(second.robot!.intro);
  await expect(
    page.getByRole("button", { name: /^Grab new assignment:/ }),
  ).toHaveCount(0);
  await next.click();
  await expect(
    page.getByRole("button", {
      name: `Grab new assignment: ${second.title}`,
      exact: true,
    }),
  ).toBeEnabled({ timeout: 15000 });
});

test("early actions cannot skip the briefing; the fallback printer also waits for dialogue", async ({
  page,
}) => {
  await seed(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl" || type === "webgl2") return null;
      return original.apply(this, [type, ...args] as never);
    } as typeof original;
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByLabel("Your React code").fill("// already typing");
  await page.getByLabel("Your React code").press("F1");
  const dialogue = page.getByRole("region", {
    name: "Conversation with B.U.G.",
  });
  await expect(dialogue).toHaveAttribute("data-story-event", "briefing");
  await expect(
    page.getByRole("button", { name: /^Grab new assignment:/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Continue B.U.G. dialogue" }).click();
  await expect(
    page.getByRole("button", { name: /^Grab new assignment:/ }),
  ).toBeEnabled({ timeout: 6000 });
  await page.getByRole("button", { name: "Close course material" }).click();
  await page.getByLabel("Your React code").press("Escape");
  await page.getByRole("button", { name: /^Grab new assignment:/ }).click();
  await expect(dialogue).toHaveAttribute("data-story-event", "collected");
});
