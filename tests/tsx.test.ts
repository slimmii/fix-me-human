import { expect, it } from "vitest";
import ts from "typescript";
import { curriculum } from "../src/curriculum";
it("all authored reference solutions compile as real TSX", () => {
  const files = new Map(
    curriculum
      .flatMap((l) => l.assignments)
      .map((a, i) => [`${process.cwd()}/src/solution-${i}.tsx`, a.solution]),
  );
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  };
  const host = ts.createCompilerHost(options),
    original = host.getSourceFile;
  host.getSourceFile = (file, language, onError, shouldCreate) =>
    files.has(file)
      ? ts.createSourceFile(
          file,
          files.get(file)!,
          language,
          true,
          ts.ScriptKind.TSX,
        )
      : original(file, language, onError, shouldCreate);
  const program = ts.createProgram([...files.keys()], options, host);
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .map(
      (d) =>
        `${d.file?.fileName}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`,
    );
  expect(diagnostics).toEqual([]);
}, 15000);
