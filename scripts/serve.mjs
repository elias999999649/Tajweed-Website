/** Local preview of Cloudflare's static export, with real 404 responses. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../out");
const port = Number(process.env.PORT || process.argv[2] || 3000);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2" };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    const requested = path.resolve(root, "." + pathname);
    if (requested !== root && !requested.startsWith(root + path.sep)) { response.writeHead(400).end("Invalid path"); return; }
    let file;
    for (const candidate of [requested, path.join(requested, "index.html"), requested + ".html"]) if ((await stat(candidate).catch(() => null))?.isFile()) { file = candidate; break; }
    const status = file ? 200 : 404;
    file ||= path.join(root, "404.html");
    const body = await readFile(file);
    response.writeHead(status, { "content-type": mime[path.extname(file)] || "application/octet-stream", "x-content-type-options": "nosniff" });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch { response.writeHead(404).end("Build the site with npm run build before starting the preview."); }
}).listen(port, "127.0.0.1", () => console.log(`Static preview: http://127.0.0.1:${port}`));
