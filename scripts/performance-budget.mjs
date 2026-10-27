import { readFile, readdir, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../out");
const rows = [];
async function walk(directory) { for (const item of await readdir(directory, { withFileTypes: true })) { const file = path.join(directory, item.name); if (item.isDirectory()) await walk(file); else if (/\.(?:html|js|css|woff2|mp3)$/.test(file)) { const bytes = await readFile(file); rows.push({ file: path.relative(root, file).replaceAll("\\", "/"), bytes: bytes.length, gzipBytes: gzipSync(bytes).length }); } } }
await walk(root);
const limits = { ".html": 150000, ".js": 200000, ".css": 40000, ".woff2": 200000, ".mp3": 1000000 };
const failures = rows.filter(row => row.gzipBytes > limits[path.extname(row.file)]);
const largest = Object.keys(limits).map(extension => rows.filter(row => path.extname(row.file) === extension).sort((a,b) => b.gzipBytes-a.gzipBytes)[0]).filter(Boolean);
await writeFile(path.resolve(import.meta.dirname, "../docs/performance-budget-results.json"), JSON.stringify({ scope: "Compressed artifact budgets, not Lighthouse or field Core Web Vitals", limits, largest, failures }, null, 2) + "\n");
for (const row of largest) console.log(`${row.file}: ${row.gzipBytes.toLocaleString()} gzip bytes`);
if (failures.length) console.error(`${failures.length} artifacts exceed their budget`);
process.exitCode = failures.length ? 1 : 0;
