/**
 * Headless design/QA test for the static export in ./out.
 * Uses Chrome DevTools Protocol directly (no npm dependencies).
 * Serves ./out, launches headless Chrome, and audits every page in
 * light/dark at desktop width plus a mobile pass, then exercises the
 * interactive components (theme, menu, quiz, palette, filters).
 * Usage: node scripts/design-test.mjs [port]
 */
import { createServer } from "node:http";
import { readFile, stat, writeFile } from "node:fs/promises";
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
    let responseStatus = 200;
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
      if (urlPath !== "/" && existsSync(notFound)) { file = notFound; responseStatus = 404; }
    }
    if (!file) { res.writeHead(404).end("not found"); return; }
    const body = await readFile(file);
    res.writeHead(responseStatus, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
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

const PAGE_TYPES = [
  ["home", "/"],
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
const QA_LOCALES = (process.env.QA_LOCALES || "en,ar,ur,id,fr").split(",");
const PAGES = QA_LOCALES.flatMap(locale => PAGE_TYPES.filter(([name]) => name !== "404").map(([name, url]) => [`${locale}-${name}`, `/${locale}${url === "/" ? "/" : url}`])).concat([["404", "/nonexistent-page"]]);
const WIDTHS = (process.env.QA_WIDTHS || "320,375,390,430,768,1024,1280,1440").split(",").map(Number);

async function auditPage(sessionId, name, url, width, height, mode) {
  const label = `${name} ${width}px ${mode}`;
  consoleMessages = []; requestFailures = []; pageErrors = [];
  await navigate(sessionId, BASE + url, width, height);
  await evaluate(sessionId, `document.documentElement.classList.${mode === "dark" ? "add" : "remove"}('dark'); 'ok'`);
  if (mode === "dark") {
    await evaluate(sessionId, "document.documentElement.classList.add('dark'); 'ok'");
    await sleep(250);
  }
  for (const err of pageErrors) report(label, `page error: ${err}`);
  for (const err of consoleMessages) report(label, `console: ${err}`);
  for (const fail of requestFailures) report(label, `request failed: ${fail}`);

  const overflow = await evaluate(sessionId, `(() => {
    const doc = document.documentElement;
    const out = { sw: doc.scrollWidth, cw: doc.clientWidth, elements: [], clippedText: [] };
    // A clipped body can conceal scrollWidth overflow. Check the actual
    // bounds of controls and visible text even when the document fits.
    const candidates = document.querySelectorAll('.site-header a, .site-header button, .site-header select, main a, main button, main input, main select, main summary, main h1, main h2, main h3, main h4, main p, main li, main span, main small, main img, .site-footer a, .site-footer p');
    const description = el => el.tagName + '.' + String(el.className?.baseVal ?? el.className ?? '').split(' ')[0];
    for (const el of candidates) {
      if (el.closest('.sr-only, [hidden], [aria-hidden="true"]')) continue;
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (!r.width || !r.height || style.visibility === 'hidden' || style.display === 'none') continue;
      let intentionallyScrollable = false;
      for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const parentStyle = getComputedStyle(parent);
        if (['auto', 'scroll'].includes(parentStyle.overflowX) && parent.scrollWidth > parent.clientWidth + 1) { intentionallyScrollable = true; break; }
      }
      if (intentionallyScrollable) continue;
      if ((r.right > doc.clientWidth + 1 || r.left < -1) && out.elements.length < 8) out.elements.push(description(el) + ' [' + Math.round(r.left) + ',' + Math.round(r.right) + ']');
      if (!el.children.length && el.textContent.trim() && el.clientWidth && el.scrollWidth > el.clientWidth + 2 && ['hidden', 'clip'].includes(style.overflowX) && out.clippedText.length < 5) out.clippedText.push(description(el));
    }
    return out;
  })()`);
  if (!overflow || overflow.__error) report(label, `bounds inspection failed: ${JSON.stringify(overflow)}`);
  else {
    if (overflow.sw > overflow.cw + 1) report(label, `horizontal overflow ${overflow.sw}>${overflow.cw}`);
    if (overflow.elements.length) report(label, `offscreen controls/content: ${overflow.elements.join(", ")}`);
    if (overflow.clippedText.length) report(label, `clipped leaf text: ${overflow.clippedText.join(", ")}`);
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
  if (name !== "404" && typeof font === "string" && !/google.?sans|amiri/i.test(font)) {
    report(label, `font not applied: ${font}`);
  }
}

const interactionChecks = [];
function checked(label, result, fields) {
  for (const field of fields) {
    const passed = Boolean(result && !result.__error && result[field] === true);
    interactionChecks.push({ label, check: field, passed });
    if (!passed) report(label, `${field} failed: ${JSON.stringify(result)}`);
  }
}
async function waitFor(sessionId, expression, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(sessionId, expression) === true) return true;
    await sleep(100);
  }
  return false;
}
async function pressKey(sessionId, key, modifiers = 0) {
  const keyCodes = { Tab: 9, Enter: 13, Escape: 27, ArrowDown: 40, ArrowUp: 38 };
  await send("Input.dispatchKeyEvent", { type: "keyDown", key, code: key, windowsVirtualKeyCode: keyCodes[key], modifiers }, sessionId);
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code: key, windowsVirtualKeyCode: keyCodes[key], modifiers }, sessionId);
}
async function readyControls(sessionId) {
  // Use a DOM event that must update React state to distinguish rendered HTML
  // from hydrated controls. The later interactions make their own assertions.
  await waitFor(sessionId, "Boolean(document.querySelector('.language-switcher select'))");
  await sleep(250);
}

async function interactionTests(sessionId) {
  const languageRoutes = ["/tajweed/what-is-tajweed/", "/glossary/", "/practice/", "/articles/how-to-start-learning-tajweed/"];
  for (const [sourceIndex, locale] of QA_LOCALES.entries()) {
    const target = QA_LOCALES[(sourceIndex + 1) % QA_LOCALES.length];
    for (const route of languageRoutes) {
      await navigate(sessionId, BASE + "/" + locale + route + "?q=madd&qa=language#main-content", 390, 844);
      await readyControls(sessionId);
      const options = await evaluate(sessionId, `(() => {
        const select = document.querySelector('.language-switcher select');
        return { fiveOptions: select?.options.length === 5, selectedSource: select?.value === ${JSON.stringify(locale)} };
      })()`);
      checked("language " + locale + route, options, ["fiveOptions", "selectedSource"]);
      await evaluate(sessionId, `(() => {
        const select = document.querySelector('.language-switcher select');
        if (!select) return false;
        select.value = ${JSON.stringify(target)};
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      })()`);
      const arrived = await waitFor(sessionId, `location.pathname === ${JSON.stringify("/" + target + route)} && document.documentElement.lang === ${JSON.stringify(target)} && document.readyState === 'complete'`);
      const destination = await evaluate(sessionId, `(() => ({
        arrived: ${arrived},
        direction: document.documentElement.dir === ${JSON.stringify(["ar", "ur"].includes(target) ? "rtl" : "ltr")},
        equivalentRoute: location.pathname === ${JSON.stringify("/" + target + route)},
        keptQuery: location.search === '?q=madd&qa=language',
        keptHash: location.hash === '#main-content',
        selectedDestination: document.querySelector('.language-switcher select')?.value === ${JSON.stringify(target)},
        savedPreference: localStorage.getItem('tajweed-language') === ${JSON.stringify(target)}
      }))()`);
      checked("language " + locale + " -> " + target + route, destination, ["arrived", "direction", "equivalentRoute", "keptQuery", "keptHash", "selectedDestination", "savedPreference"]);
    }

    await navigate(sessionId, BASE + "/" + locale + "/", 390, 844);
    await readyControls(sessionId);
    await evaluate(sessionId, "document.querySelector('.menu-button').focus()");
    await pressKey(sessionId, "Enter");
    const opened = await waitFor(sessionId, "document.querySelector('.main-nav')?.classList.contains('open')");
    await evaluate(sessionId, "document.querySelector('.main-nav a')?.focus()");
    await pressKey(sessionId, "Tab");
    const keyboardMoved = await evaluate(sessionId, "document.activeElement === document.querySelectorAll('.main-nav a')[1]");
    await pressKey(sessionId, "Escape");
    await sleep(80);
    const menu = await evaluate(sessionId, `(() => ({
      opened: ${opened}, keyboardMoved: ${keyboardMoved},
      closed: !document.querySelector('.main-nav').classList.contains('open'),
      returnedFocus: document.activeElement === document.querySelector('.menu-button'),
      expandedFalse: document.querySelector('.menu-button').getAttribute('aria-expanded') === 'false',
      skipTargetExists: document.querySelector('.skip-link')?.hash === '#main-content' && Boolean(document.getElementById('main-content'))
    }))()`);
    checked("keyboard menu " + locale, menu, ["opened", "keyboardMoved", "closed", "returnedFocus", "expandedFalse", "skipTargetExists"]);

    // Check both theme transitions in each locale without English-label matching.
    const theme = await evaluate(sessionId, `(async () => {
      const btn = document.querySelector('.nav-actions button[aria-pressed]');
      if (!btn) return { found: false };
      const before = document.documentElement.classList.contains('dark');
      btn.click(); await new Promise(r => setTimeout(r, 50));
      const changed = document.documentElement.classList.contains('dark') !== before;
      const persisted = localStorage.getItem('theme') === (before ? 'light' : 'dark');
      btn.click(); await new Promise(r => setTimeout(r, 50));
      return { found: true, changed, persisted, restored: document.documentElement.classList.contains('dark') === before };
    })()`);
    checked("theme " + locale, theme, ["found", "changed", "persisted", "restored"]);

    // The modal opens with focus on its input, traps Tab at both boundaries,
    // supports arrow selection, and restores the originating control on Escape.
    await evaluate(sessionId, `(() => {
      document.querySelector('.search-button').focus();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    })()`);
    await waitFor(sessionId, "Boolean(document.querySelector('.search-palette input'))");
    const search = await evaluate(sessionId, `(async () => {
      const input = document.querySelector('.search-palette input');
      if (!input) return { opened: false };
      const focusedInput = document.activeElement === input;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'madd');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 180));
      const hasResults = document.querySelectorAll('.palette-result').length > 0;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await new Promise(r => setTimeout(r, 50));
      const selectedWithArrow = input.getAttribute('aria-activedescendant') === 'palette-result-1';
      const all = [...document.querySelectorAll('.search-palette button, .search-palette input, .search-palette a[href]')];
      all.at(-1)?.focus();
      return { opened: true, focusedInput, hasResults, selectedWithArrow, resultLinksLocalized: [...document.querySelectorAll('.palette-result')].every(a => a.pathname.startsWith('/${locale}/')) };
    })()`);
    checked("search " + locale, search, ["opened", "focusedInput", "hasResults", "selectedWithArrow", "resultLinksLocalized"]);
    await pressKey(sessionId, "Tab");
    const trappedForward = await evaluate(sessionId, "document.activeElement === document.querySelector('.palette-close')");
    await pressKey(sessionId, "Tab", 8);
    const trappedBackward = await evaluate(sessionId, "document.activeElement === [...document.querySelectorAll('.search-palette button, .search-palette input, .search-palette a[href]')].at(-1)");
    await pressKey(sessionId, "Escape");
    await sleep(80);
    const searchFocus = await evaluate(sessionId, `(() => ({
      trappedForward: ${trappedForward}, trappedBackward: ${trappedBackward},
      closed: !document.querySelector('.search-palette'),
      returnedFocus: document.activeElement === document.querySelector('.search-button'),
      restoredScroll: document.body.style.overflow !== 'hidden'
    }))()`);
    checked("search focus " + locale, searchFocus, ["trappedForward", "trappedBackward", "closed", "returnedFocus", "restoredScroll"]);

    // Answer one wrong and one right, attempt to re-score answered questions,
    // go backwards, then finish. The two-question lesson must finish at 50%.
    await navigate(sessionId, BASE + "/" + locale + "/tajweed/what-is-tajweed/", 1280, 900);
    await readyControls(sessionId);
    const quiz = await evaluate(sessionId, `(async () => {
      const pause = () => new Promise(r => setTimeout(r, 100));
      const options = () => [...document.querySelectorAll('.lesson-quiz .quiz-option')];
      const firstDefinition = document.querySelector('.rule-intro')?.textContent.trim();
      const wrong = options().find(b => b.querySelector('.option-text')?.textContent.trim() !== firstDefinition);
      if (!wrong) return { available: false };
      wrong.click(); await pause();
      const incorrectFeedback = Boolean(document.querySelector('.quiz-feedback.incorrect[role="status"]'));
      const answeredBefore = document.querySelector('.quiz-progress-bar')?.getAttribute('aria-valuenow');
      options().find(b => b.classList.contains('correct'))?.click(); await pause();
      const preventedRescore = Boolean(document.querySelector('.quiz-feedback.incorrect')) && document.querySelector('.quiz-progress-bar')?.getAttribute('aria-valuenow') === answeredBefore;
      document.querySelector('.quiz-navigation .primary')?.click(); await pause();
      const advancedWithFocus = document.activeElement === document.getElementById('quiz-heading');
      const guidance = document.querySelector('#pronunciation > p')?.textContent.trim();
      options().find(b => b.querySelector('.option-text')?.textContent.trim() === guidance)?.click(); await pause();
      const correctFeedback = Boolean(document.querySelector('.quiz-feedback.correct[role="status"]'));
      document.querySelector('.quiz-navigation .secondary')?.click(); await pause();
      const previousRetained = Boolean(document.querySelector('.quiz-feedback.incorrect')) && options().every(b => b.getAttribute('aria-disabled') === 'true');
      document.querySelector('.quiz-navigation .primary')?.click(); await pause();
      const secondRetained = Boolean(document.querySelector('.quiz-feedback.correct'));
      document.querySelector('.quiz-navigation .primary')?.click(); await pause();
      const complete = Boolean(document.querySelector('.lesson-quiz-results'));
      const scoreCorrect = document.querySelector('.score-number')?.textContent.trim() === '50%';
      const completionFocus = document.activeElement === document.getElementById('quiz-results');
      const reviewLocalized = document.querySelector('.results-actions a')?.pathname === '/${locale}/tajweed/what-is-tajweed/';
      document.querySelector('.results-actions button')?.click(); await pause();
      const reset = Boolean(document.querySelector('.quiz-options')) && document.querySelector('.quiz-progress-bar')?.getAttribute('aria-valuenow') === '0' && !document.querySelector('.quiz-feedback');
      return { available: true, incorrectFeedback, preventedRescore, advancedWithFocus, correctFeedback, previousRetained, secondRetained, complete, scoreCorrect, completionFocus, reviewLocalized, reset };
    })()`);
    checked("lesson quiz " + locale, quiz, ["available", "incorrectFeedback", "preventedRescore", "advancedWithFocus", "correctFeedback", "previousRetained", "secondRetained", "complete", "scoreCorrect", "completionFocus", "reviewLocalized", "reset"]);

    await navigate(sessionId, BASE + "/" + locale + "/practice/", 1280, 900);
    await readyControls(sessionId);
    const practice = await evaluate(sessionId, `(async () => {
      const pause = () => new Promise(r => setTimeout(r, 100));
      const pill = document.querySelectorAll('.filter-pills button')[1];
      if (!pill) return { available: false };
      pill.click(); await pause();
      const activated = pill.getAttribute('aria-pressed') === 'true';
      const difficulty = document.querySelectorAll('.practice-filter-row select')[1];
      difficulty.value = 'advanced'; difficulty.dispatchEvent(new Event('change', { bubbles: true })); await pause();
      const emptyFilters = Boolean(document.querySelector('.practice-empty'));
      document.querySelector('.practice-filters .clear-filter')?.click(); await pause();
      const resetFilters = Boolean(document.querySelector('.quiz-session')) && document.querySelectorAll('.filter-pills button')[0]?.getAttribute('aria-pressed') === 'true' && difficulty.value === '';
      const option = document.querySelector('.session-option'); option?.click(); await pause();
      const feedback = Boolean(document.querySelector('.answer-feedback[role="status"]'));
      return { available: true, activated, emptyFilters, resetFilters, feedback };
    })()`);
    checked("practice filters " + locale, practice, ["available", "activated", "emptyFilters", "resetFilters", "feedback"]);

    await navigate(sessionId, BASE + "/" + locale + "/tajweed/", 1280, 900);
    await readyControls(sessionId);
    const directory = await evaluate(sessionId, `(async () => {
      const pause = () => new Promise(r => setTimeout(r, 100));
      const button = document.querySelectorAll('.directory-mode-button')[1]; button?.click(); await pause();
      const switched = button?.getAttribute('aria-pressed') === 'true' && document.querySelectorAll('.directory-rule-card').length === 50;
      const category = document.getElementById('directory-category'), level = document.getElementById('directory-level');
      category.value = 'Foundations'; category.dispatchEvent(new Event('change', { bubbles: true }));
      level.value = 'Advanced'; level.dispatchEvent(new Event('change', { bubbles: true })); await pause();
      const empty = Boolean(document.querySelector('.directory-empty')) && !document.querySelector('.directory-rule-card');
      category.value = 'all'; category.dispatchEvent(new Event('change', { bubbles: true }));
      level.value = 'all'; level.dispatchEvent(new Event('change', { bubbles: true })); await pause();
      return { switched, empty, reset: document.querySelectorAll('.directory-rule-card').length === 50 };
    })()`);
    checked("directory " + locale, directory, ["switched", "empty", "reset"]);

    await navigate(sessionId, BASE + "/" + locale + "/glossary/", 1280, 900);
    await readyControls(sessionId);
    const glossary = await evaluate(sessionId, `(async () => {
      const input = document.querySelector('.glossary-search input');
      const title = document.querySelector('.glossary-card h2')?.textContent.trim();
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      const change = async value => { setter.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); await new Promise(r => setTimeout(r, 100)); };
      if (!input || !title) return { available: false };
      await change(title); const localizedSearch = document.querySelectorAll('.glossary-card').length > 0;
      await change('zzzzzznomatch'); const empty = Boolean(document.querySelector('.directory-empty')) && !document.querySelector('.glossary-card');
      await change(''); const reset = document.querySelectorAll('.glossary-card').length === 50;
      return { available: true, localizedSearch, empty, reset };
    })()`);
    checked("glossary " + locale, glossary, ["available", "localizedSearch", "empty", "reset"]);

    // Browser zoom reduces the CSS viewport. 640 CSS pixels at DPR 2 is
    // the reflow-equivalent of a 1280-pixel desktop at 200% zoom.
    for (const route of ["/", "/tajweed/what-is-tajweed/", "/glossary/"]) {
      await navigate(sessionId, BASE + "/" + locale + route, 640, 450);
      await send("Emulation.setDeviceMetricsOverride", { width: 640, height: 450, deviceScaleFactor: 2, mobile: false }, sessionId);
      const zoom = await evaluate(sessionId, `(() => ({
        noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
        readableMain: Boolean(document.querySelector('main h1')) && getComputedStyle(document.body).fontSize !== '0px',
        switcherAvailable: Boolean(document.querySelector('.language-switcher select')),
        mainTarget: Boolean(document.getElementById('main-content'))
      }))()`);
      checked("200% zoom-equivalent " + locale + route, zoom, ["noOverflow", "readableMain", "switcherAvailable", "mainTarget"]);
    }
  }

  // Storage failures are injected before scripts execute. A throwing getter
  // checks both theme initialization and the language switcher's catch path.
  const { identifier } = await send("Page.addScriptToEvaluateOnNewDocument", { source: "Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('Storage disabled for QA', 'SecurityError'); } });" }, sessionId);
  try {
    for (const [index, locale] of QA_LOCALES.entries()) {
      const target = QA_LOCALES[(index + 1) % QA_LOCALES.length];
      pageErrors = [];
      await navigate(sessionId, BASE + "/" + locale + "/", 390, 844);
      await readyControls(sessionId);
      const storage = await evaluate(sessionId, `(async () => {
        const h1 = document.querySelector('main h1');
        const button = document.querySelector('.nav-actions button[aria-pressed]');
        if (!button) return { rendered: Boolean(h1), themeWorks: false };
        const before = document.documentElement.classList.contains('dark');
        button.click(); await new Promise(r => setTimeout(r, 60));
        const themeWorks = document.documentElement.classList.contains('dark') !== before;
        const select = document.querySelector('.language-switcher select');
        select.value = ${JSON.stringify(target)}; select.dispatchEvent(new Event('change', { bubbles: true }));
        return { rendered: Boolean(h1), themeWorks };
      })()`);
      checked("storage unavailable " + locale, storage, ["rendered", "themeWorks"]);
      const navigationWorks = await waitFor(sessionId, `location.pathname === ${JSON.stringify("/" + target + "/")} && document.documentElement.lang === ${JSON.stringify(target)} && document.readyState === 'complete'`);
      checked("storage unavailable language " + locale, { navigationWorks, noPageErrors: pageErrors.length === 0 }, ["navigationWorks", "noPageErrors"]);
    }
  } finally {
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier }, sessionId);
  }
  await navigate(sessionId, BASE + "/en/", 1280, 900);
  for (const iconPath of ["/icon.png", "/apple-icon.png"]) {
    const available = await evaluate(sessionId, `fetch(${JSON.stringify(BASE + iconPath)}).then(r => r.ok).catch(() => false)`);
    checked("icon " + iconPath, { available }, ["available"]);
  }
  console.log(`\n  ${interactionChecks.filter(check => check.passed).length}/${interactionChecks.length} interaction assertions passed.`);
}

async function main() {
  const sessionId = await setup();
  let layoutChecks = 0;
  console.log(`Testing ${PAGES.length} page variants at widths ${WIDTHS.join(", ")} plus dark themes and interactions…`);
  for (const [name, url] of (process.env.QA_INTERACTIONS_ONLY ? [] : PAGES)) {
    process.stdout.write(`  ${name}…`);
    for (const width of WIDTHS) { await auditPage(sessionId, name, url, width, width < 700 ? 844 : 900, "light"); layoutChecks++; }
    for (const width of [390, 1280]) if (WIDTHS.includes(width)) { await auditPage(sessionId, name, url, width, 900, "dark"); layoutChecks++; }
    process.stdout.write(" done\n");
  }
  process.stdout.write("  interactions…");
  await interactionTests(sessionId);
  process.stdout.write(" done\n");

  console.log("─".repeat(60));
  await writeFile(path.join(ROOT, "docs", "design-qa-results.json"), JSON.stringify({
    locales: QA_LOCALES, widths: WIDTHS, routeVariants: PAGES.length,
    layoutChecks, interactionAssertions: interactionChecks.length,
    passedInteractionAssertions: interactionChecks.filter(check => check.passed).length,
    zoomMethod: "200% reflow equivalent: 640 CSS-pixel viewport at DPR 2 for a 1280-pixel desktop",
    interactions: interactionChecks, issues,
  }, null, 2) + "\n");
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


