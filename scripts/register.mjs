import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Maps "@/..." imports (the Next.js tsconfig alias) to real files, then runs
// the script given as the first CLI argument: node scripts/register.mjs scripts/audit.mjs
register("./alias-loader.mjs", import.meta.url);

const entry = process.argv[2];
if (!entry) {
  console.error("Usage: node scripts/register.mjs <script>");
  process.exit(2);
}
await import(pathToFileURL(entry).href);
