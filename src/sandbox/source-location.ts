import {
  TraceMap,
  originalPositionFor,
  sourceContentFor,
  type EncodedSourceMap,
} from "@jridgewell/trace-mapping";

export const PREVIEW_SOURCE_URL = "human://preview/program.js";
export type CompiledSource = {
  fileName: string;
  // Number of generated lines before this module's transpiled code.
  lineOffset: number;
  map: EncodedSourceMap;
};
export type GeneratedLocation = {
  fileName: string;
  line: number;
  column: number;
};
export type SourceLocation = GeneratedLocation & { sourceLine: string };

export function createSourceLocator(
  sources: CompiledSource[],
  scriptOffset: number,
) {
  const maps = sources
    .map((source) => ({ ...source, trace: new TraceMap(source.map) }))
    .reverse();
  const locate = ({
    fileName,
    line,
    column,
  }: GeneratedLocation): SourceLocation | undefined => {
    if (fileName !== PREVIEW_SOURCE_URL || line < 1 || column < 1) return;
    const generatedLine = line - scriptOffset;
    const module = maps.find((source) => source.lineOffset < generatedLine);
    if (!module) return;
    const original = originalPositionFor(module.trace, {
      line: generatedLine - module.lineOffset,
      column: column - 1,
    });
    if (original.line === null || original.column === null || !original.source)
      return;
    return {
      fileName: module.fileName,
      line: original.line,
      column: original.column + 1,
      sourceLine:
        sourceContentFor(module.trace, original.source)?.split(/\r\n|\r|\n/)[
          original.line - 1
        ] ?? "",
    };
  };
  return (
    stack: string,
    fallback?: GeneratedLocation,
  ): SourceLocation | undefined => {
    // Both V8's "at fn (url:line:column)" and Firefox/Safari's
    // "fn@url:line:column" contain this same location suffix.
    for (const match of stack.matchAll(
      /human:\/\/preview\/program\.js:(\d+):(\d+)/g,
    )) {
      const location = locate({
        fileName: PREVIEW_SOURCE_URL,
        line: Number(match[1]),
        column: Number(match[2]),
      });
      if (location) return location;
    }
    return fallback ? locate(fallback) : undefined;
  };
}
