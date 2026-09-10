import { validRuntimeRule, type CodeCheck, type RuntimeRule } from "./types";
import {
  normalizeText as normalize,
  textMismatchFeedback,
} from "./text-feedback";

function textFeedback(expected: string, elements: HTMLElement[]): string {
  const column = elements[0]?.closest("section[aria-label]");
  const label = elements[0]?.getAttribute("aria-label");
  const location = column
    ? `the ${column.getAttribute("aria-label")} column`
    : label
      ? `“${label}”`
      : elements[0]?.tagName === "H1"
        ? "the page heading"
        : "the page";
  return textMismatchFeedback(
    expected,
    elements.map((element) => element.innerText),
    location,
  );
}
function visible(element: HTMLElement): boolean {
  if (!element.getClientRects().length) return false;
  for (
    let current: HTMLElement | null = element;
    current;
    current = current.parentElement
  ) {
    const style = getComputedStyle(current);
    if (
      current.hidden ||
      style.display === "none" ||
      style.visibility !== "visible" ||
      Number(style.opacity) === 0 ||
      style.contentVisibility === "hidden"
    )
      return false;
  }
  return (
    element.getBoundingClientRect().width > 0 &&
    element.getBoundingClientRect().height > 0
  );
}
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 25));

export async function evaluateRuntimeRules(
  root: HTMLElement,
  rules: RuntimeRule[],
  reset?: () => Promise<void>,
): Promise<CodeCheck[]> {
  const checks: CodeCheck[] = [];
  for (const rule of rules) {
    let pass = validRuntimeRule(rule);
    let detail: string | undefined;
    try {
      if (!pass) throw Error("Unknown runtime rule");
      if (rule.type === "column-layout") {
        const columns = Array.from(
          root.querySelectorAll<HTMLElement>(rule.selector),
        ).filter(visible);
        const rectangles = columns.map((column) =>
          column.getBoundingClientRect(),
        );
        pass =
          columns.length === rule.count &&
          rectangles.every(
            (rect, index) =>
              rect.width <= root.clientWidth &&
              (root.clientWidth < rule.minWidth ||
                (Math.abs(rect.top - rectangles[0].top) < 2 &&
                  (index === 0 || rect.left >= rectangles[index - 1].right))),
          );
      } else if (
        rule.type === "visible-heading" ||
        rule.type === "visible-text"
      ) {
        const selector = rule.type === "visible-heading" ? "h1" : rule.selector;
        const elements = Array.from(
          root.querySelectorAll<HTMLElement>(selector),
        ).filter(visible);
        pass = elements.some(
          (element) => normalize(element.innerText) === normalize(rule.text),
        );
        if (!pass) detail = textFeedback(rule.text, elements);
      } else {
        await reset?.();
        for (const step of rule.steps) {
          if (step.action === "title") {
            if (document.title !== step.text) {
              pass = false;
              detail = `In the browser title, I expected “${step.text}”, but found “${document.title || "(empty)"}”. Match the title exactly, including spaces, capital letters and punctuation.`;
              break;
            }
            continue;
          }
          const elements = Array.from(
            root.querySelectorAll<HTMLElement>(step.selector),
          ).filter(visible);
          const element = elements[0];
          if (step.action === "expect") {
            if (step.count !== undefined && elements.length !== step.count) {
              pass = false;
              break;
            }
            if (
              step.text !== undefined &&
              !elements.some(
                (item) => normalize(item.innerText) === normalize(step.text!),
              )
            ) {
              pass = false;
              detail = textFeedback(step.text, elements);
              break;
            }
            if (
              step.value !== undefined &&
              (!(element instanceof HTMLInputElement) ||
                element.value !== step.value)
            ) {
              pass = false;
              break;
            }
          } else if (step.action === "click") {
            if (
              !element ||
              (element instanceof HTMLButtonElement && element.disabled)
            ) {
              pass = false;
              break;
            }
            element.click();
            await settle();
          } else {
            if (!(element instanceof HTMLInputElement) || element.disabled) {
              pass = false;
              break;
            }
            Object.getOwnPropertyDescriptor(
              HTMLInputElement.prototype,
              "value",
            )!.set!.call(element, step.value);
            element.dispatchEvent(new Event("input", { bubbles: true }));
            element.dispatchEvent(new Event("change", { bubbles: true }));
            await settle();
          }
        }
      }
    } catch {
      pass = false;
    }
    checks.push({
      label: rule.label || "Unknown runtime rule",
      pass,
      ...(detail ? { detail } : {}),
    });
  }
  // Interaction checks exercise a disposable mount; restore the learner's page.
  if (rules.some((rule) => rule.type === "interaction")) await reset?.();
  return checks;
}
