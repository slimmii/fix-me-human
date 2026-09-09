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
export function evaluateRuntimeRules(
  root: HTMLElement,
  rules: RuntimeRule[],
): CodeCheck[] {
  return rules.map((rule) => ({
    label: rule.label || "Unknown runtime rule",
    pass:
      validRuntimeRule(rule) &&
      Array.from(root.querySelectorAll("h1")).some(
        (heading) =>
          visible(heading) &&
          normalize(heading.innerText) === normalize(rule.text),
      ),
  }));
}
