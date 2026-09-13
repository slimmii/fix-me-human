import { test, expect } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";
import { curriculum } from "../../src/curriculum";

test("console helpers update live files, pass real checks, undo and persist jumps", async ({
  page,
}) => {
  const save = fresh();
  save.settings = {
    ...save.settings,
    mute: true,
    reducedMotion: true,
    graphicsQuality: 0,
  };
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page.waitForFunction(() => !!window.humanDev);
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  const assignments = curriculum.flatMap((lesson) => lesson.assignments);

  // Keep the same console API reference and issue commands within one turn.
  const state = await page.evaluate(() => {
    const dev = window.humanDev!;
    dev.goto("board-modules");
    dev.solve();
    return dev.state();
  });
  expect(state.assignmentId).toBe("board-modules");
  expect(state.projects["board-modules"].files).toEqual(
    assignments[3].solutionFiles,
  );
  await expect(editor).toHaveText(assignments[3].solution, {
    useInnerText: true,
  });
  await editor.press("F5");
  await expect(
    page.getByRole("button", { name: "Submit assignment" }),
  ).toBeVisible();

  // Replacing the same assignment must discard stale preview/validation state.
  await page.evaluate(() => window.humanDev!.starter());
  // The single-file starter is longer than CodeMirror's rendered viewport.
  await expect(editor).toContainText("type TaskStatus");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window.humanDev!.state().projects["board-modules"].files["App.tsx"],
      ),
    )
    .toBe(assignments[3].starterCode!);
  await expect(
    page.getByRole("button", { name: "Submit assignment" }),
  ).toHaveCount(0);
  await page.evaluate(() => window.humanDev!.undo());
  await expect(editor).toHaveText(assignments[3].solution, {
    useInnerText: true,
  });

  await editor.fill("// custom work");
  await expect
    .poll(() =>
      page.evaluate(() => window.humanDev!.state().drafts["board-modules"]),
    )
    .toBe("// custom work");
  await page.evaluate(() => window.humanDev!.solve());
  await expect(editor).toHaveText(assignments[3].solution, {
    useInnerText: true,
  });
  await page.evaluate(() => window.humanDev!.undo());
  await expect(editor).toHaveText("// custom work");

  await page.evaluate(() => window.humanDev!.goto(11, { solution: true }));
  await page.reload();
  await page.waitForFunction(() => !!window.humanDev);
  const restored = await page.evaluate(() => window.humanDev!.state());
  expect(restored.assignmentId).toBe(assignments.at(-1)!.id);
  expect(restored.completed).toHaveLength(assignments.length - 1);
  expect(restored.projects[restored.assignmentId].files).toEqual(
    assignments.at(-1)!.solutionFiles,
  );
});
