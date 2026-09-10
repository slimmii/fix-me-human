import ts from "typescript";
import { resolveModule, type ProjectFiles } from "./project";

function spellingDistance(left: string, right: string): number {
  let previous = Array.from({ length: right.length + 1 }, (_, i) => i);
  for (let i = 0; i < left.length; i++) {
    const next = [i + 1];
    for (let j = 0; j < right.length; j++)
      next.push(
        Math.min(
          next[j] + 1,
          previous[j + 1] + 1,
          previous[j] + Number(left[i] !== right[j]),
        ),
      );
    previous = next;
  }
  return previous[right.length];
}

// transpileModule does not check whether another file actually exports an
// imported name. Use TypeScript's module symbols so aliases, types and barrel
// re-exports are resolved without maintaining a second module system.
export function localModuleErrors(
  files: ProjectFiles,
  parsed: Map<string, ts.SourceFile>,
): string[] {
  const program = ts.createProgram(
    [...parsed.keys()],
    {
      noLib: true,
      allowJs: true,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
    },
    {
      getSourceFile: (name) => parsed.get(name),
      getDefaultLibFileName: () => "",
      writeFile: () => {},
      getCurrentDirectory: () => "",
      getDirectories: () => [],
      fileExists: (name) => parsed.has(name),
      readFile: (name) => files[name],
      getCanonicalFileName: (name) => name,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => "\n",
      resolveModuleNames: (names) =>
        names.map((name) => {
          const resolvedFileName = resolveModule(name, files);
          return resolvedFileName ? { resolvedFileName } : undefined;
        }),
    },
  );
  const checker = program.getTypeChecker();
  const errors: string[] = [];
  for (const [fileName, file] of parsed) {
    for (const statement of file.statements) {
      if (
        (!ts.isImportDeclaration(statement) &&
          !ts.isExportDeclaration(statement)) ||
        !statement.moduleSpecifier ||
        !ts.isStringLiteral(statement.moduleSpecifier)
      )
        continue;
      const specifier = statement.moduleSpecifier.text;
      const target = resolveModule(specifier, files);
      if (!target) continue;
      const symbol = checker.getSymbolAtLocation(parsed.get(target)!);
      const exported = symbol
        ? checker.getExportsOfModule(symbol).map((item) => item.name)
        : [];
      const check = (name: string, node: ts.Node, localName = name) => {
        if (exported.includes(name)) return;
        const line =
          file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
        let message = `${fileName}: Line ${line}: "${target}" does not export "${name}".`;
        const named = exported.filter((item) => item !== "default");
        if (name === "default") {
          message = `${fileName}: Line ${line}: "${target}" has no default export.`;
          if (named.length)
            message += ` It uses named exports: ${named.map((item) => `"${item}"`).join(", ")}. Import a named export with braces, for example: import { ${named[0]} } from "${specifier}".`;
          else
            message += ` Add a default export in "${target}", or import the name that the file exports using braces.`;
        } else {
          const suggestion = named
            .map((item) => ({
              name: item,
              distance: spellingDistance(name, item),
            }))
            .filter(
              (item) =>
                item.distance <=
                Math.max(1, Math.min(3, Math.floor(name.length / 3))),
            )
            .sort((a, b) => a.distance - b.distance)[0]?.name;
          if (suggestion) message += ` Did you mean "${suggestion}"?`;
          else if (exported.includes("default") && !named.length)
            message += ` It has a default export. Import it without braces: import ${localName} from "${specifier}".`;
          else if (named.length)
            message += ` Available exports: ${named.map((item) => `"${item}"`).join(", ")}.`;
          else message += ` Add an export for "${name}" in "${target}".`;
          message +=
            " Named imports and exports must use exactly the same spelling, including capital letters.";
        }
        errors.push(message);
      };
      if (ts.isImportDeclaration(statement)) {
        const clause = statement.importClause;
        if (clause?.name) check("default", clause.name, clause.name.text);
        if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings))
          for (const item of clause.namedBindings.elements)
            check((item.propertyName ?? item.name).text, item, item.name.text);
      } else if (
        statement.exportClause &&
        ts.isNamedExports(statement.exportClause)
      ) {
        for (const item of statement.exportClause.elements)
          check((item.propertyName ?? item.name).text, item);
      }
    }
  }
  return errors;
}
