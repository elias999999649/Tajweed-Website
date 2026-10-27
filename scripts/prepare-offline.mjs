import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const hash = createHash("sha256");
async function visit(folder) { for (const entry of (await readdir(folder, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) { const path = `${folder}/${entry.name}`; if (path.endsWith("/content-version.json")) continue; if (entry.isDirectory()) await visit(path); else if (/\.(?:tsx?|json|css|woff2)$/.test(path)) { hash.update(path); const bytes = await readFile(path); hash.update(path.endsWith(".woff2") ? bytes : bytes.toString("utf8").replaceAll("\r\n", "\n")); } } }
for (const folder of ["app", "components", "lib"]) await visit(folder);
for (const asset of ["public/logo.png", "public/quran-symbols.png", "public/audio/al-fatihah-ali-al-hudhaify.mp3"]) { hash.update(asset); hash.update(await readFile(new URL(`../${asset}`, import.meta.url))); }
const path = new URL("../public/offline-worker.js", import.meta.url);
const source = await readFile(path, "utf8");
hash.update(source.replace(/const VERSION = "[^"]+";/, "").replaceAll("\r\n", "\n"));
const version = hash.digest("hex").slice(0, 20);
await writeFile(new URL("../lib/learning/content-version.json", import.meta.url), JSON.stringify({ version }) + "\n");
await writeFile(path, source.replace(/const VERSION = "[^"]+";/, `const VERSION = "${version}";`));
