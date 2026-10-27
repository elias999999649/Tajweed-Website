// One-time migration aid. Keeps source formatting; generated t()/href() calls
// are ordinary, reviewable application code, not a runtime DOM translator.
import ts from "typescript";
import { readFile, writeFile } from "node:fs/promises";

for (const filename of process.argv.slice(2)) {
  let source = await readFile(filename, "utf8");
  if (source.includes("getI18n") || source.includes("useI18n")) continue;
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const client = /^\s*["']use client["']/.test(source);
  const edits = [];
  const functions = new Set();
  const replace = (node, value) => edits.push({ start: node.getStart(file), end: node.end, value });
  const insert = (at, value) => edits.push({ start: at, end: at, value });
  const call = (name, argument) => `${name}(${argument})`;

  function ownerOf(node) {
    for (let current = node.parent; current; current = current.parent) {
      if (ts.isFunctionDeclaration(current)) return current;
    }
    return null;
  }
  function template(node) {
    if (!ts.isTemplateExpression(node)) return null;
    let key = node.head.text;
    const values = [];
    node.templateSpans.forEach((span, i) => {
      key += `{${i}}${span.literal.text}`;
      values.push(`${JSON.stringify(String(i))}: text(${span.expression.getText(file)})`);
    });
    return `t(${JSON.stringify(key)}, { ${values.join(", ")} })`;
  }
  function visit(node) {
    if (ts.isJsxText(node)) {
      const raw = node.getFullText(file);
      const key = node.text.replace(/\s+/g, " ").trim();
      if (!/[A-Za-z]/.test(key)) return;
      const leading = /^\s/.test(raw) && !raw.includes("\n") ? '{" "}' : "";
      const trailing = /\s$/.test(raw) && !raw.includes("\n") ? '{" "}' : "";
      edits.push({ start: node.pos, end: node.end, value: `${leading}{t(${JSON.stringify(key)})}${trailing}` });
      functions.add(ownerOf(node));
      return;
    }
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(file);
      const init = node.initializer;
      const transform = ["href", "action"].includes(name) ? "href" : ["aria-label", "placeholder", "title", "alt", "lessonName", "label"].includes(name) ? "t" : null;
      if (transform && init && (ts.isStringLiteral(init) || ts.isJsxExpression(init) && init.expression)) {
        const expression = ts.isStringLiteral(init) ? JSON.stringify(init.text) : init.expression.getText(file);
        if (transform === "t" && ts.isStringLiteral(init) && !/[A-Za-z]/.test(init.text)) return;
        replace(init, `{${call(transform, expression)}}`);
        functions.add(ownerOf(node));
        return;
      }
    }
    if (ts.isJsxExpression(node) && node.expression && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
      const expression = node.expression;
      // Expressions containing JSX are visited recursively. Their string
      // branches are handled by text() at the enclosing boundary if needed.
      const hasJsx = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n) || ts.forEachChild(n, hasJsx);
      if (!hasJsx(expression)) {
        const value = template(expression) || call("text", expression.getText(file));
        replace(node, `{${value}}`);
        functions.add(ownerOf(node));
        return;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  functions.delete(null);
  if (!functions.size) continue;
  for (const fn of functions) {
    if (!fn.body) continue;
    insert(fn.body.getStart(file) + 1, `\n  const { t, text, href } = ${client ? "useI18n()" : "await getI18n()"};\n`);
    if (!client && !fn.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)) insert(fn.getStart(file) + (fn.modifiers?.reduce((n, m) => m.end - fn.getStart(file) + 1, 0) || 0), "async ");
  }
  edits.sort((a, b) => b.start - a.start);
  for (const edit of edits) source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
  const importLine = `import { ${client ? "useI18n" : "getI18n"} } from "@/lib/i18n/${client ? "client" : "server"}";\n`;
  source = client ? source.replace(/(["']use client["'];?)/, `$1\n${importLine}`) : importLine + source;
  source = source.replace(/<main(?![^>]*\bid=)/g, '<main id="main-content" tabIndex={-1}');
  await writeFile(filename, source);
  console.log(filename);
}
