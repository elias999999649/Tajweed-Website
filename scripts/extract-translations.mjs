/** Inventory exact source-language messages without touching Quranic Arabic.
 * Run: node scripts/extract-translations.mjs [output.json]
 * This catalog is an editorial aid; runtime localization must use explicit keys.
 */
import ts from "typescript";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const catalog = new Map();
const excludedFields = new Set([
  "id", "slug", "ruleId", "relatedRule", "type", "verificationStatus", "reviewStatus",
  "sourceIds", "sources", "prerequisites", "relatedRules", "relatedRuleIds", "relatedLessonIds",
  "rules", "quranExamples", "learningPathHref", "updatedAt", "url", "href", "src", "path",
  "className", "htmlFor", "role", "target", "rel", "key", "value", "name", "method",
  "dir", "lang", "variable", "display", "weight", "subsets", "arabicText", "highlightedText",
  "arabicName", "arabicTerm", "arabicSpelling", "letters", "surah", "sourceReferences",
]);
const permittedNameFiles = /[\\/](rules|index)\.ts$/;

function fieldFor(node) {
  for (let current = node; current && current.parent; current = current.parent) {
    const parent = current.parent;
    if (ts.isPropertyAssignment(parent)) return parent.name.getText().replace(/^['"]|['"]$/g, "");
    if (ts.isJsxAttribute(parent)) return parent.name.getText();
    if (ts.isCallExpression(parent) || ts.isVariableDeclaration(parent) || ts.isJsxElement(parent)) return "";
  }
  return "";
}

// A fallback such as text(condition ? sourceValue : "Context-dependent")
// is still visible copy, even when its spelling resembles a technical ID.
// Inspect result branches only; comparison operands and replace() arguments
// inside translated expressions are not messages.
function isExplicitMessage(node, file) {
  let current = node;
  while (current.parent) {
    const parent = current.parent;
    if (ts.isConditionalExpression(parent)) {
      if (parent.condition === current) return false;
      current = parent;
      continue;
    }
    if (ts.isParenthesizedExpression(parent)) { current = parent; continue; }
    if (ts.isBinaryExpression(parent) && [ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(parent.operatorToken.kind)) { current = parent; continue; }
    return ts.isCallExpression(parent) && ["t", "text"].includes(parent.expression.getText(file)) && parent.arguments[0] === current;
  }
  return false;
}

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!["fonts", "i18n"].includes(entry.name)) await walk(filename);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name)) continue;
    const source = await readFile(filename, "utf8");
    const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, filename.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    function visit(node) {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
        const text = node.text.replace(/\s+/g, " ").trim();
        const field = fieldFor(node);
        const excluded = excludedFields.has(field) && !(field === "name" && permittedNameFiles.test(filename));
        const directMessage = isExplicitMessage(node, file);
        const technical = !directMessage && /^(?:https?:|\/|@|#[\w-]|[a-z]+(?:-[a-z0-9]+)+$|[a-z]+\.[a-z]+$|[\w-]+\/[\w-]+|\(function\(|\((?:min|max)-width:|M\d|\d+rem |button, |system-ui, |use client$)/.test(text);
        const useful = directMessage || /[A-Za-z]/.test(text) && (/\s/.test(text) || /^[A-Z][a-z]+[?!:]?$/.test(text));
        if (!excluded && !technical && useful && !text.includes("=>") && !text.includes("@context")) {
          const location = `${path.relative(root, filename).replaceAll("\\", "/")}:${file.getLineAndCharacterOfPosition(node.getStart()).line + 1}`;
          if (!catalog.has(text)) catalog.set(text, []);
          catalog.get(text).push(location);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(file);
  }
}

await walk(path.join(root, "app"));
await walk(path.join(root, "components"));
await walk(path.join(root, "lib"));
for (const message of ["Which definition does this lesson give for {lesson}?", "Which practice guidance belongs to this lesson on {lesson}?", "{definition} Compare the other choices with the lesson explanation; they describe different study topics.", "{pronunciation} The other choices skip the careful listening and feedback needed for pronunciation practice.", "rule", "article", "glossary", "term", "terms", "result", "results", "understanding", "recognition", "application", "introductory", "developing", "consolidating", "advanced", "multiple choice", "ikhfa", "noon sakinah", "madd", "qalqalah", "heavy letters", "makharij", "needs review", "verified", "draft"]) if (!catalog.has(message)) catalog.set(message, ["runtime educational labels"]);
const sorted = Object.fromEntries([...catalog].sort(([a], [b]) => a.localeCompare(b)));
const destination = path.resolve(root, process.argv[2] || "docs/translation-source-catalog.json");
await mkdir(path.dirname(destination), { recursive: true });
await writeFile(destination, `${JSON.stringify(sorted, null, 2)}\n`);
const words = [...catalog.keys()].reduce((total, text) => total + text.split(/\s+/).length, 0);
console.log(`${catalog.size} unique messages; ${words} source words. Catalog: ${path.relative(root, destination)}`);
