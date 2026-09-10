export type ProjectFiles = Record<string, string>;
export type CodeProject = { files: ProjectFiles; activeFile: string };
export const ENTRY_FILE = "App.tsx";
export const MAX_FILES = 32;
export const validFileName = (name: string) =>
  /^[A-Za-z][A-Za-z0-9_-]*\.(tsx?|jsx?)$/.test(name);
export const singleFileProject = (source: string): CodeProject => ({
  files: { [ENTRY_FILE]: source },
  activeFile: ENTRY_FILE,
});
export function decodeProject(value: unknown): CodeProject | undefined {
  if (!value || typeof value !== "object") return;
  const { files, activeFile } = value as CodeProject;
  if (!files || typeof files !== "object" || Array.isArray(files)) return;
  const entries = Object.entries(files);
  if (
    !entries.length ||
    entries.length > MAX_FILES ||
    (!Object.hasOwn(files, ENTRY_FILE) &&
      !Object.hasOwn(files, "Office.tsx")) ||
    entries.some(
      ([name, code]) => !validFileName(name) || typeof code !== "string",
    ) ||
    new Set(entries.map(([name]) => name.toLowerCase())).size !== entries.length
  )
    return;
  const migrated = { ...files };
  let selected = activeFile;
  // Old project saves used Office.tsx. Never overwrite an existing App.tsx.
  if (!Object.hasOwn(migrated, ENTRY_FILE)) {
    migrated[ENTRY_FILE] = migrated["Office.tsx"];
    delete migrated["Office.tsx"];
    for (const name of Object.keys(migrated)) {
      migrated[name] = migrated[name].replace(
        /(\bfrom\s*|\bimport\s*)(["'])\.\/Office(\.tsx)?\2/g,
        (_, prefix: string, quote: string, extension: string | undefined) =>
          `${prefix}${quote}./App${extension ?? ""}${quote}`,
      );
    }
    if (selected === "Office.tsx") selected = ENTRY_FILE;
  }
  return {
    files: migrated,
    activeFile:
      typeof selected === "string" && Object.hasOwn(migrated, selected)
        ? selected
        : ENTRY_FILE,
  };
}
export function resolveModule(
  name: string,
  files: ProjectFiles,
): string | undefined {
  if (!name.startsWith("./")) return;
  const base = name.slice(2);
  return [
    base,
    ...[".tsx", ".ts", ".jsx", ".js"].map((ext) => base + ext),
  ].find((candidate) => Object.hasOwn(files, candidate));
}
