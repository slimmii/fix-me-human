export type SourceRule =
  | { type: "exported-component"; label: string }
  | { type: "module"; name: string; label: string }
  | {
      type: "uses-call" | "component";
      name: string;
      label: string;
    };
export type RuntimeStep =
  | { action: "click"; selector: string }
  | { action: "input"; selector: string; value: string }
  | {
      action: "expect";
      selector: string;
      text?: string;
      count?: number;
      value?: string;
    }
  | { action: "title"; text: string };
export type RuntimeRule =
  | {
      type: "column-layout";
      selector: string;
      count: number;
      minWidth: number;
      label: string;
    }
  | {
      type: "visible-heading";
      text: string;
      label: string;
    }
  | { type: "visible-text"; selector: string; text: string; label: string }
  | { type: "interaction"; steps: RuntimeStep[]; label: string };
export type Validation = { source: SourceRule[]; runtime: RuntimeRule[] };
export type CodeCheck = { label: string; pass: boolean };
export function validSourceRule(rule: SourceRule): boolean {
  return (
    !!rule.label?.trim() &&
    (rule.type === "exported-component" ||
      (rule.type === "module" &&
        /^[A-Za-z][A-Za-z0-9_-]*\.tsx?$/.test(rule.name)) ||
      ((rule.type === "uses-call" || rule.type === "component") &&
        /^[A-Za-z][A-Za-z0-9]*$/.test(rule.name)))
  );
}
export function validRuntimeRule(rule: RuntimeRule): boolean {
  if (!rule.label?.trim()) return false;
  if (rule.type === "column-layout")
    return (
      !!rule.selector?.trim() &&
      Number.isInteger(rule.count) &&
      rule.count > 1 &&
      Number.isFinite(rule.minWidth) &&
      rule.minWidth > 0
    );
  if (rule.type === "visible-heading") return !!rule.text?.trim();
  if (rule.type === "visible-text")
    return !!rule.selector?.trim() && !!rule.text?.trim();
  return (
    rule.type === "interaction" &&
    Array.isArray(rule.steps) &&
    rule.steps.length > 0 &&
    rule.steps.every((step) => {
      if (step.action === "title") return typeof step.text === "string";
      if (!step.selector?.trim()) return false;
      if (step.action === "click") return true;
      if (step.action === "input") return typeof step.value === "string";
      return (
        step.action === "expect" &&
        (typeof step.text === "string" ||
          typeof step.value === "string" ||
          Number.isInteger(step.count)) &&
        (step.count === undefined || step.count >= 0)
      );
    })
  );
}
