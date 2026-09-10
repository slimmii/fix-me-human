import ts from "typescript";
import { localModuleErrors } from "./module-diagnostics";
import type { CompiledSource } from "./sandbox/source-location";
import {
  ENTRY_FILE,
  MAX_FILES,
  resolveModule,
  validFileName,
  type ProjectFiles,
} from "./project";
import type { Assignment } from "./curriculum/types";
import {
  validSourceRule,
  type CodeCheck,
  type SourceRule,
} from "./validation/types";
export type { CodeCheck } from "./validation/types";
export const ALLOWED_TAGS = [
  "div",
  "section",
  "h1",
  "h2",
  "p",
  "span",
  "button",
  "input",
  "label",
  "ul",
  "li",
] as const;
// Data constructors are useful in React code. Browser APIs and dynamically
// obtained constructors remain outside the exercise toolbox.
const ALLOWED_CONSTRUCTORS = new Set([
  "Object",
  "Array",
  "Boolean",
  "Number",
  "String",
  "Date",
  "RegExp",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Promise",
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
  "AggregateError",
]);
export type Compiled = {
  code: string;
  errors: string[];
  checks: CodeCheck[];
  entry: string;
  sources?: CompiledSource[];
};

type ComponentExport = { entry: string; name: string; function: boolean };
function componentExport(file: ts.SourceFile): ComponentExport | undefined {
  const bindings = new Map<string, ts.Node>();
  const exports: { entry: string; node: ts.Node }[] = [];
  const modifier = (node: ts.Node, kind: ts.SyntaxKind) =>
    ts.canHaveModifiers(node) &&
    ts.getModifiers(node)?.some((m) => m.kind === kind);
  for (const statement of file.statements) {
    if (ts.isFunctionDeclaration(statement)) {
      if (statement.name) bindings.set(statement.name.text, statement);
      if (modifier(statement, ts.SyntaxKind.ExportKeyword))
        exports.push({
          entry: modifier(statement, ts.SyntaxKind.DefaultKeyword)
            ? "default"
            : (statement.name?.text ?? "default"),
          node: statement,
        });
    }
    if (ts.isVariableStatement(statement))
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer)
          continue;
        bindings.set(declaration.name.text, declaration.initializer);
        if (modifier(statement, ts.SyntaxKind.ExportKeyword))
          exports.push({
            entry: declaration.name.text,
            node: declaration.name,
          });
      }
    if (ts.isExportAssignment(statement) && !statement.isExportEquals)
      exports.push({ entry: "default", node: statement.expression });
    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const specifier of statement.exportClause.elements)
        exports.push({
          entry: specifier.name.text,
          node: specifier.propertyName ?? specifier.name,
        });
    }
  }
  const resolve = (
    node: ts.Node,
    name = "",
    visited = new Set<string>(),
  ): Omit<ComponentExport, "entry"> => {
    if (ts.isIdentifier(node)) {
      if (visited.has(node.text)) return { name, function: false };
      visited.add(node.text);
      const binding = bindings.get(node.text);
      return binding
        ? resolve(binding, name || node.text, visited)
        : { name: node.text, function: false };
    }
    if (
      ts.isParenthesizedExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node)
    )
      return resolve(node.expression, name, visited);
    return {
      name:
        name ||
        (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)
          ? (node.name?.text ?? "")
          : ""),
      function:
        ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node),
    };
  };
  const chosen =
    exports.find((e) => e.entry === "default") ??
    exports.find((e) => {
      const result = resolve(e.node);
      return result.function && /^[A-Z]/.test(result.name);
    });
  return chosen ? { entry: chosen.entry, ...resolve(chosen.node) } : undefined;
}
export function evaluateSourceRules(
  file: ts.SourceFile,
  rules: SourceRule[],
  modules: ts.SourceFile[] = [file],
): { entry: string; checks: CodeCheck[] } {
  const component = componentExport(file);
  const calls = new Set<string>();
  const definitions = new Set<string>();
  const rendered = new Set<string>();
  for (const module of modules) {
    const imports = new Map<string, string>();
    for (const statement of module.statements) {
      if (!ts.isImportDeclaration(statement) || !statement.importClause)
        continue;
      const { name, namedBindings } = statement.importClause;
      if (namedBindings && ts.isNamedImports(namedBindings))
        for (const item of namedBindings.elements)
          imports.set(
            item.name.text,
            item.propertyName?.text ?? item.name.text,
          );
      if (name && ts.isStringLiteral(statement.moduleSpecifier)) {
        const target = resolveModule(
          statement.moduleSpecifier.text,
          Object.fromEntries(modules.map((file) => [file.fileName, file.text])),
        );
        const exported = modules.find((file) => file.fileName === target);
        if (exported)
          imports.set(name.text, componentExport(exported)?.name ?? name.text);
      }
    }
    const inspect = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const name = ts.isIdentifier(node.expression)
          ? node.expression.text
          : ts.isPropertyAccessExpression(node.expression)
            ? node.expression.name.text
            : "";
        calls.add(imports.get(name) ?? name);
      }
      if (ts.isFunctionDeclaration(node) && node.name)
        definitions.add(node.name.text);
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.initializer &&
        (ts.isArrowFunction(node.initializer) ||
          ts.isFunctionExpression(node.initializer))
      )
        definitions.add(node.name.text);
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const name = node.tagName.getText(module);
        rendered.add(imports.get(name) ?? name);
      }
      ts.forEachChild(node, inspect);
    };
    inspect(module);
  }
  return {
    entry: component?.entry ?? "default",
    checks: rules.map((rule) => ({
      label: rule.label || "Unknown source rule",
      pass:
        validSourceRule(rule) &&
        (rule.type === "uses-call"
          ? calls.has(rule.name)
          : rule.type === "component"
            ? definitions.has(rule.name) && rendered.has(rule.name)
            : !!component?.function && /^[A-Z]/.test(component.name)),
    })),
  };
}
function compileFile(
  source: string,
  fileName: string,
  files: ProjectFiles,
): Pick<Compiled, "code" | "errors"> & { sourceMap?: CompiledSource["map"] } {
  if (source.length > 16000)
    return {
      code: "",
      errors: ["Keep this small office application under 16,000 characters."],
    };
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    /\.[jt]sx$/.test(fileName) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const errors: string[] = [];
  const forbiddenIdentifiers = [
    "window",
    "parent",
    "top",
    "opener",
    "localStorage",
    "sessionStorage",
    "XMLHttpRequest",
    "WebSocket",
    "Worker",
    "navigator",
    "globalThis",
  ];
  const forbiddenAttributes = [
    "dangerouslySetInnerHTML",
    "src",
    "srcDoc",
    "href",
    "action",
    "formAction",
  ];
  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAccessExpression(node) &&
      node.expression.getText(file) === "document" &&
      node.name.text !== "title"
    )
      errors.push(
        "The document is managed by React here. Use a ref for focus, or an effect for document.title.",
      );
    if (
      ts.isImportDeclaration(node) &&
      (!ts.isStringLiteral(node.moduleSpecifier) ||
        (node.moduleSpecifier.text !== "react" &&
          !resolveModule(node.moduleSpecifier.text, files)))
    )
      errors.push(
        `Cannot find module ${node.moduleSpecifier.getText(file)}. Import from "react" or a local file using ./Name.`,
      );
    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      (!ts.isStringLiteral(node.moduleSpecifier) ||
        (node.moduleSpecifier.text !== "react" &&
          !resolveModule(node.moduleSpecifier.text, files)))
    )
      errors.push(`Cannot find module ${node.moduleSpecifier.getText(file)}.`);
    if (ts.isCallExpression(node)) {
      if (
        ts.isIdentifier(node.expression) &&
        ["eval", "Function", "fetch", "require", "importScripts"].includes(
          node.expression.text,
        )
      )
        errors.push("This office browser supports local React code only.");
      if (node.expression.kind === ts.SyntaxKind.ImportKeyword)
        errors.push(
          "Dynamic imports are not available in this little browser.",
        );
    }
    if (ts.isIdentifier(node) && forbiddenIdentifiers.includes(node.text))
      errors.push(
        "Keep your code inside the browser page: components, props, events, and Hooks.",
      );
    if (
      ts.isWhileStatement(node) ||
      ts.isDoStatement(node) ||
      ts.isForStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isForOfStatement(node)
    )
      errors.push(
        "Use map or filter for these small lists. Loops are outside this exercise toolbox.",
      );
    if (ts.isNewExpression(node)) {
      let constructor: ts.Expression = node.expression;
      while (ts.isParenthesizedExpression(constructor))
        constructor = constructor.expression;
      if (
        !ts.isIdentifier(constructor) ||
        !ALLOWED_CONSTRUCTORS.has(constructor.text)
      )
        errors.push(
          `The constructor ${constructor.getText(file)} is not available in this local office browser. Use a standard JavaScript constructor such as Error, Date, Map, or Set.`,
        );
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(file);
      if (
        /^[a-z]/.test(tag) &&
        !ALLOWED_TAGS.includes(tag as (typeof ALLOWED_TAGS)[number])
      )
        errors.push(
          `<${tag}> is not in our tiny toolbox. Use ${ALLOWED_TAGS.join(", ")}.`,
        );
    }
    if (
      ts.isJsxAttribute(node) &&
      forbiddenAttributes.includes(node.name.getText(file))
    )
      errors.push(
        `${node.name.getText(file)} is not available in this local office browser.`,
      );
    ts.forEachChild(node, visit);
  };
  visit(file);
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      sourceMap: true,
      inlineSources: true,
    },
    reportDiagnostics: true,
    fileName,
  });
  for (const diagnostic of result.diagnostics ?? [])
    if (diagnostic.category === ts.DiagnosticCategory.Error)
      errors.push(
        `${diagnostic.start !== undefined ? `Line ${file.getLineAndCharacterOfPosition(Math.min(diagnostic.start, source.length)).line + 1}: ` : ""}${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
      );
  return {
    code: result.outputText.replace(/^\/\/# sourceMappingURL=.*$/gm, ""),
    errors: [...new Set(errors)],
    sourceMap: result.sourceMapText
      ? JSON.parse(result.sourceMapText)
      : undefined,
  };
}

// Each file gets its own CommonJS scope. Only React and the in-memory project
// are resolvable; no request ever leaves the sandbox.
export function compileCode(
  source: string | ProjectFiles,
  assignment: Pick<Assignment, "validation">,
): Compiled {
  const files = typeof source === "string" ? { [ENTRY_FILE]: source } : source;
  const names = Object.keys(files);
  const fail = (message: string): Compiled => ({
    code: "",
    errors: [message],
    checks: [],
    entry: "default",
  });
  if (!Object.hasOwn(files, ENTRY_FILE))
    return fail("The project needs App.tsx as its entry point.");
  if (
    names.length > MAX_FILES ||
    names.some(
      (name) => !validFileName(name) || typeof files[name] !== "string",
    )
  )
    return fail(
      "Use up to 32 local .ts, .tsx, .js or .jsx files with simple names.",
    );
  if (Object.values(files).join("").length > 128000)
    return fail("Keep this small office project under 128,000 characters.");
  const parsed = new Map(
    names.map((name) => [
      name,
      ts.createSourceFile(
        name,
        files[name],
        ts.ScriptTarget.Latest,
        true,
        /\.[jt]sx$/.test(name) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      ),
    ]),
  );
  const dependencies: Record<string, Record<string, string>> = {};
  for (const [name, file] of parsed) {
    dependencies[name] = {};
    for (const statement of file.statements) {
      if (
        (ts.isImportDeclaration(statement) ||
          ts.isExportDeclaration(statement)) &&
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        const specifier = statement.moduleSpecifier.text;
        const resolved = resolveModule(specifier, files);
        if (resolved) dependencies[name][specifier] = resolved;
      }
    }
  }
  const reached = new Set<string>();
  function reach(name: string) {
    if (reached.has(name)) return;
    reached.add(name);
    Object.values(dependencies[name]).forEach(reach);
  }
  reach(ENTRY_FILE);
  const { entry, checks } = evaluateSourceRules(
    parsed.get(ENTRY_FILE)!,
    assignment.validation.source.filter((rule) => rule.type !== "module"),
    [...reached].map((name) => parsed.get(name)!),
  );
  checks.push(
    ...assignment.validation.source
      .filter((rule) => rule.type === "module")
      .map((rule) => ({
        label: rule.label,
        pass:
          validSourceRule(rule) &&
          reached.has(rule.name) &&
          rule.name !== ENTRY_FILE &&
          !!parsed
            .get(rule.name)
            ?.statements.some(
              (statement) =>
                ts.isExportDeclaration(statement) ||
                ts.isExportAssignment(statement) ||
                (ts.canHaveModifiers(statement) &&
                  ts
                    .getModifiers(statement)
                    ?.some(
                      (modifier) =>
                        modifier.kind === ts.SyntaxKind.ExportKeyword,
                    )),
            ),
      })),
  );
  const errors: string[] = [];
  const sources: CompiledSource[] = [];
  let code = "";
  let lineOffset = 0;
  const append = (text: string) => {
    code += text;
    lineOffset += text.split("\n").length - 1;
  };
  append("const __factories = {\n");
  for (const name of names) {
    const result = compileFile(files[name], name, files);
    errors.push(...result.errors.map((error) => `${name}: ${error}`));
    if (name !== names[0]) append(",\n");
    append(`${JSON.stringify(name)}: function(module, exports, require) {\n`);
    if (result.sourceMap)
      sources.push({ fileName: name, lineOffset, map: result.sourceMap });
    append(result.code);
    append("\n}");
  }
  if (!errors.length) errors.push(...localModuleErrors(files, parsed));
  append(`\n};
const __dependencies = ${JSON.stringify(dependencies)};
const __cache = Object.create(null);
function __load(name) {
  if (__cache[name]) return __cache[name].exports;
  const module = { exports: {} };
  __cache[name] = module;
  __factories[name](module, module.exports, specifier => {
    if (specifier === "react") return require("react");
    const target = __dependencies[name][specifier];
    if (!target) throw Error("Cannot find module " + specifier + " in " + name);
    return __load(target);
  });
  return module.exports;
}
Object.assign(exports, __load(${JSON.stringify(ENTRY_FILE)}));`);
  return { code, errors: [...new Set(errors)], checks, entry, sources };
}
