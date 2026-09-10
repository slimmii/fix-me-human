import { test, expect, type Page } from "@playwright/test";
import { curriculum } from "../../src/curriculum";
import { compileCode } from "../../src/typed-engine";
import type { Assignment } from "../../src/curriculum/types";
import type { CodeCheck } from "../../src/validation/types";
import { fresh, KEY } from "../../src/progression";
const assignments = curriculum.flatMap((lesson) => lesson.assignments);

async function preview(
  page: Page,
  assignment: Assignment,
  source: string | Record<string, string> = assignment.solutionFiles ??
    assignment.solution,
) {
  const compiled = compileCode(source, assignment);
  expect(compiled.errors).toEqual([]);
  const result = await page.evaluate(
    async ({ compiled, rules }) => {
      // Use the same bundled document and isolated React runtime as the editor.
      const modulePath = "/src/sandbox/document.ts";
      const { browserDocument } = await import(/* @vite-ignore */ modulePath);
      const frame = document.createElement("iframe");
      frame.style.cssText = "width:1100px;height:650px";
      frame.setAttribute("sandbox", "allow-scripts");
      document.body.replaceChildren(frame);
      const token = crypto.randomUUID();
      return await new Promise<{ type: string; detail: string }>(
        (resolve, reject) => {
          const timer = setTimeout(
            () => reject(Error("Preview checks timed out")),
            15000,
          );
          const receive = (event: MessageEvent) => {
            if (
              event.source !== frame.contentWindow ||
              event.data?.token !== token
            )
              return;
            if (event.data.type !== "rendered" && event.data.type !== "error")
              return;
            clearTimeout(timer);
            window.removeEventListener("message", receive);
            resolve(event.data);
          };
          window.addEventListener("message", receive);
          frame.srcdoc = browserDocument(compiled, token, rules, true);
        },
      );
    },
    { compiled, rules: assignment.validation.runtime },
  );
  expect(result.type, result.detail).toBe("rendered");
  return {
    source: compiled.checks,
    runtime: JSON.parse(result.detail).checks as CodeCheck[],
  };
}

test.beforeEach(async ({ page }) => {
  await page.route("**/course-check", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><body></body></html>",
    }),
  );
  await page.goto("/course-check");
});

for (const passes of [true, false]) {
  test(`automated checks keep console output quiet and player logs visible (passes: ${passes})`, async ({
    page,
  }) => {
    const assignment: Assignment = {
      ...assignments[0],
      validation: {
        source: [],
        runtime: [
          {
            type: "interaction",
            label: "Click the counter",
            steps: [
              { action: "click", selector: "button" },
              {
                action: "expect",
                selector: "button",
                text: passes ? "1" : "99",
              },
            ],
          },
        ],
      },
    };
    for (const initialLog of [false, true]) {
      const checks = await preview(
        page,
        assignment,
        `
        import { useState, useEffect } from "react";
        ${initialLog ? 'console.log("Ready");' : ""}
        export default function App() {
          const [count, setCount] = useState(0);
          useEffect(() => {
            if (count > 0) console.log("Count", count);
          }, [count]);
          return <button onClick={() => {
            console.log("Clicked");
            setCount(value => value + 1);
          }}>{count}</button>;
        }
      `,
      );
      expect(checks.runtime[0].pass).toBe(passes);
      const browser = page.frameLocator("iframe");
      const output = browser.locator("#browser-console");
      await expect(output).toHaveText(initialLog ? "BROWSER SAYS: Ready" : "");
      await browser.getByRole("button", { name: "0", exact: true }).click();
      await expect(output).toHaveText("BROWSER SAYS: Count 1");
      await browser.getByRole("button", { name: "1", exact: true }).click();
      await expect(output).toHaveText("BROWSER SAYS: Count 2");
    }
  });
}

test("all 12 reference solutions pass their actual sandbox interaction scenarios", async ({
  page,
}) => {
  for (const assignment of assignments) {
    const checks = await preview(page, assignment);
    expect(
      checks.source.filter((check) => !check.pass),
      assignment.id,
    ).toEqual([]);
    expect(
      checks.runtime.filter((check) => !check.pass),
      assignment.id,
    ).toEqual([]);
    if (assignments.indexOf(assignment) >= 2) {
      // Automated operations leave the learner a fresh board to try.
      await expect(page.frameLocator("iframe").locator("li")).toHaveCount(3);
    }
  }
  const board = page.frameLocator("iframe");
  await board.getByLabel("Task title", { exact: true }).fill("Manual check");
  await board.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(board.locator('section[aria-label="TODO"] li')).toHaveCount(2);
  await page.screenshot({ path: "test-results/complete-scrum-board.png" });
  await page.locator("iframe").evaluate((frame) => {
    frame.style.width = "320px";
  });
  const dimensions = await board.locator("body").evaluate((body) => ({
    width: body.clientWidth,
    scroll: body.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
  const rectangles = await board.locator("section").evaluateAll((columns) =>
    columns.map((column) => {
      const rect = column.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    }),
  );
  expect(rectangles[1].top).toBeGreaterThanOrEqual(rectangles[0].bottom);
  expect(rectangles[2].top).toBeGreaterThanOrEqual(rectangles[1].bottom);
});

test("behavior checks reject broken updates, split context and stale effects", async ({
  page,
}) => {
  const broken = [
    {
      index: 11,
      before: 'display: "grid"',
      after: 'display: "block"',
      label: "Arrange all",
    },
    {
      index: 5,
      before: "{ ...task, status }",
      after: "{ ...task }",
      label: "Start, finish",
    },
    { index: 6, before: "task.id !== id", after: "true", label: "Delete only" },
    {
      index: 8,
      before: "const board = useContext(TaskContext);",
      after: "const board = useTaskBoard();",
      label: "Add trimmed",
    },
    {
      index: 10,
      before: "}, [done]);",
      after: "}, []);",
      label: "Synchronize",
    },
  ];
  for (const item of broken) {
    const assignment = assignments[item.index];
    expect(Object.values(assignment.solutionFiles!).join("\n")).toContain(
      item.before,
    );
    const checks = await preview(
      page,
      assignment,
      Object.fromEntries(
        Object.entries(assignment.solutionFiles!).map(([name, code]) => [
          name,
          code.replace(item.before, item.after),
        ]),
      ),
    );
    expect(
      checks.runtime.find((check) => check.label.startsWith(item.label))?.pass,
      assignment.id,
    ).toBe(false);
  }
});

test("final submission completes the course, retains all drafts and never prints a thirteenth task", async ({
  page,
}) => {
  const last = assignments.at(-1)!;
  const save = fresh();
  save.phase = "coding";
  save.lessonId = curriculum.at(-1)!.id;
  save.assignmentId = last.id;
  save.completed = assignments.slice(0, -1).map((assignment) => assignment.id);
  save.collectedAssignments = assignments.map((assignment) => assignment.id);
  save.readAssignments = [...save.collectedAssignments];
  save.projects = Object.fromEntries(
    assignments.map((assignment) => [
      assignment.id,
      { files: assignment.solutionFiles!, activeFile: "App.tsx" },
    ]),
  );
  save.drafts = Object.fromEntries(
    assignments.map((assignment) => [assignment.id, assignment.solution]),
  );
  save.settings.graphicsQuality = 0;
  save.settings.mute = true;
  save.settings.reducedMotion = true;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  await page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code")
    .press("F5");
  await expect(page.getByRole("status")).toContainText(last.robot!.success, {
    timeout: 20000,
  });
  await page.getByRole("button", { name: "Submit assignment" }).click();
  await expect(page.getByRole("status")).toContainText(
    "All assignments complete!",
  );
  await expect(
    page.getByRole("button", { name: /^Grab new assignment:/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Continue B.U.G. dialogue" }).click();
  await page.reload();
  await expect(page.getByRole("status")).toContainText(last.robot!.success);
  await expect(
    page.getByRole("button", { name: /^Grab new assignment:/ }),
  ).toHaveCount(0);
  const restored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    KEY,
  );
  expect(restored.completed).toHaveLength(12);
  expect(restored.drafts).toEqual(save.drafts);
  expect(restored.projects).toEqual(save.projects);
  await expect(page.locator('[data-surface="crt-glass"]')).toBeVisible({
    timeout: 15000,
  });
  await page.screenshot({
    path: "test-results/scrum-course-complete-wall.png",
  });
});
