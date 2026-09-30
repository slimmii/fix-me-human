import { expect, it } from "vitest";
import { fresh, decode } from "../src/progression";
import { compileCode } from "../src/typed-engine";
import {
  startHunt,
  recordHuntRun,
  finishHuntRun,
} from "../src/bug-hunts/progress";
import { coffeeHunt, fixedCoffee } from "./fixtures/bug-hunts";

it("the published multi-file hunt and its repair compile with the React toolbox", () => {
  for (const code of [
    coffeeHunt.starter_files["CoffeeOrder.tsx"],
    fixedCoffee,
  ]) {
    const result = compileCode(
      { ...coffeeHunt.starter_files, "CoffeeOrder.tsx": code },
      {
        validation: {
          source: [{ type: "exported-component", label: "Component" }],
          runtime: [],
        },
      },
    );
    expect(result.errors).toEqual([]);
  }
});
it("preserves drafts, failures and first completion through save decoding without changing course progress", () => {
  const project = {
    files: coffeeHunt.starter_files,
    activeFile: "CoffeeOrder.tsx",
  };
  let hunt = startHunt(project, 100);
  hunt = finishHuntRun(
    recordHuntRun(hunt, 200),
    {
      outcome: "compile-error",
      durationMs: 50,
      checks: [],
      error: "Syntax error",
    },
    250,
  );
  hunt = finishHuntRun(
    recordHuntRun(hunt, 300),
    {
      outcome: "failed",
      durationMs: 50,
      checks: [{ label: "Adds cups", pass: false }],
    },
    350,
  );
  hunt = finishHuntRun(
    recordHuntRun(hunt, 400),
    {
      outcome: "passed",
      durationMs: 50,
      checks: [{ label: "Adds cups", pass: true }],
    },
    450,
  );
  hunt = finishHuntRun(
    recordHuntRun(hunt, 500),
    {
      outcome: "passed",
      durationMs: 50,
      checks: [{ label: "Adds cups", pass: true }],
    },
    550,
  );
  const original = fresh();
  const key = `${coffeeHunt.id}:1`;
  const restored = decode(
    JSON.stringify({ ...original, bugHunts: { [key]: hunt } }),
  );
  expect(restored.bugHunts[key]).toEqual(hunt);
  expect(hunt).toMatchObject({
    runs: 3,
    successfulRuns: 1,
    failedRuns: 1,
    compileErrors: 1,
    completedAt: 450,
    totalRunTimeMs: 150,
  });
  expect({ ...restored, bugHunts: {} }).toEqual(original);
  expect(
    decode(JSON.stringify({ ...original, bugHunts: undefined })).bugHunts,
  ).toEqual({});
});
it.each([
  "passed",
  "failed",
  "compile-error",
  "runtime-error",
  "timeout",
] as const)(
  "keeps every recorded statistic frozen for a %s practice run",
  (outcome) => {
    const solved = finishHuntRun(
      recordHuntRun(
        startHunt(
          { files: coffeeHunt.starter_files, activeFile: "App.tsx" },
          100,
        ),
        200,
      ),
      {
        outcome: "passed",
        durationMs: 50,
        checks: [{ label: "Solved", pass: true }],
      },
      250,
    );
    expect(recordHuntRun(solved, 300)).toBe(solved);
    expect(
      finishHuntRun(
        solved,
        { outcome, durationMs: 12000, checks: [], error: "Practice result" },
        12300,
      ),
    ).toBe(solved);
  },
);
it("ignores damaged hunt saves and sanitizes malformed statistics", () => {
  const key = `${coffeeHunt.id}:1`;
  const saved = startHunt(
    { files: coffeeHunt.starter_files, activeFile: "App.tsx" },
    100,
  );
  const decoded = decode(
    JSON.stringify({
      ...fresh(),
      bugHunts: {
        [key]: {
          ...saved,
          runs: -2,
          lastResult: {
            outcome: "failed",
            checks: [null, {}, { label: "Good", pass: false }],
          },
        },
        bad: {},
        [`${coffeeHunt.id}:2`]: { project: { files: {} } },
      },
    }),
  );
  expect(Object.keys(decoded.bugHunts)).toEqual([key]);
  expect(decoded.bugHunts[key].runs).toBe(0);
  expect(decoded.bugHunts[key].lastResult?.checks).toEqual([
    { label: "Good", pass: false },
  ]);
});
