import { describe, expect, it } from "vitest";
import { compileCode } from "../src/typed-engine";
import { createRuntimeErrorFormatter } from "../src/sandbox/errors";
import {
  createSourceLocator,
  PREVIEW_SOURCE_URL,
} from "../src/sandbox/source-location";

const files = {
  "App.tsx":
    'import { broken } from "./board"; export default function App() { return broken(); }',
  "board.ts": `interface Task { title: string }

export function broken() {
  const task = null as Task | null;
  return task.title.toUpperCase();
}`,
};
const compiled = compileCode(files, {
  validation: { source: [], runtime: [] },
});

describe("runtime source locations", () => {
  it("maps a real TypeError stack past module wrappers and erased TypeScript to the original file", () => {
    const exports: { default?: () => unknown } = {};
    new Function(
      "exports",
      "require",
      compiled.code + `\n//# sourceURL=${PREVIEW_SOURCE_URL}`,
    )(exports, () => ({}));
    try {
      exports.default!();
      throw new Error("Expected the task access to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError);
      // V8 adds two lines around a Function constructor body.
      const location = createSourceLocator(
        compiled.sources!,
        2,
      )((error as Error).stack!);
      expect(location).toEqual({
        fileName: "board.ts",
        line: 5,
        column: 15,
        sourceLine: "  return task.title.toUpperCase();",
      });
      expect(
        createRuntimeErrorFormatter(compiled.sources!, 2)(error),
      ).toContain("board.ts: Line 5, Column 15\nTypeError:");
    }
  });

  it("accepts browser event locations and Firefox/Safari stack syntax", () => {
    const generated = compiled.code.split("\n");
    const line = generated.findIndex((text) =>
      text.includes("return task.title"),
    );
    const column = generated[line].indexOf("title");
    const location = {
      fileName: PREVIEW_SOURCE_URL,
      line: line + 2,
      column: column + 1,
    };
    const locate = createSourceLocator(compiled.sources!, 1);
    expect(locate("", location)).toMatchObject({
      fileName: "board.ts",
      line: 5,
      column: 15,
    });
    expect(
      locate(
        `broken@${PREVIEW_SOURCE_URL}:${location.line}:${location.column}`,
      ),
    ).toEqual(locate("", location));
    const format = createRuntimeErrorFormatter(compiled.sources!, 1);
    expect(
      format(
        new Error("Render failed"),
        undefined,
        `at Broken (${PREVIEW_SOURCE_URL}:${location.line}:${location.column})`,
      ),
    ).toContain("board.ts: Line 5");
  });

  it("does not invent locations for runtime internals or thrown strings", () => {
    const locate = createSourceLocator(compiled.sources!, 1);
    expect(
      locate("at run (https://example.com/library.js:10:3)"),
    ).toBeUndefined();
    expect(locate(`at run (${PREVIEW_SOURCE_URL}:1:1)`)).toBeUndefined();
    expect(locate(`at run (${PREVIEW_SOURCE_URL}:9999:1)`)).toBeUndefined();
    expect(
      createRuntimeErrorFormatter(compiled.sources!, 1)("Something went wrong"),
    ).toBe("Something went wrong");
    expect(createRuntimeErrorFormatter([], 0)(new TypeError("Bad value"))).toBe(
      "TypeError: Bad value",
    );
  });
});
