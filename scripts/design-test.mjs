/**
 * Headless design/QA test for the static export in ./out.
 * Uses Chrome DevTools Protocol directly (no npm dependencies).
 * Serves ./out, launches headless Chrome, and audits every page in
 * light/dark at desktop width plus a mobile pass, then exercises the
 * interactive components (theme, menu, quiz, palette, filters).
 * Usage: node scripts/design-test.mjs [port]
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "out");
if (!existsSync(OUT)) {
  console.error("Build output ./out not found. Run `npm run build` first.");
  process.exit(1);
}

const PORT = Number(process.argv[2] ?? 4173);
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".json": "application/json", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (urlPath === "/favicon.ico") { res.writeHead(204).end(); return; }
    if (urlPath.endsWith("/")) urlPath += "index.html";
    // Resolve in order: exact file, route.html (static export rewrite),
    // route/index.html (nested routes). Never treat a directory without
    // index.html as the final answer.
    let file = null;
    const exact = path.join(OUT, urlPath);
    if (existsSync(exact) && (await stat(exact)).isFile()) file = exact;
    if (!file) {
      const alt = path.join(OUT, urlPath + ".html");
      if (existsSync(alt) && (await stat(alt)).isFile()) file = alt;
    }
    if (!file) {
      const nested = path.join(OUT, urlPath, "index.html");
      if (existsSync(nested)) file = nested;
    }
    if (!file) {
      // Unknown routes: serve the exported 404 page, like a static host does.
      const notFound = path.join(OUT, "404.html");
      if (urlPath !== "/" && existsSync(notFound)) file = notFound;
    }
    if (!file) { res.writeHead(404).end("not found"); return; }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch { if (!res.headersSent) res.writeHead(500).end("error"); else res.end(); }
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
const BASE = `http://127.0.0.1:${PORT}`;

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--remote-debugging-port=0", "--user-data-dir=" + path.join(os.tmpdir(), "tajweed-design-test-profile"),
  "--window-size=1280,900", `--homepage=${BASE}`,
], { stdio: ["ignore", "pipe", "pipe"] });
let stderrBuf = "";
chrome.stderr.on("data", (d) => { stderrBuf += d; });

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitForDevtools(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const m = stderrBuf.match(/DevTools listening on ws:\/\/(\S+)/);
    if (m) return m[1];
    await sleep(150);
  }
  throw new Error("Chrome devtools socket not found");
}
const devtoolsHost = await waitForDevtools();

// ---- CDP client over the global WebSocket (Node 24) ----
let sock = null;
let msgId = 0;
const pending = new Map();
let consoleMessages = [];
let requestFailures = [];
let pageErrors = [];

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.onopen = () => resolve(ws);
    ws.onerror = reject;
    ws.onmessage = (event) => {
      const msg = JSON.parse(typeof event.data === "string" ? event.data : event.data.toString());
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      } else if (msg.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(msg.params.type)) {
        consoleMessages.push(msg.params.args.map((a) => a.value ?? a.description ?? a.type).join(" "));
      } else if (msg.method === "Runtime.exceptionThrown") {
        pageErrors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
      } else if (msg.method === "Network.loadingFailed" && !msg.params.canceled) {
        requestFailures.push(`${msg.params.type} ${msg.params.errorText} ${msg.params.requestId}`);
      }
    };
  });
}

function send(method, params = {}, sessionId) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pending.set(id, (msg) => (msg.error ? reject(new Error(`${method}: ${JSON.stringify(msg.error)}`)) : resolve(msg.result)));
    sock.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

async function setup() {
  sock = await connect(`ws://${devtoolsHost}`);
  const targets = (await send("Target.getTargets")).targetInfos;
  const page = targets.find((t) => t.type === "page");
  const { sessionId } = await send("Target.attachToTarget", { targetId: page.targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Network.enable", {}, sessionId);
  return sessionId;
}

async function evaluate(sessionId, expression) {
  const { result, exceptionDetails } = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, sessionId);
  if (exceptionDetails) return { __error: exceptionDetails.exception?.description ?? exceptionDetails.text };
  return result.value;
}

async function navigate(sessionId, url, width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 700 }, sessionId);
  await send("Page.navigate", { url }, sessionId);
  await sleep(600);
  for (let i = 0; i < 24; i++) {
    const ready = await evaluate(sessionId, "document.readyState === 'complete' && (document.fonts ? document.fonts.status === 'loaded' : true)");
    if (ready === true) break;
    await sleep(150);
  }
}

const issues = [];
function report(page, msg) { issues.push(`[${page}] ${msg}`); }

const PAGES = [
  ["home", "/"],
  ["start-here", "/start-here"],
  ["learn", "/learn"],
  ["learn-level", "/learn/foundations"],
  ["tajweed-directory", "/tajweed"],
  ["rule-lesson", "/tajweed/what-is-tajweed"],
  ["practice", "/practice"],
  ["glossary", "/glossary"],
  ["articles", "/articles"],
  ["article", "/articles/how-to-start-learning-tajweed"],
  ["search", "/search?q=madd"],
  ["about", "/about"],
  ["sources", "/sources"],
  ["editorial-policy", "/editorial-policy"],
  ["404", "/nonexistent-page"],
];

async function auditPage(sessionId, name, url, width, height, mode) {
  const label = `${name} ${width}px ${mode}`;
  consoleMessages = []; requestFailures = []; pageErrors = [];
  await navigate(sessionId, BASE + url, width, height);
  if (mode === "dark") {
    await evaluate(sessionId, "document.documentElement.classList.add('dark'); 'ok'");
    await sleep(250);
  }
  for (const err of pageErrors) report(label, `page error: ${err}`);
  for (const err of consoleMessages) report(label, `console: ${err}`);
  for (const fail of requestFailures) report(label, `request failed: ${fail}`);

  const overflow = await evaluate(sessionId, `(() => {
    const doc = document.documentElement;
    const out = { sw: doc.scrollWidth, cw: doc.clientWidth, elements: [] };
    if (doc.scrollWidth > doc.clientWidth + 1) {
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.right > doc.clientWidth + 1 || r.left < -1) {
          out.elements.push(el.tagName + '.' + String(el.className?.baseVal ?? el.className ?? '').split(' ')[0]);
          if (out.elements.length >= 5) break;
        }
      }
    }
    return out;
  })()`);
  if (overflow && !overflow.__error && overflow.sw > overflow.cw + 1) {
    report(label, `horizontal overflow ${overflow.sw}>${overflow.cw}: ${overflow.elements.join(", ")}`);
  }

  const tiny = await evaluate(sessionId, `(() => {
    const tiny = [];
    for (const el of document.querySelectorAll('main *, .site-footer *')) {
      if (!el.textContent?.trim() || el.children.length) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 12) tiny.push(el.tagName + '.' + String(el.className ?? '').split(' ')[0] + '=' + fs + 'px');
    }
    return tiny.slice(0, 5);
  })()`);
  if (tiny?.length) report(label, `tiny text (<12px): ${tiny.join(", ")}`);

  const font = await evaluate(sessionId, `(() => {
    const el = document.querySelector('h1') || document.body;
    return getComputedStyle(el).fontFamily;
  })()`);
  if (typeof font === "string" && !font.toLowerCase().includes("google sans")) {
    report(label, `font not applied: ${font}`);
  }
}

async function interactionTests(sessionId) {
  // Theme toggle round-trip
  await navigate(sessionId, BASE + "/", 1280, 900);
  const theme = await evaluate(sessionId, `(() => {
    const btn = document.querySelector('[aria-label*="dark mode" i], [aria-label*="light mode" i]');
    if (!btn) return 'no toggle button found';
    const before = document.documentElement.classList.contains('dark');
    btn.click();
    const afterToggle = document.documentElement.classList.contains('dark');
    const stored = localStorage.getItem('theme');
    btn.click();
    const afterSecond = document.documentElement.classList.contains('dark');
    return { before, afterToggle, afterSecond, stored };
  })()`);
  if (typeof theme === "string") report("theme", theme);
  else {
    if (theme.afterToggle === theme.before) report("theme", "toggle click did not change dark class");
    if (!theme.stored) report("theme", "theme choice not persisted to localStorage");
  }

  // Mobile menu
  await navigate(sessionId, BASE + "/", 390, 844);
  const menu = await evaluate(sessionId, `(async () => {
    const btn = document.querySelector('.menu-button');
    if (!btn) return 'no menu button';
    const nav = document.getElementById('primary-navigation');
    if (!nav) return 'no primary-navigation element';
    // React hydration may lag behind load; click and poll for the class.
    let open = false;
    for (let i = 0; i < 40 && !open; i++) {
      btn.click();
      await new Promise(r => setTimeout(r, 150));
      open = nav.classList.contains('open') && getComputedStyle(nav).display !== 'none';
    }
    const style = open ? getComputedStyle(nav).display : getComputedStyle(nav).display;
    if (open) { btn.click(); await new Promise(r => setTimeout(r, 200)); }
    const closed = !nav.classList.contains('open');
    return { open, closed, style, cls: nav.className };
  })()`);
  if (typeof menu === "string") report("menu", menu);
  else if (!menu.open || !menu.closed) report("menu", `menu broken: ${JSON.stringify(menu)}`);

  // Lesson quiz: content is review-gated, so the empty state must render
  // nicely; if quizzes existed, answering must show feedback and advance.
  await navigate(sessionId, BASE + "/tajweed/what-is-tajweed", 1280, 900);
  const quiz = await evaluate(sessionId, `(async () => {
    const first = document.querySelector('.lesson-quiz .quiz-option');
    if (!first) {
      const empty = document.querySelector('.lesson-quiz-empty');
      return { empty: Boolean(empty), visible: empty ? getComputedStyle(empty).color !== '' : false };
    }
    first.click();
    await new Promise(r => setTimeout(r, 200));
    const feedback = Boolean(document.querySelector('.quiz-feedback'));
    const next = [...document.querySelectorAll('.lesson-quiz .quiz-navigation button')].find(b => /next/i.test(b.textContent));
    if (!next) return { feedback, advanced: false };
    next.click();
    await new Promise(r => setTimeout(r, 200));
    return { feedback, advanced: /Question 2|2\\s*of/i.test(document.body.textContent) };
  })()`);
  if (quiz?.empty === false) report("quiz", "quiz area missing entirely");
  else if (quiz?.empty === undefined && !quiz.feedback) report("quiz", "no feedback shown after answering");
  else if (quiz?.empty === undefined && quiz.advanced === false) report("quiz", "Next button did not advance the question");

  // ⌘K palette search
  await navigate(sessionId, BASE + "/", 1280, 900);
  const palette = await evaluate(sessionId, `(async () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
    const input = document.querySelector('.search-palette input');
    if (!input) return 'palette did not open with Cmd+K';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'madd');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    return { results: document.querySelectorAll('.palette-result').length };
  })()`);
  if (typeof palette === "string") report("palette", palette);
  else if (palette.results < 1) report("palette", `no results for 'madd' (${palette.results})`);

  // Practice filter pills (question bank is review-gated; the empty state
  // is valid, but the pill must still activate and re-render the hub).
  await navigate(sessionId, BASE + "/practice", 1280, 900);
  const filters = await evaluate(sessionId, `(async () => {
    const pill = [...document.querySelectorAll('.filter-pills button')].find(b => b.textContent.trim() === 'Foundation');
    if (!pill) return 'no Foundation pill';
    pill.click();
    await new Promise(r => setTimeout(r, 250));
    return { active: pill.classList.contains('active'), hubRendered: Boolean(document.querySelector('.practice-empty, .quiz-session')) };
  })()`);
  if (typeof filters === "string") report("practice", filters);
  else if (!filters.active) report("practice", "Foundation pill did not activate");
  else if (!filters.hubRendered) report("practice", "practice hub did not re-render after filtering");

  // Directory view switch
  await navigate(sessionId, BASE + "/tajweed", 1280, 900);
  const dirMode = await evaluate(sessionId, `(async () => {
    const btn = [...document.querySelectorAll('.directory-mode-button')].find(b => /all rules/i.test(b.textContent));
    if (!btn) return 'no All Rules button';
    btn.click();
    await new Promise(r => setTimeout(r, 250));
    return { selected: btn.getAttribute('aria-selected'), cards: document.querySelectorAll('.directory-rule-card').length };
  })()`);
  if (typeof dirMode === "string") report("directory", dirMode);
  else if (dirMode.selected !== "true") report("directory", "All Rules tab not selected after click");

  // Glossary live search
  await navigate(sessionId, BASE + "/glossary", 1280, 900);
  const glossary = await evaluate(sessionId, `(async () => {
    const input = document.querySelector('.glossary-search input');
    if (!input) return 'no glossary input';
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'ikhfa');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    return { cards: document.querySelectorAll('.glossary-card').length };
  })()`);
  if (typeof glossary === "string") report("glossary", glossary);
  else if (glossary.cards < 1) report("glossary", `search 'ikhfa' produced ${glossary.cards} cards`);

  // Icon endpoints
  for (const iconPath of ["/icon.svg", "/apple-icon.png"]) {
    const ok = await evaluate(sessionId, `fetch('${BASE}${iconPath}').then(r => r.ok).catch(() => false)`);
    if (ok !== true) report("icons", `${iconPath} request failed`);
  }
}

async function main() {
  const sessionId = await setup();
  console.log(`Testing ${PAGES.length} pages x (1280 light, 1280 dark, 390 light) + interactions…`);
  for (const [name, url] of PAGES) {
    process.stdout.write(`  ${name}…`);
    await auditPage(sessionId, name, url, 1280, 900, "light");
    await auditPage(sessionId, name, url, 1280, 900, "dark");
    await auditPage(sessionId, name, url, 390, 844, "light");
    process.stdout.write(" done\n");
  }
  process.stdout.write("  interactions…");
  await interactionTests(sessionId);
  process.stdout.write(" done\n");

  console.log("─".repeat(60));
  if (issues.length === 0) {
    console.log("ALL CHECKS PASSED");
  } else {
    console.log(`ISSUES FOUND (${issues.length}):`);
    for (const issue of issues) console.log("  - " + issue);
  }
  sock.close();
  chrome.kill();
  server.close();
  process.exit(issues.length ? 1 : 0);
}

main().catch((err) => {
  console.error("Test runner failed:", err);
  chrome.kill();
  server.close();
  process.exit(1);
});


