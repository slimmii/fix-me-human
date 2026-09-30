import type { CodeCheck } from "../validation/types";

type TestContext = {
  root: HTMLElement;
  assert: (condition: unknown, message: string) => asserts condition;
  click: (selector: string) => Promise<void>;
  input: (selector: string, value: string) => Promise<void>;
};
type HuntTest = (context: TestContext) => void | Promise<void>;
export type RegisterHuntTests = (
  test: (label: string, run: HuntTest) => void,
) => void;
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 25));

// Runs only inside the opaque-origin preview iframe. Test code is never evaluated in the app.
export async function evaluateHuntTests(
  register: RegisterHuntTests,
  root: HTMLElement,
  reset: () => Promise<void>,
): Promise<CodeCheck[]> {
  const tests: { label: string; run: HuntTest }[] = [];
  register((label, run) => {
    if (
      typeof label !== "string" ||
      !label.trim() ||
      typeof run !== "function" ||
      tests.length >= 100
    )
      throw new Error("Invalid bug hunt test definition.");
    tests.push({ label, run });
  });
  if (!tests.length) throw new Error("This hunt has no verification tests.");
  const context: TestContext = {
    root,
    assert(condition, message) {
      if (!condition) throw new Error(message || "Check failed.");
    },
    async click(selector) {
      const element = root.querySelector<HTMLElement>(selector);
      if (
        !element ||
        (element instanceof HTMLButtonElement && element.disabled)
      )
        throw new Error(`Cannot click ${selector}.`);
      element.click();
      await settle();
    },
    async input(selector, value) {
      const element = root.querySelector(selector);
      if (!(element instanceof HTMLInputElement) || element.disabled)
        throw new Error(`Cannot type in ${selector}.`);
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
      await settle();
    },
  };
  const checks: CodeCheck[] = [];
  for (const { label, run } of tests) {
    await reset();
    try {
      await run(context);
      checks.push({ label, pass: true });
    } catch (error) {
      checks.push({
        label,
        pass: false,
        detail: (error instanceof Error ? error.message : String(error)).slice(
          0,
          1000,
        ),
      });
    }
  }
  await reset();
  return checks;
}
