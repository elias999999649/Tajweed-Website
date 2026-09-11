/** Capture screenshots of key pages (light + dark, desktop + mobile) into ./.screenshots */
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "out");
const SHOTS = path.join(ROOT, ".screenshots");
await mkdir(SHOTS, { recursive: true });
const PORT = 4181;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".json": "application/json" };

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p === "/favicon.ico") { res.writeHead(204).end(); return; }
    if (p.endsWith("/")) p += "index.html";
    // Candidate files in resolution order; readFile fails on directories,
    // which is exactly the directory/file disambiguation we need.
    const candidates = [
      path.join(OUT, p),
      path.join(OUT, p + ".html"),
      path.join(OUT, p, "index.html"),
    ];
    let body = null;
    let file = null;
    for (const candidate of candidates) {
      const result = await readFile(candidate).catch(() => null);
      if (result) { body = result; file = candidate; break; }
    }
    if (!body && p !== "/") {
      body = await readFile(path.join(OUT, "404.html")).catch(() => null);
      file = path.join(OUT, "404.html");
    }
    if (!body) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch (err) { console.error("SERVER ERR", req.url, err?.message); if (!res.headersSent) res.writeHead(500).end(); else res.end(); }
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${PORT}`;

const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--remote-debugging-port=0", "--user-data-dir=" + path.join(os.tmpdir(), "tajweed-shot-profile"), `--homepage=${BASE}`, "--hide-scrollbars"], { stdio: ["ignore", "pipe", "pipe"] });
let buf = "";
chrome.stderr.on("data", (d) => (buf += d));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let host = null;
for (let i = 0; i < 120; i++) { const m = buf.match(/ws:\/\/(\S+)/); if (m) { host = m[1]; break; } await sleep(150); }
if (!host) throw new Error("no devtools");

const sock = new WebSocket("ws://" + host);
await new Promise((r, e) => { sock.onopen = r; sock.onerror = e; });
let idc = 0;
const pending = new Map();
sock.onmessage = (ev) => {
  const msg = JSON.parse(ev.data.toString ? ev.data.toString() : ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
function send(method, params = {}, sessionId) {
  const id = ++idc;
  return new Promise((resolve) => {
    pending.set(id, (msg) => resolve(msg.result ?? msg));
    sock.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}
const targets = (await send("Target.getTargets")).targetInfos;
const page = targets.find((t) => t.type === "page");
const { sessionId } = await send("Target.attachToTarget", { targetId: page.targetId, flatten: true });
await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);

async function shot(name, url, width, height, dark) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 }, sessionId);
  await send("Page.navigate", { url: BASE + url }, sessionId);
  await sleep(2200);
  const info = await send("Runtime.evaluate", { expression: "JSON.stringify({url: location.href, title: document.title, ready: document.readyState})", returnByValue: true }, sessionId);
  console.log("nav", name, "->", info?.result?.value ?? JSON.stringify(info).slice(0, 200));
  if (dark) {
    await send("Runtime.evaluate", { expression: "document.documentElement.classList.add('dark'); void document.fonts.status" }, sessionId);
    await sleep(500);
  }
  const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
  const { writeFile } = await import("node:fs/promises");
  await writeFile(path.join(SHOTS, `${name}.png`), Buffer.from(data, "base64"));
  console.log("saved", name);
}

await shot("01-home-light", "/", 1280, 900, false);
await shot("02-home-dark", "/", 1280, 900, true);
await shot("03-home-mobile", "/", 390, 844, false);
await shot("04-tajweed-directory", "/tajweed", 1280, 900, false);
await shot("05-rule-lesson", "/tajweed/what-is-tajweed", 1280, 900, false);
await shot("06-rule-lesson-dark", "/tajweed/what-is-tajweed", 1280, 900, true);
await shot("07-learn", "/learn", 1280, 900, false);
await shot("08-practice", "/practice", 1280, 900, false);
await shot("09-glossary", "/glossary", 1280, 900, false);
await shot("10-articles", "/articles", 1280, 900, false);
await shot("11-search", "/search?q=madd", 1280, 900, false);
await shot("12-search-dark", "/search?q=madd", 1280, 900, true);
await shot("13-start-here", "/start-here", 1280, 900, false);
await shot("14-404", "/no-such-page", 1280, 900, false);
await shot("15-rule-mobile", "/tajweed/what-is-tajweed", 390, 844, false);

sock.close(); chrome.kill(); server.close(); process.exit(0);
