export type SourceRule = { type: "exported-component"; label: string };
export type RuntimeRule = {
  type: "visible-heading";
  text: string;
  label: string;
};
export type Validation = { source: SourceRule[]; runtime: RuntimeRule[] };
export type CodeCheck = { label: string; pass: boolean };
export function validSourceRule(rule: SourceRule): boolean {
  return rule.type === "exported-component" && !!rule.label?.trim();
}
export function validRuntimeRule(rule: RuntimeRule): boolean {
  return (
    rule.type === "visible-heading" &&
    !!rule.text?.trim() &&
    !!rule.label?.trim()
  );
}
