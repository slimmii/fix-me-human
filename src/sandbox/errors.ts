import {
  createSourceLocator,
  type CompiledSource,
  type GeneratedLocation,
} from "./source-location";

export function readableRuntimeError(message: string): string {
  if (/Minified React error #130\b/.test(message))
    return "React could not render a component. Check that each component is defined and exported, and that its import uses the same spelling and capital letters. Named exports use braces in the import; default exports do not.";
  return message;
}

export function createRuntimeErrorFormatter(
  sources: CompiledSource[],
  scriptOffset: number,
) {
  const locate = createSourceLocator(sources, scriptOffset);
  return (
    error: unknown,
    fallback?: GeneratedLocation,
    componentStack = "",
  ): string => {
    const value =
      error && typeof error === "object"
        ? (error as { message?: unknown; name?: unknown; stack?: unknown })
        : undefined;
    const message = readableRuntimeError(
      typeof value?.message === "string" ? value.message : String(error),
    );
    const name =
      typeof value?.name === "string" && value.name !== "Error"
        ? `${value.name}: `
        : "";
    const location =
      locate(typeof value?.stack === "string" ? value.stack : "", fallback) ??
      locate(componentStack);
    const description = name + message;
    if (!location) return description;
    return `${location.fileName}: Line ${location.line}, Column ${location.column}\n${description}\n\n${location.line} | ${location.sourceLine}`;
  };
}
