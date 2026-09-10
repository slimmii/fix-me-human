import { codingSave } from "../fixtures/curriculum";
import { test, expect, type Page } from "@playwright/test";
import { KEY } from "../../src/progression";

// Chromium hides native scrollbar controls in headless mode unless requested.
test.use({
  launchOptions: {
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
    ignoreDefaultArgs: ["--hide-scrollbars"],
  },
});

async function projectEditorPoint(
  page: Page,
  target: { x: number; y: number },
) {
  // Use the CRT's actual projection instead of approximating perspective.
  return page.locator(".qbasic-editor").evaluate((host, target) => {
    const marker = document.createElement("span");
    marker.style.cssText = `position:absolute;left:${target.x}px;top:${target.y}px;width:0;height:0;pointer-events:none`;
    host.appendChild(marker);
    const rect = marker.getBoundingClientRect();
    marker.remove();
    return { x: rect.x, y: rect.y };
  }, target);
}

async function visibleCharacter(
  page: Page,
  fraction: number,
  offset: number,
  edge = 0.2,
) {
  const target = await page
    .frameLocator('iframe[title="Code editor"]')
    .locator(".cm-scroller")
    .evaluate(
      (element, { fraction, offset, edge }) => {
        const bounds = element.getBoundingClientRect();
        const rows = Array.from(
          element.querySelectorAll<HTMLElement>(".cm-line"),
        ).filter((row) => {
          const rect = row.getBoundingClientRect();
          return rect.top > bounds.top + 8 && rect.bottom < bounds.bottom - 8;
        });
        const row = rows[Math.floor((rows.length - 1) * fraction)];
        if (!row) throw new Error("No visible editor row");
        const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
        let remaining = offset;
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (remaining < node.textContent!.length) {
            const range = document.createRange();
            range.setStart(node, remaining);
            range.setEnd(node, remaining + 1);
            const rect = range.getBoundingClientRect();
            return {
              x: rect.left + rect.width * edge,
              y: rect.top + rect.height / 2,
              line: Number(row.dataset.lineNumber),
              column: offset + (edge < 0.5 ? 1 : 2),
            };
          }
          remaining -= node.textContent!.length;
        }
        throw new Error("Character not found");
      },
      { fraction, offset, edge },
    );
  const point = await projectEditorPoint(page, target);
  return { ...target, ...point };
}

async function scrollEditor(page: Page, top: number, left = 0) {
  await page
    .frameLocator('iframe[title="Code editor"]')
    .locator(".cm-scroller")
    .evaluate(
      (element, [top, left]) => {
        element.scrollTo(left, top);
      },
      [top, left],
    );
  // Allow CodeMirror's viewport measurement to draw the newly visible rows.
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

test("arrow navigation stays on consecutive lines and scrolls steadily", async ({
  page,
}) => {
  const code = Array.from(
    { length: 220 },
    (_, i) =>
      `const value${String(i + 1).padStart(3, "0")} = "a line of editor content";`,
  ).join("\n");
  const save = codingSave(code);
  save.settings.graphicsQuality = 0;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByRole("textbox", { name: "Your React code" });
  await expect(editor).toBeFocused();
  for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
  let previousFirstLine = 1;
  for (const direction of [1, -1]) {
    for (
      let line = direction > 0 ? 2 : 139;
      direction > 0 ? line <= 140 : line >= 1;
      line += direction
    ) {
      await page.keyboard.press(direction > 0 ? "ArrowDown" : "ArrowUp");
      await expect(page.locator(".qbasic-ruler")).toContainText(
        `Ln ${line}, Col 11`,
      );
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      const visible = await page
        .frameLocator('iframe[title="Code editor"]')
        .locator(".cm-scroller")
        .evaluate((el, line) => {
          const content = el.querySelector<HTMLElement>(".cm-content")!;
          const rows = Array.from(el.querySelectorAll<HTMLElement>(".cm-line"));
          const row = rows.find(
            (row) => Number(row.dataset.lineNumber) === line,
          )!;
          const first = rows.find(
            (row) =>
              content.offsetTop + row.offsetTop + row.offsetHeight >
              el.scrollTop,
          )!;
          return {
            firstLine: Number(first.dataset.lineNumber),
            top: content.offsetTop + row.offsetTop - el.scrollTop,
            bottom:
              content.offsetTop +
              row.offsetTop +
              row.offsetHeight -
              el.scrollTop,
            height: el.clientHeight,
          };
        }, line);
      expect(visible.top, `caret top at line ${line}`).toBeGreaterThanOrEqual(
        -1,
      );
      expect(
        visible.bottom,
        `caret bottom at line ${line}`,
      ).toBeLessThanOrEqual(visible.height + 1);
      expect(
        (visible.firstLine - previousFirstLine) * direction,
        `first visible line while moving to ${line}`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        (visible.firstLine - previousFirstLine) * direction,
        `visible scroll step at line ${line}`,
      ).toBeLessThanOrEqual(2);
      previousFirstLine = visible.firstLine;
    }
  }
  // Repeated keys must remain correct without waiting for each paint.
  for (let i = 0; i < 120; i++) await page.keyboard.press("ArrowDown");
  await expect(page.locator(".qbasic-ruler")).toContainText("Ln 121, Col 11");
  await editor.press("PageDown");
  const pagedLine = Number(
    (await page.locator(".qbasic-ruler").innerText()).match(/Ln (\d+)/)![1],
  );
  expect(pagedLine).toBeGreaterThan(135);
  expect(pagedLine).toBeLessThan(151);
  await editor.press("PageUp");
  await expect(page.locator(".qbasic-ruler")).toContainText("Ln 121, Col 11");
  for (let i = 0; i < 3; i++) await editor.press("Shift+ArrowDown");
  const lines = code.split("\n");
  await expect
    .poll(() =>
      editor.evaluate((el) => el.ownerDocument.getSelection()?.toString()),
    )
    .toBe(
      code.slice(code.indexOf(lines[120]) + 10, code.indexOf(lines[123]) + 10),
    );
  for (let i = 0; i < 3; i++) await editor.press("Shift+ArrowUp");
  await expect
    .poll(() =>
      editor.evaluate((el) => el.ownerDocument.getSelection()?.toString()),
    )
    .toBe("");
});

for (const compact of [false, true]) {
  test(`clicks and selections after scrolling hit the visible text${compact ? " at a compact viewport" : ""}`, async ({
    page,
  }) => {
    if (compact) {
      await page.setViewportSize({ width: 1100, height: 800 });
    }
    const lines = Array.from(
      { length: 180 },
      (_, i) =>
        `const value${String(i + 1).padStart(3, "0")} = "${"abcdefghij".repeat(14)}";`,
    );
    const code = lines.join("\n");
    const save = codingSave(code);
    save.settings.graphicsQuality = 0;
    await page.addInitScript(
      ([key, value]) => {
        if (window === window.top) localStorage.setItem(key, value);
      },
      [KEY, JSON.stringify(save)],
    );
    await page.goto("/");
    await page.locator('[data-surface="crt-glass"]').click();
    const editor = page
      .frameLocator('iframe[title="Code editor"]')
      .getByRole("textbox", { name: "Your React code" });
    await expect(editor).toBeFocused();
    if (!compact) {
      await scrollEditor(page, 0);
      const scroller = page
        .frameLocator('iframe[title="Code editor"]')
        .locator(".cm-scroller");
      const arrow = await scroller.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return { x: rect.right - 8, y: rect.bottom - 24 };
      });
      const point = await projectEditorPoint(page, arrow);
      await page.screenshot({
        path: "test-results/editor-scrollbar-controls.png",
      });
      let previous = 0;
      // Exercise the native scrollbar arrow buttons as well as keyboard arrows.
      for (let i = 0; i < 55; i++) {
        await page.mouse.click(point.x, point.y);
        await expect
          .poll(() => scroller.evaluate((el) => el.scrollTop))
          .toBeGreaterThan(previous);
        const next = await scroller.evaluate((el) => el.scrollTop);
        expect(next - previous).toBeLessThanOrEqual(100);
        previous = next;
      }
      expect(previous).toBeGreaterThan(1000);
      await expect(page.locator(".qbasic-ruler")).toContainText("Ln 1, Col 1");
    }
    const selected = () =>
      editor.evaluate((el) => el.ownerDocument.getSelection()?.toString());
    const position = ({ line, column }: { line: number; column: number }) =>
      lines.slice(0, line - 1).reduce((sum, text) => sum + text.length + 1, 0) +
      column -
      1;

    for (const [top, left] of [
      [0, 0],
      [400, 0],
      [1400, 0],
      [2400, 400],
      [800, 160],
      [0, 0],
    ]) {
      await scrollEditor(page, top, left);
      for (const fraction of [0.2, 0.7]) {
        const target = await visibleCharacter(page, fraction, left ? 65 : 10);
        const scroll = await page
          .frameLocator('iframe[title="Code editor"]')
          .locator(".cm-scroller")
          .evaluate((el) => [el.scrollTop, el.scrollLeft]);
        await page.mouse.click(target.x, target.y);
        await expect(page.locator(".qbasic-ruler")).toContainText(
          `Ln ${target.line}, Col ${target.column}`,
        );
        await expect
          .poll(() =>
            page
              .frameLocator('iframe[title="Code editor"]')
              .locator(".cm-scroller")
              .evaluate((el) => [el.scrollTop, el.scrollLeft]),
          )
          .toEqual(scroll);
      }
    }

    // Exercise real wheel scrolling, followed by a cross-line drag and shift-click.
    const wheelTarget = await visibleCharacter(page, 0.5, 10);
    await page.mouse.move(wheelTarget.x, wheelTarget.y);
    // Let Chromium commit the transformed iframe's hit-test region before
    // sending a compositor-driven wheel event.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    await page.mouse.wheel(0, 1100);
    await expect
      .poll(() =>
        page
          .frameLocator('iframe[title="Code editor"]')
          .locator(".cm-scroller")
          .evaluate((el) => el.scrollTop),
      )
      .toBeGreaterThan(500);
    const start = await visibleCharacter(page, 0.25, 8);
    const end = await visibleCharacter(page, 0.65, 12);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 5 });
    await page.mouse.up();
    await expect
      .poll(selected)
      .toBe(code.slice(position(start), position(end)));
    await page.mouse.click(end.x, end.y);
    await page.keyboard.down("Shift");
    await page.mouse.click(start.x, start.y);
    await page.keyboard.up("Shift");
    await expect
      .poll(selected)
      .toBe(code.slice(position(start), position(end)));

    // The right half of the last letter must still select the word, not its space.
    const word = await visibleCharacter(page, 0.45, 13, 0.8);
    await page.mouse.dblclick(word.x, word.y);
    await expect
      .poll(selected)
      .toBe(`value${String(word.line).padStart(3, "0")}`);
    await page.mouse.click(word.x, word.y, { clickCount: 3 });
    await expect.poll(selected).toBe(lines[word.line - 1] + "\n");

    // Typing must change the clicked position in the saved source as well.
    const insert = await visibleCharacter(page, 0.2, 10);
    await page.mouse.click(insert.x, insert.y);
    await page.keyboard.type("X");
    await expect
      .poll(() =>
        page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!).drafts["board-shell"],
          KEY,
        ),
      )
      .toBe(
        code.slice(0, position(insert)) + "X" + code.slice(position(insert)),
      );
  });
}

test("typing, replacing, deleting and indenting preserve the caret mid-code", async ({
  page,
}) => {
  const original =
    'const name = "Ada";\nexport function Welcome() {\n  return <h1 className="welcome">Hello, {name}</h1>;\n}';
  const save = codingSave();
  save.settings.reducedMotion = true;
  save.settings.mute = true;
  save.drafts["board-shell"] = original;
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
    .getByRole("textbox", { name: "Your React code" });
  const saved = () =>
    page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).drafts["board-shell"],
      KEY,
    );
  await page
    .frameLocator('iframe[title="Code editor"]')
    .locator(".cm-line")
    .first()
    .click();
  await editor.press("Home");
  for (let i = 0; i < original.indexOf("Ada"); i++)
    await editor.press("ArrowRight");
  await editor.pressSequentially("Dr. ", { delay: 50 });
  await expect.poll(saved).toBe(original.replace("Ada", "Dr. Ada"));
  await editor.press("Backspace");
  await expect.poll(saved).toBe(original.replace("Ada", "Dr.Ada"));
  for (let i = 0; i < 3; i++) await editor.press("Shift+ArrowLeft");
  await editor.pressSequentially("Captain ", { delay: 40 });
  await expect.poll(saved).toBe(original.replace("Ada", "Captain Ada"));
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.getByRole("menuitem", { name: "Undo Ctrl+Z" }).click();
  await expect.poll(saved).not.toBe(original.replace("Ada", "Captain Ada"));
  await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
  await page.getByRole("menuitem", { name: "Redo Ctrl+Y" }).click();
  await expect.poll(saved).toBe(original.replace("Ada", "Captain Ada"));
  await page
    .frameLocator('iframe[title="Code editor"]')
    .locator(".cm-line")
    .nth(2)
    .click();
  await editor.press("Home");
  await editor.press("Tab");
  await expect
    .poll(saved)
    .toBe(
      original.replace("Ada", "Captain Ada").replace("  return", "    return"),
    );
  const final = await saved();
  await page.reload();
  await page.locator('[data-surface="crt-glass"]').click();
  await expect(editor).toHaveText(final, { useInnerText: true });
});
