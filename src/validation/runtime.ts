import { validRuntimeRule, type CodeCheck, type RuntimeRule } from "./types";
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
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
        pass = Array.from(root.querySelectorAll<HTMLElement>(selector)).some(
          (element) =>
            visible(element) &&
            normalize(element.innerText) === normalize(rule.text),
        );
      } else {
        await reset?.();
        for (const step of rule.steps) {
          if (step.action === "title") {
            if (document.title !== step.text) {
              pass = false;
              break;
            }
            continue;
          }
          const elements = Array.from(
            root.querySelectorAll<HTMLElement>(step.selector),
          ).filter(visible);
          const element = elements[0];
          if (step.action === "expect") {
            if (
              (step.count !== undefined && elements.length !== step.count) ||
              (step.text !== undefined &&
                !elements.some(
                  (item) => normalize(item.innerText) === normalize(step.text!),
                )) ||
              (step.value !== undefined &&
                (!(element instanceof HTMLInputElement) ||
                  element.value !== step.value))
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
    checks.push({ label: rule.label || "Unknown runtime rule", pass });
  }
  // Interaction checks exercise a disposable mount; restore the learner's page.
  if (rules.some((rule) => rule.type === "interaction")) await reset?.();
  return checks;
}
