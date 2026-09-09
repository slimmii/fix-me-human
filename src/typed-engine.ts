import ts from "typescript";
import type { Exercise } from "./content";
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
export type CodeCheck = { label: string; pass: boolean };
export type Compiled = {
  code: string;
  errors: string[];
  checks: CodeCheck[];
  entry: string;
};
export function compileCode(source: string, exercise: Exercise): Compiled {
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
  const errors: string[] = [],
    calls: ts.CallExpression[] = [],
    attrs: ts.JsxAttribute[] = [],
    tags: string[] = [],
    returns: ts.ReturnStatement[] = [],
    functions: string[] = [],
    identifiers: string[] = [];
  let fragments = 0,
    conditional = 0,
    spreads = 0,
    propMutation = false,
    hasHeadingExpression = false;
  const setterNames: string[] = [];
  const visit = (n: ts.Node) => {
    if (
      ts.isJsxElement(n) &&
      n.openingElement.tagName.getText(file) === "h1" &&
      n.children.some((c) => ts.isJsxExpression(c) && !!c.expression)
    )
      hasHeadingExpression = true;
    if (
      ts.isVariableDeclaration(n) &&
      n.initializer &&
      ts.isCallExpression(n.initializer) &&
      n.initializer.expression.getText(file).endsWith("useState") &&
      ts.isArrayBindingPattern(n.name)
    ) {
      const setter = n.name.elements[1];
      if (setter && ts.isBindingElement(setter))
        setterNames.push(setter.name.getText(file));
    }
    if (
      ts.isPropertyAccessExpression(n) &&
      n.expression.getText(file) === "document" &&
      n.name.text !== "title"
    )
      errors.push(
        "The document is managed by React here. Use a ref for focus, or an effect for document.title.",
      );
    if (
      ts.isImportDeclaration(n) &&
      (!ts.isStringLiteral(n.moduleSpecifier) ||
        n.moduleSpecifier.text !== "react")
    )
      errors.push('This tiny browser only imports from "react".');
    if (ts.isExportDeclaration(n) && n.moduleSpecifier)
      errors.push("Keep components in this one file.");
    if (ts.isCallExpression(n)) {
      calls.push(n);
      if (
        ts.isIdentifier(n.expression) &&
        ["eval", "Function", "fetch", "require", "importScripts"].includes(
          n.expression.text,
        )
      )
        errors.push("This office browser supports local React code only.");
      if (n.expression.kind === ts.SyntaxKind.ImportKeyword)
        errors.push(
          "Dynamic imports are not available in this little browser.",
        );
    }
    if (ts.isIdentifier(n)) identifiers.push(n.text);
    if (
      ts.isWhileStatement(n) ||
      ts.isDoStatement(n) ||
      ts.isForStatement(n) ||
      ts.isForInStatement(n) ||
      ts.isForOfStatement(n)
    )
      errors.push(
        "Use map or filter for these small lists. Loops are outside this exercise toolbox.",
      );
    if (ts.isNewExpression(n))
      errors.push(
        "This exercise toolbox uses React functions and Hooks, without constructing new objects.",
      );
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      const tag = n.tagName.getText(file);
      tags.push(tag);
      if (
        /^[a-z]/.test(tag) &&
        !ALLOWED_TAGS.includes(tag as (typeof ALLOWED_TAGS)[number])
      )
        errors.push(
          `<${tag}> is not in our tiny toolbox. Use ${ALLOWED_TAGS.join(", ")}.`,
        );
    }
    if (ts.isJsxAttribute(n)) {
      attrs.push(n);
      if (
        [
          "dangerouslySetInnerHTML",
          "src",
          "srcDoc",
          "href",
          "action",
          "formAction",
        ].includes(n.name.getText(file))
      )
        errors.push(
          `${n.name.getText(file)} is not available in this local office browser.`,
        );
    }
    if (ts.isJsxFragment(n)) fragments++;
    if (
      ts.isConditionalExpression(n) ||
      (ts.isBinaryExpression(n) &&
        n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken)
    )
      conditional++;
    if (ts.isSpreadElement(n)) spreads++;
    if (ts.isReturnStatement(n)) returns.push(n);
    if (ts.isFunctionDeclaration(n) && n.name) functions.push(n.name.text);
    if (
      ts.isBinaryExpression(n) &&
      n.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      /^props\./.test(n.left.getText(file))
    )
      propMutation = true;
    ts.forEachChild(n, visit);
  };
  visit(file);
  if (
    identifiers.some((n) =>
      [
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
      ].includes(n),
    )
  )
    errors.push(
      "Keep your code inside the browser page: components, props, events, and Hooks.",
    );
  const call = (name: string) =>
    calls.filter(
      (c) =>
        c.expression.getText(file).replaceAll("?.", ".") === name ||
        c.expression.getText(file).endsWith("." + name),
    );
  const has = (name: string) => call(name).length > 0;
  const attr = (name: string) =>
    attrs.filter((a) => a.name.getText(file) === name);
  const attributeSource = (name: string) =>
    attr(name)
      .map((a) => a.initializer?.getText(file) || "")
      .join(" ");
  const compact = (s: string) => s.replace(/\s/g, "");
  const expressions = calls.map((c) => compact(c.getText(file))).join("\n");
  const stableKey = attr("key").some((a) =>
    /\.id\b/.test(a.initializer?.getText(file) || ""),
  );
  const filtered = call("filter").some(
    (c) =>
      /\.approved|\.open/.test(c.getText(file)) &&
      !/!\s*\w+\.(approved|open)/.test(c.getText(file)),
  );
  const setters = calls.filter((c) =>
    setterNames.includes(c.expression.getText(file)),
  );
  const functional = setters.filter(
    (c) => c.arguments[0] && ts.isArrowFunction(c.arguments[0]),
  );
  const immutable = spreads > 0 && functional.length > 0;
  const hasCleanup = returns.some(
    (r) =>
      r.expression &&
      (ts.isArrowFunction(r.expression) ||
        ts.isFunctionExpression(r.expression)) &&
      r.expression.getText(file).includes("clearInterval"),
  );
  const effect = call("useEffect");
  const key = exercise.variant;
  const checks: CodeCheck[] = [];
  const check = (label: string, pass: boolean) => checks.push({ label, pass });
  switch (key) {
    case "0-0":
      check(
        "A heading uses className and displays the name expression",
        tags.includes("h1") &&
          attr("className").length > 0 &&
          hasHeadingExpression,
      );
      break;
    case "0-1":
      check(
        "A fragment groups the heading and a conditional badge",
        fragments > 0 &&
          conditional > 0 &&
          tags.includes("h1") &&
          tags.includes("span"),
      );
      break;
    case "1-0":
      check(
        "Only approved supplies are mapped to a stable-key list",
        filtered && has("map") && stableKey,
      );
      break;
    case "1-1":
      check(
        "map returns list elements with data IDs as keys",
        has("map") && stableKey && !has("forEach"),
      );
      break;
    case "2-0":
      check(
        "Compose two Badge components",
        tags.filter((t) => t === "Badge").length === 2,
      );
      break;
    case "2-1":
      check(
        "The badge function returns its UI",
        returns.some(
          (r) => r.expression && /Employee/.test(r.expression.getText(file)),
        ),
      );
      break;
    case "3-0":
      check(
        "Card has a string name prop and receives a name",
        /name\s*:\s*string/.test(source) &&
          tags.includes("Card") &&
          attr("name").length > 0,
      );
      break;
    case "3-1":
      check(
        "Derive an uppercase label without mutating props",
        has("toUpperCase") && !propMutation,
      );
      break;
    case "4-0":
      check(
        "Pass submit as the click handler; do not call it during render",
        attr("onClick").some((a) => {
          const v = a.initializer;
          return (
            !!v &&
            ts.isJsxExpression(v) &&
            !!v.expression &&
            (ts.isIdentifier(v.expression) || ts.isArrowFunction(v.expression))
          );
        }),
      );
      break;
    case "4-1":
      check(
        "Read the input event value",
        /\.(currentTarget|target)\.value/.test(attributeSource("onChange")),
      );
      break;
    case "5-0":
      check(
        "Use state and a controlled input",
        has("useState") &&
          attr("value").length > 0 &&
          /set\w+\(/.test(attributeSource("onChange")),
      );
      check(
        "Append a new array with a functional state update",
        immutable && !has("push"),
      );
      break;
    case "5-1":
      check("Queue two functional state updates", functional.length >= 2);
      break;
    case "6-0":
      check(
        "The effect starts a timer and returns matching cleanup",
        effect.length > 0 && has("setInterval") && hasCleanup,
      );
      break;
    case "6-1":
      check(
        "The synchronization effect depends on room",
        effect.some(
          (c) =>
            c.arguments[1] &&
            ts.isArrayLiteralExpression(c.arguments[1]) &&
            c.arguments[1].elements.some((e) => e.getText(file) === "room"),
        ),
      );
      break;
    case "7-0":
      check(
        "Attach a DOM ref and focus its current element",
        has("useRef") &&
          attr("ref").length > 0 &&
          /\.current\??\.focus\(/.test(expressions),
      );
      break;
    case "7-1":
      check(
        "Record clicks in the persistent ref",
        has("useRef") &&
          /clicks\.current\s*(\+=|\+\+|=\s*clicks\.current\s*\+)/.test(source),
      );
      break;
    case "8-0":
      check(
        "A custom Hook exposes a state-setting toggle",
        functions.some((n) => /^use[A-Z]/.test(n)) &&
          has("useState") &&
          functional.length > 0,
      );
      break;
    case "8-1":
      check(
        "Each machine calls the Hook independently",
        call("useMachine").length >= 2,
      );
      break;
    case "9-0":
      check(
        "The child invokes its parent callback with an order",
        has("onOrder") && call("onOrder").some((c) => c.arguments.length > 0),
      );
      break;
    case "9-1":
      check(
        "Both displays receive shared parent state",
        attr("value").filter(
          (a) => compact(a.initializer?.getText(file) || "") === "{count}",
        ).length === 2 && has("useState"),
      );
      break;
    case "10-0":
      check(
        "A provider publishes amber and the child reads Context",
        tags.some((t) => t.endsWith(".Provider")) &&
          attributeSource("value").includes("amber") &&
          has("useContext"),
      );
      break;
    case "10-1":
      check("Read preferences through useContext", has("useContext"));
      break;
    case "2-2":
      check(
        "Compose Header and Requests inside a fragment",
        tags.includes("Header") && tags.includes("Requests") && fragments > 0,
      );
      break;
    case "1-2":
      check(
        "Filter open requests and use stable list keys",
        filtered && has("map") && stableKey,
      );
      break;
    case "5-2":
      check(
        "A callback updates parent request state immutably",
        attr("onAdd").length > 0 && immutable && !has("push"),
      );
      break;
    case "8-2":
      check(
        "The status Hook cleans up its timer",
        functions.includes("useStatus") && hasCleanup,
      );
      check(
        "The emergency button focuses its DOM ref",
        /\.current\??\.focus\(/.test(expressions),
      );
      break;
    case "10-2":
      check(
        "Publish changing theme state through Context",
        has("useState") &&
          has("useContext") &&
          attr("value").some(
            (a) => compact(a.initializer?.getText(file) || "") === "{theme}",
          ),
      );
      break;
  }
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
  for (const d of result.diagnostics || [])
    if (d.category === ts.DiagnosticCategory.Error)
      errors.push(
        `${d.start !== undefined ? `Line ${file.getLineAndCharacterOfPosition(Math.min(d.start, source.length)).line + 1}: ` : ""}${ts.flattenDiagnosticMessageText(d.messageText, " ")}`,
      );
  const exportFunction = file.statements.find(
    (n) =>
      ts.isFunctionDeclaration(n) &&
      n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword),
  );
  const entry =
    exportFunction && ts.isFunctionDeclaration(exportFunction)
      ? exportFunction.name?.text || "default"
      : "default";
  return {
    code: result.outputText,
    errors: [...new Set(errors)],
    checks,
    entry,
  };
}
