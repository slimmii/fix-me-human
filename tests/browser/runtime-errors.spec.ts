import { test, expect } from "@playwright/test";
import { KEY } from "../../src/progression";
import { assignment, codingSave } from "../fixtures/curriculum";
import { useSimpleComputer } from "../fixtures/simple-computer";

test.beforeEach(async ({ page }) => {
  await useSimpleComputer(page);
});

const board = `interface Task { title: string }

export function broken() {
  const task = null as Task | null;
  return task.title.toUpperCase();
}`;

for (const scenario of [
  {
    name: "rendering an imported function",
    source:
      'import { broken } from "./board"; export default function App() { return <h1>{broken()}</h1>; }',
  },
  {
    name: "initializing an imported module",
    source:
      'import { broken } from "./board"; const title = broken(); export default function App() { return <h1>{title}</h1>; }',
  },
  {
    name: "running an effect",
    source:
      'import { useEffect } from "react"; import { broken } from "./board"; export default function App() { useEffect(() => { broken(); }, []); return <h1>Sprint board</h1>; }',
  },
  {
    name: "clicking a button",
    source:
      'import { broken } from "./board"; export default function App() { return <><h1>Sprint board</h1><button onClick={broken}>Break</button></>; }',
    click: true,
  },
  {
    name: "rejecting an async handler",
    source:
      'import { broken } from "./board"; export default function App() { return <><h1>Sprint board</h1><button onClick={async () => { await Promise.resolve(); broken(); }}>Break</button></>; }',
    click: true,
  },
]) {
  test(`runtime errors show the original file and line when ${scenario.name}`, async ({
    page,
  }) => {
    const save = codingSave();
    save.settings.graphicsQuality = 0;
    save.projects[assignment.id] = {
      files: { "App.tsx": scenario.source, "board.ts": board },
      activeFile: "App.tsx",
    };
    await page.addInitScript(
      ([key, value]) => {
        if (window === window.top) localStorage.setItem(key, value);
      },
      [KEY, JSON.stringify(save)],
    );
    await page.goto("/");
    await page
      .getByRole("button", { name: "Start", exact: true })
      .first()
      .click();
    await page.getByRole("menuitem", { name: "Run", exact: true }).click();
    await page.getByRole("menuitem", { name: "Start F5" }).click();
    if (scenario.click) {
      await expect(
        page.getByRole("button", { name: "Submit assignment" }),
      ).toBeVisible({ timeout: 15000 });
      await page
        .frameLocator('iframe[title="Your retro browser"]')
        .getByRole("button", { name: "Break", exact: true })
        .click();
    }
    const error = page.getByRole("alert");
    await expect(error).toContainText("board.ts: Line 5, Column 15", {
      timeout: 15000,
    });
    await expect(error).toContainText(
      "TypeError: Cannot read properties of null",
    );
    await expect(error).toContainText("5 |   return task.title.toUpperCase();");
    await expect(error).not.toContainText("program.js");
    await expect(
      page.getByRole("button", { name: "Submit assignment" }),
    ).toHaveCount(0);
    if (scenario.click)
      await error.screenshot({
        path: "test-results/runtime-source-location.png",
      });
    await page
      .getByRole("button", { name: "Return to editor", exact: true })
      .click();
    await expect(
      page
        .frameLocator('iframe[title="Code editor"]')
        .getByLabel("Your React code"),
    ).toBeFocused();
  });
}
