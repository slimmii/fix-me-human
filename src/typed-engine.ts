import ts from "typescript";
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
export type Compiled = {
  code: string;
  errors: string[];
  checks: CodeCheck[];
  entry: string;
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
): { entry: string; checks: CodeCheck[] } {
  const component = componentExport(file);
  const calls = new Set<string>();
  const definitions = new Set<string>();
  const rendered = new Set<string>();
  const imports = new Map<string, string>();
  for (const statement of file.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      statement.importClause?.namedBindings &&
      ts.isNamedImports(statement.importClause.namedBindings)
    )
      for (const item of statement.importClause.namedBindings.elements)
        imports.set(item.name.text, item.propertyName?.text ?? item.name.text);
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
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
      rendered.add(node.tagName.getText(file));
    ts.forEachChild(node, inspect);
  };
  inspect(file);
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
export function compileCode(
  source: string,
  assignment: Pick<Assignment, "validation">,
): Compiled {
  if (source.length > 16000)
    return {
      code: "",
      errors: ["Keep this small office application under 16,000 characters."],
      checks: [],
      entry: "default",
    };
  const file = ts.createSourceFile(
    "Office.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
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
        node.moduleSpecifier.text !== "react")
    )
      errors.push('This tiny browser only imports from "react".');
    if (ts.isExportDeclaration(node) && node.moduleSpecifier)
      errors.push("Keep components in this one file.");
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
    if (ts.isNewExpression(node))
      errors.push(
        "This exercise toolbox uses React functions and Hooks, without constructing new objects.",
      );
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
  const { entry, checks } = evaluateSourceRules(
    file,
    assignment.validation.source,
  );
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
    reportDiagnostics: true,
    fileName: "Office.tsx",
  });
  for (const diagnostic of result.diagnostics ?? [])
    if (diagnostic.category === ts.DiagnosticCategory.Error)
      errors.push(
        `${diagnostic.start !== undefined ? `Line ${file.getLineAndCharacterOfPosition(Math.min(diagnostic.start, source.length)).line + 1}: ` : ""}${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`,
      );
  return {
    code: result.outputText,
    errors: [...new Set(errors)],
    checks,
    entry,
  };
}
