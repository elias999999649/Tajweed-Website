/** Generate code-designed brand cards with the site's actual Google fonts. */
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import os from "node:os";
const root = path.resolve(import.meta.dirname, "..");
const chrome = process.env.CHROME_BIN || (process.platform === "win32" ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "/usr/bin/google-chrome");
const dictionaries = Object.fromEntries(await Promise.all(["ar","ur","id","fr","tr"].map(async locale => [locale, JSON.parse(await readFile(path.join(root, `lib/i18n/${locale}.json`), "utf8"))])));
const escape = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  const font = { "/sans.woff2": "google-sans-flex.woff2", "/amiri.woff2": "amiri-regular.woff2" }[url.pathname];
  if (font) { response.writeHead(200, { "content-type": "font/woff2" }).end(await readFile(path.join(root, "app/fonts", font))); return; }
  const locale = url.searchParams.get("lang") || "en";
  const rtl = locale === "ar" || locale === "ur";
  const t = message => dictionaries[locale]?.[message] || message;
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(`<!doctype html><html lang="${escape(locale)}" dir="${rtl ? "rtl" : "ltr"}"><style>@font-face{font-family:Sans;src:url(/sans.woff2)}@font-face{font-family:Amiri;src:url(/amiri.woff2)}*{box-sizing:border-box}body{margin:0;background:#f7faf8;color:#17271f;font-family:${rtl ? "Amiri" : "Sans"}}main{height:100vh;display:grid;grid-template-columns:minmax(0,1fr) 240px;align-items:center;gap:45px;padding:70px 80px;border-bottom:16px solid #0e6b5c}main>div{min-width:0}html[dir=rtl] h1{text-align:right}h1{font-family:Sans;font-size:88px;letter-spacing:-4px;margin:20px 0 30px;color:#0e6b5c}p{font-size:26px;margin:0}h2{font-size:48px;font-weight:400;line-height:1.4;margin:0;max-width:800px}.arch{height:380px;border:3px solid #875d1a;border-radius:140px 140px 22px 22px;background:#0b463c;position:relative}.arch:before{content:"";position:absolute;inset:26px;border:1px solid #d8b06a;border-radius:120px 120px 8px 8px}.arch:after{content:"✦";color:#e2b45c;font:100px Sans;position:absolute;inset:110px 0;text-align:center}</style><main><div><p>${escape(t("For learners of Quran recitation"))}</p><h1 dir="ltr">Tajweed101</h1><h2>${escape(t("Read. Listen. Practise."))}</h2></div><div class="arch" aria-hidden="true"></div></main></html>`);
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const folder = path.join(root, "public/social"); await mkdir(folder, { recursive: true });
const processChrome = spawn(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=0", `--user-data-dir=${path.join(os.tmpdir(), "tajweed-social-cdp")}`, "about:blank"], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
let diagnostic = "";
processChrome.stderr.on("data", bytes => { diagnostic += bytes; });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  for (let attempt = 0; attempt < 100 && !diagnostic.includes("DevTools listening on"); attempt++) await sleep(100);
  const endpoint = diagnostic.match(/DevTools listening on (ws:\/\/\S+)/)?.[1];
  if (!endpoint) throw new Error("Chrome debugging endpoint unavailable");
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let sequence = 0;
  const pending = new Map();
  socket.onmessage = event => { const message = JSON.parse(event.data); if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); } };
  function send(method, params = {}, sessionId) { return new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, message => message.error ? reject(new Error(message.error.message)) : resolve(message.result)); socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); }); }
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false }, sessionId);
  for (const locale of ["en","ar","ur","id","fr","tr"]) {
    await send("Page.navigate", { url: `http://127.0.0.1:${port}/?lang=${locale}` }, sessionId);
    await sleep(300);
    await send("Runtime.evaluate", { expression: "document.fonts.ready.then(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true)))))", awaitPromise: true }, sessionId);
    await sleep(150);
    const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, sessionId);
    await writeFile(path.join(folder, `${locale}.png`), Buffer.from(data, "base64"));
    console.log(`Generated ${locale} social card`);
  }
} finally { socket?.close(); processChrome.kill(); server.close(); }
