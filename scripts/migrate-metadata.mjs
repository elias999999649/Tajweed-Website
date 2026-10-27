import ts from "typescript";
import { readFile, writeFile } from "node:fs/promises";
for (const filename of process.argv.slice(2)) {
  let source = await readFile(filename, "utf8");
  if (source.includes("localizeMetadata")) continue;
  source = source.replace(/ \| Complete Tajweed Guide/g, "");
  source = source.replace('title: `${rule.name}`', 'title: rule.name').replace('description: `${rule.name}: definition, occurrence, letters, pronunciation guidance, practice, and related Tajweed lessons.`', 'description: rule.shortDefinition');
  source = source.replace('title: `${article.title}`', 'title: article.title').replace('title: `${item.title} Learning Path`', 'title: item.title').replace('description: "A structured learning step in the Complete Tajweed Guide."', 'description: itemIsLevel ? item.purpose : item.summary');
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const pathFor = (node) => {
    let canonical = null;
    function find(n) { if (ts.isPropertyAssignment(n) && n.name.getText(file) === "canonical") canonical = n.initializer; else ts.forEachChild(n, find); }
    find(node);
    if (!canonical) return '"/"';
    if (ts.isCallExpression(canonical) && canonical.expression.getText(file) === "absoluteUrl") return canonical.arguments[0].getText(file);
    return canonical.getText(file);
  };
  function visit(node) {
    if (ts.isVariableStatement(node) && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) {
      const declaration = node.declarationList.declarations.find((d) => d.name.getText(file) === "metadata");
      if (declaration?.initializer) edits.push({ start: node.getStart(file), end: node.end, text: `export async function generateMetadata() { return localizeMetadata(${declaration.initializer.getText(file)}, await getI18n(), ${pathFor(declaration.initializer)}); }` });
    }
    if (ts.isFunctionDeclaration(node) && node.name?.text === "generateMetadata") {
      function returns(n) { if (ts.isReturnStatement(n) && n.expression && ts.isObjectLiteralExpression(n.expression) && n.expression.properties.length) edits.push({start:n.expression.getStart(file),end:n.expression.end,text:`localizeMetadata(${n.expression.getText(file)}, await getI18n(), ${pathFor(n.expression)})`}); else ts.forEachChild(n,returns); }
      returns(node.body);
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (!edits.length) continue;
  for (const edit of edits.sort((a,b)=>b.start-a.start)) source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
  source='import { localizeMetadata } from "@/lib/i18n/metadata";\n'+source;
  if (!source.includes('from "@/lib/i18n/server"')) source='import { getI18n } from "@/lib/i18n/server";\n'+source;
  await writeFile(filename,source);
}
