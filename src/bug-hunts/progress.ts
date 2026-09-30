import { decodeProject, type CodeProject } from "../project";
import type { CodeCheck } from "../validation/types";

export type RunOutcome =
  "passed" | "failed" | "compile-error" | "runtime-error" | "timeout";
export type RunResult = {
  outcome: RunOutcome;
  durationMs: number;
  checks: CodeCheck[];
  error?: string;
};
export type HuntProgress = {
  project: CodeProject;
  firstStartedAt: number;
  lastRunAt: number | null;
  completedAt: number | null;
  runs: number;
  successfulRuns: number;
  failedRuns: number;
  compileErrors: number;
  runtimeErrors: number;
  timeouts: number;
  totalRunTimeMs: number;
  lastResult: RunResult | null;
};
export const startHunt = (
  project: CodeProject,
  now = Date.now(),
): HuntProgress => ({
  project,
  firstStartedAt: now,
  lastRunAt: null,
  completedAt: null,
  runs: 0,
  successfulRuns: 0,
  failedRuns: 0,
  compileErrors: 0,
  runtimeErrors: 0,
  timeouts: 0,
  totalRunTimeMs: 0,
  lastResult: null,
});
export function recordHuntRun(
  progress: HuntProgress,
  now = Date.now(),
): HuntProgress {
  // The first successful solve closes the recorded attempt. Later runs are practice.
  if (progress.completedAt != null) return progress;
  return { ...progress, runs: progress.runs + 1, lastRunAt: now };
}
export function finishHuntRun(
  progress: HuntProgress,
  result: RunResult,
  now = Date.now(),
): HuntProgress {
  if (progress.completedAt != null) return progress;
  const counter = {
    passed: "successfulRuns",
    failed: "failedRuns",
    "compile-error": "compileErrors",
    "runtime-error": "runtimeErrors",
    timeout: "timeouts",
  } as const;
  return {
    ...progress,
    [counter[result.outcome]]: progress[counter[result.outcome]] + 1,
    completedAt:
      result.outcome === "passed"
        ? (progress.completedAt ?? now)
        : progress.completedAt,
    totalRunTimeMs: progress.totalRunTimeMs + result.durationMs,
    lastResult: result,
  };
}
const count = (value: unknown): number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : 0;
export function decodeHuntProgress(
  value: unknown,
): Record<string, HuntProgress> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Record<string, HuntProgress> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!/^[0-9a-f-]{36}:\d+$/.test(key) || !raw || typeof raw !== "object")
      continue;
    const project = decodeProject(raw.project);
    if (!project) continue;
    const item = startHunt(project, count(raw.firstStartedAt));
    for (const field of [
      "runs",
      "successfulRuns",
      "failedRuns",
      "compileErrors",
      "runtimeErrors",
      "timeouts",
      "totalRunTimeMs",
    ] as const)
      item[field] = count(raw[field]);
    item.lastRunAt = count(raw.lastRunAt) || null;
    item.completedAt = count(raw.completedAt) || null;
    const last = raw.lastResult;
    if (
      last &&
      [
        "passed",
        "failed",
        "compile-error",
        "runtime-error",
        "timeout",
      ].includes(last.outcome)
    ) {
      item.lastResult = {
        outcome: last.outcome,
        durationMs: count(last.durationMs),
        error:
          typeof last.error === "string"
            ? last.error.slice(0, 2000)
            : undefined,
        checks: Array.isArray(last.checks)
          ? last.checks
              .slice(0, 101)
              .filter(
                (check: CodeCheck) =>
                  check &&
                  typeof check.label === "string" &&
                  typeof check.pass === "boolean",
              )
              .map((check: CodeCheck) => ({
                label: check.label.slice(0, 200),
                pass: check.pass,
                ...(typeof check.detail === "string"
                  ? { detail: check.detail.slice(0, 1000) }
                  : {}),
              }))
          : [],
      };
    }
    result[key] = item;
  }
  return result;
}
