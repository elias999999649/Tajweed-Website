import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Maps "@/..." imports (the Next.js tsconfig alias) to real files, and adds
// TS-extension resolution for relative specifiers, so the content audit can
// run in plain Node without a bundler.
const root = pathToFileURL(process.cwd() + "/").href;
const extensions = [".ts", ".tsx", ".js", ".mjs"];

// The deployment pins Node 20, which cannot import TypeScript natively.
// Use the existing compiler rather than depending on newer Node type stripping
// or changing the whole package's module mode just for audit scripts.
export async function load(url, context, next) {
  if (/\.tsx?$/.test(url) && url.startsWith("file:")) {
    const source = await readFile(new URL(url), "utf8");
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX }, fileName: new URL(url).pathname });
    return { format: "module", source: outputText, shortCircuit: true };
  }
  return next(url, context);
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = specifier.slice(2);
    for (const extension of extensions) {
      try {
        return await next(new URL(`./${base}${extension}`, root).href, context);
      } catch {
        // Try the next extension.
      }
    }
    // Directory imports ("@/lib/foo" -> "lib/foo/index.ts").
    for (const extension of extensions) {
      try {
        return await next(new URL(`./${base}/index${extension}`, root).href, context);
      } catch {
        // Try the next extension.
      }
    }
  }
  // Relative TypeScript imports without an explicit extension (e.g. "./shuffle").
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !/\.[a-z]+$/i.test(specifier)) {
    const base = context.parentURL ?? root;
    for (const extension of extensions) {
      try {
        return await next(new URL(`${specifier}${extension}`, base).href, context);
      } catch {
        // Try the next extension.
      }
    }
  }
  return next(specifier, context);
}
