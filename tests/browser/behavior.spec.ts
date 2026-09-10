import { test, expect } from "@playwright/test";
import { KEY } from "../../src/progression";
import { codingSave, assignment } from "../fixtures/curriculum";
test("actual React state, refs and independent Hooks work in the sandbox", async ({
  page,
}) => {
  const source = `import { useState, useRef } from "react";
function useMachine(){ return useState(false); }
export default function App(){
  const [count, setCount] = useState(0);
  const [first, setFirst] = useMachine();
  const [second, setSecond] = useMachine();
  const input = useRef(null);
  return <><h1>Sprint board</h1>
    <button onClick={() => {setCount(c => c + 1);setCount(c => c + 1);}}>{count} coffees</button>
    <input ref={input}/><button onClick={() => input.current?.focus()}>Focus</button>
    <button onClick={() => setFirst(!first)}>First {String(first)}</button>
    <button onClick={() => setSecond(!second)}>Second {String(second)}</button>
  </>;
}`;
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(codingSave(source))],
  );
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  await page.getByRole("button", { name: "Run my code" }).click();
  await expect(
    page.getByRole("button", { name: "Submit assignment" }),
  ).toBeVisible({ timeout: 15000 });
  const browser = page.frameLocator('iframe[title="Your retro browser"]');
  await browser.getByRole("button", { name: "0 coffees" }).click();
  await expect(
    browser.getByRole("button", { name: "2 coffees" }),
  ).toBeVisible();
  await browser.getByRole("button", { name: "Focus", exact: true }).click();
  await expect(browser.getByRole("textbox")).toBeFocused();
  await browser.getByRole("button", { name: "First false" }).click();
  await expect(
    browser.getByRole("button", { name: "First true" }),
  ).toBeVisible();
  await expect(
    browser.getByRole("button", { name: "Second false" }),
  ).toBeVisible();
});
test("only the rendered greeting passes, and errors or stale runs cannot unlock submission", async ({
  page,
}) => {
  page.setDefaultTimeout(30000);
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(codingSave())],
  );
  await page.goto("/");
  await page.locator('[data-surface="crt-glass"]').click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  for (const source of [
    "export default function App(){return <h1>Hello world</h1>}",
    "function Unused(){return <h1>Sprint board</h1>} export default function App(){return <p>Sprint board</p>}",
    "export default function App(){return <h1 hidden>Sprint board</h1>}",
    "export default function App(){return <div style={{opacity:0}}><h1>Sprint board</h1></div>}",
    "export default function App(){return <h1>{missingName}</h1>}",
    "export default function App(){return <video/>}",
    "export default function App(){return <h1>broken}",
  ]) {
    await editor.fill(source);
    await editor.press("F5");
    await expect(page.locator(".retro-browser-status")).not.toContainText(
      "Compiling",
    );
    await expect(
      page.getByRole("button", { name: "Submit assignment" }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "← Editor F6" }).click();
  }
  await editor.fill(
    "const App = () => <h1>  Sprint   board  </h1>; export default App;",
  );
  await editor.press("F5");
  await expect(
    page.getByRole("button", { name: "Submit assignment" }),
  ).toBeVisible({ timeout: 15000 });
  // A message from the outer window has the wrong source and cannot change acceptance.
  await page.getByRole("button", { name: "← Editor F6" }).click();
  await editor.fill(assignment.solution + "\n// edited");
  await page.evaluate(() =>
    window.postMessage(
      {
        channel: "human-preview",
        token: "",
        type: "rendered",
        detail: JSON.stringify({ valid: true, checks: [{ pass: true }] }),
      },
      "*",
    ),
  );
  await page.getByRole("menuitem", { name: "Run", exact: true }).click();
  await expect(
    page.getByRole("menuitem", { name: "Submit assignment" }),
  ).toBeDisabled();
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
    localStorage.setItem("please-fix-human:v4", "{invalid");
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
    page.getByText("This session only · storage unavailable"),
  ).toBeVisible();
  await expect(
    page
      .frameLocator('iframe[title="Code editor"]')
      .getByRole("textbox", { name: "Your React code" }),
  ).toBeVisible();
});
