import { pathToFileURL } from "node:url";

// Maps "@/..." imports (the Next.js tsconfig alias) to real files, and adds
// TS-extension resolution for relative specifiers, so the content audit can
// run in plain Node without a bundler.
const root = pathToFileURL(process.cwd() + "/").href;
const extensions = [".ts", ".tsx", ".js", ".mjs"];

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    for (const extension of extensions) {
      try {
        return await next(new URL(`./${specifier.slice(2)}${extension}`, root).href, context);
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
