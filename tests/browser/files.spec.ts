import { test, expect } from "@playwright/test";
import { curriculum } from "../../src/curriculum";
import { fresh, KEY, transition } from "../../src/progression";

function setup(columns: boolean) {
  let save = transition(fresh(), { type: "enter" });
  if (columns)
    save = transition(transition(save, { type: "submit" }), { type: "submit" });
  save.settings = {
    ...save.settings,
    reducedMotion: true,
    mute: true,
    graphicsQuality: 0,
  };
  return save;
}

for (const columns of [false, true]) {
  test(
    columns
      ? "file dialogs create, switch, undo and restore autosaved modules"
      : "New and Open are blocked with B.U.G.'s explanation before modules",
    async ({ page }) => {
      const save = setup(columns);
      await page.addInitScript(
        ([key, value]) => {
          if (window === window.top && !localStorage.getItem(key))
            localStorage.setItem(key, value);
        },
        [KEY, JSON.stringify(save)],
      );
      await page.goto("/");
      await page.locator('[data-surface="crt-glass"]').click();
      const editor = page
        .frameLocator('iframe[title="Code editor"]')
        .getByLabel("Your React code");
      const menu = async (name: string) => {
        await page.getByRole("menuitem", { name: "File", exact: true }).click();
        await page.getByRole("menuitem", { name, exact: true }).click();
      };
      if (!columns) {
        await editor.fill("// keep my work");
        await menu("New file Ctrl+N");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(
          page.getByRole("region", { name: "Conversation with B.U.G." }),
        ).toContainText("Humans like simplicity. Files are complex.");
        await editor.press("ControlOrMeta+o");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(editor).toHaveText("// keep my work");
        return;
      }
      await editor.fill(
        "export default function App() { return <h1>Sprint board</h1>; }",
      );
      await menu("New file Ctrl+N");
      const name = page.getByLabel("File name:", { exact: true });
      await expect(name).toBeFocused();
      await name.fill("../bad");
      await name.press("Enter");
      await expect(page.getByRole("alert")).toContainText(
        "Start with a letter",
      );
      await name.fill("app.tsx");
      await name.press("Enter");
      await expect(page.getByRole("alert")).toContainText("already exists");
      await name.fill("TaskCard");
      await name.press("Enter");
      await expect(page.locator(".qbasic-file b")).toHaveText("TaskCard.tsx");
      await expect(page.locator('iframe[title="Code editor"]')).toHaveCount(1);
      await expect(editor).toBeFocused();
      await editor.fill("// a saved module");
      await editor.press("ControlOrMeta+o");
      const files = page.getByLabel("Files:", { exact: true });
      await expect(files).toBeFocused();
      await expect(page.getByRole("dialog")).toContainText(
        "Directory: C:\\REACT",
      );
      await page
        .getByRole("dialog")
        .screenshot({ path: "test-results/open-files.png" });
      await files.selectOption("App.tsx");
      await files.press("Enter");
      await expect(editor).toContainText("Sprint board");
      await editor.press("ControlOrMeta+o");
      await files.selectOption("TaskCard.tsx");
      await files.press("Enter");
      await expect(editor).toHaveText("// a saved module");
      await editor.press("ControlOrMeta+z");
      await expect(editor).toHaveText("");
      await editor.fill("// restored module");
      await menu("New file Ctrl+N");
      await name.press("Escape");
      await expect(editor).toBeFocused();
      await expect(page.locator("main")).toHaveClass(/focused/);
      await page.reload();
      await page.locator('[data-surface="crt-glass"]').click();
      await expect(page.locator(".qbasic-file b")).toHaveText("TaskCard.tsx");
      await expect(editor).toHaveText("// restored module");
    },
  );
}

test("delete confirms in the DOS dialog, preserves cancellations, and forgets deleted buffers", async ({
  page,
}) => {
  const save = setup(true);
  const assignment = curriculum[2].assignments[0];
  save.projects[assignment.id] = {
    files: {
      "App.tsx": "// entry file",
      "Scratch.tsx": "// disposable module",
      "Unused.tsx": "// unopened module",
    },
    activeFile: "Scratch.tsx",
  };
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await editor.fill("// edited before deletion");
  await editor.press("ControlOrMeta+o");
  const files = page.getByLabel("Files:", { exact: true });
  const remove = page.getByRole("button", { name: "Delete", exact: true });
  const confirmation = page.getByRole("alertdialog", { name: "Delete file" });
  await remove.click();
  await expect(confirmation).toContainText("Delete C:\\REACT\\Scratch.tsx?");
  await expect(
    confirmation.getByRole("button", { name: "No", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(confirmation).toHaveCount(0);
  await expect(files).toBeFocused();
  await remove.click();
  await page.keyboard.press("Escape");
  await expect(files).toHaveValue("Scratch.tsx");
  await remove.click();
  await page.keyboard.press("n");
  await expect(files).toHaveValue("Scratch.tsx");
  await remove.click();
  await confirmation.screenshot({ path: "test-results/delete-file.png" });
  await confirmation.getByRole("button", { name: "Yes", exact: true }).click();
  await expect(files.locator("option")).toHaveCount(2);
  await expect(files).toHaveValue("App.tsx");
  await expect(remove).toBeEnabled();
  await remove.click();
  await expect(confirmation).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Conversation with B.U.G." }),
  ).toContainText(
    "Early AI agents used to delete important code. Heh. Human assets seem to have the same problem. So I'm gonna stop you there. App.tsx stays.",
  );
  await expect(editor).toBeFocused();
  await expect(editor).toHaveText("// entry file");
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    KEY,
  );
  expect(saved.projects[assignment.id]).toEqual({
    files: { "App.tsx": "// entry file", "Unused.tsx": "// unopened module" },
    activeFile: "App.tsx",
  });
  await editor.press("ControlOrMeta+o");
  await files.selectOption("Unused.tsx");
  await remove.click();
  await page.keyboard.press("y");
  await expect(files.locator("option")).toHaveCount(1);
  await expect(editor).toHaveText("// entry file");
  await page.keyboard.press("Escape");
  await expect(editor).toBeFocused();
  await editor.press("ControlOrMeta+n");
  await page.getByLabel("File name:", { exact: true }).fill("Scratch");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(editor).toHaveText("");
  await editor.press("ControlOrMeta+z");
  await expect(editor).toHaveText("");
  await page.reload();
  await page.locator('[data-surface="crt-glass"]').click();
  await expect(editor).toHaveText("");
  await editor.press("ControlOrMeta+o");
  await expect(files.locator("option")).toHaveCount(2);
  await expect(files.locator("option[value='Unused.tsx']")).toHaveCount(0);
});

test("run from a supporting file validates the whole project and carries it into the next task", async ({
  page,
}) => {
  const save = setup(true);
  const columns = curriculum[2].assignments[0];
  save.projects[columns.id] = {
    files: columns.solutionFiles!,
    activeFile: "TaskCard.tsx",
  };
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await editor.press("F5");
  await page
    .getByRole("button", { name: "Submit assignment" })
    .click({ timeout: 15000 });
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    KEY,
  );
  expect(saved.assignmentId).toBe("task-state");
  expect(saved.projects["task-state"]).toEqual(save.projects[columns.id]);
  expect(saved.completed).toContain("board-columns");
});
