import { test, expect } from "@playwright/test";
import type { CodeCheck, RuntimeRule } from "../../src/validation/types";

test("text checks explain visible mismatches without changing acceptance", async ({
  page,
}) => {
  await page.route("**/feedback-check", (route) =>
    route.fulfill({ contentType: "text/html", body: "<main></main>" }),
  );
  await page.goto("/feedback-check");
  const rules: RuntimeRule[] = [
    { type: "visible-heading", label: "Whitespace", text: "Sprint board" },
    { type: "visible-heading", label: "Capitalization", text: "Sprint Board" },
    {
      type: "visible-text",
      label: "Punctuation",
      selector: "section p",
      text: "No matching tasks",
    },
    {
      type: "visible-text",
      label: "Wrong count text",
      selector: '[aria-label="Task count"]',
      text: "2 tasks",
    },
    {
      type: "visible-text",
      label: "Hidden text",
      selector: "[hidden]",
      text: "Hidden message",
    },
    {
      type: "interaction",
      label: "Later interaction failure",
      steps: [
        { action: "expect", selector: "h1", text: "Sprint board" },
        { action: "expect", selector: "section p", text: "No matching tasks" },
      ],
    },
    {
      type: "interaction",
      label: "Title spaces remain exact",
      steps: [{ action: "title", text: "Sprint  board" }],
    },
  ];
  const checks: CodeCheck[] = await page.evaluate(async (rules) => {
    const modulePath = "/src/validation/runtime.ts";
    const { evaluateRuntimeRules } = await import(
      /* @vite-ignore */ modulePath
    );
    const root = document.querySelector("main")!;
    root.innerHTML = `<h1>  Sprint   board  </h1>
      <section aria-label="TODO"><p aria-label="Task count">1 tasks</p>
      <p>No matching tasks.</p></section><p hidden>Hidden message</p>`;
    document.title = "Sprint board";
    return evaluateRuntimeRules(root, rules);
  }, rules);

  expect(checks[0]).toEqual({ label: "Whitespace", pass: true });
  expect(checks.slice(1).every((check) => !check.pass)).toBe(true);
  expect(checks[1].detail).toContain(
    "In the page heading, I expected “Sprint Board”, but found “Sprint board”. Check the capital letters",
  );
  expect(checks[2].detail).toContain(
    "In the TODO column, I expected “No matching tasks”, but found “No matching tasks.”. Check the punctuation",
  );
  expect(checks[2].detail).not.toContain("1 tasks");
  expect(checks[3].detail).toContain("expected “2 tasks”, but found “1 tasks”");
  expect(checks[4].detail).toContain("but found no visible matching element");
  expect(checks[5].detail).toBe(checks[2].detail);
  expect(checks[6].detail).toContain(
    "In the browser title, I expected “Sprint  board”, but found “Sprint board”",
  );
  expect(checks[6].detail).toContain("including spaces");
});
