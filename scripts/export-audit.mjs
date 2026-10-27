/** Validate the actual exported HTML, not only the TypeScript route registry. */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../out");
const issues = [];
const pages = [];
async function walk(directory) { for (const item of await readdir(directory, { withFileTypes: true })) { const filename = path.join(directory, item.name); if (item.isDirectory() && item.name !== "_next") await walk(filename); else if (item.name === "index.html") pages.push(filename); } }
await walk(root);
const decode = (text) => text.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://tajweed101.pages.dev";
const htmlByPath = new Map();
for (const filename of pages) htmlByPath.set("/" + path.relative(root, path.dirname(filename)).replaceAll("\\", "/").replace(/^\.$/, ""), await readFile(filename, "utf8"));
let links = 0;
let localized = 0;
let indexablePages = 0;
let languageLinks = 0;
let structuredDataBlocks = 0;
const titles = new Map();
const descriptions = new Map();
for (const [route, html] of htmlByPath) {
  const locale = route.match(/^\/(en|ar|ur|id|fr|tr)(?:\/|$)/)?.[1];
  if (!locale) continue;
  localized++;
  const canonicalPath = route.replace(/\/+$/, "") + "/";
  const expected = new URL(canonicalPath, origin).href;
  const canonical = decode(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] || "");
  if (canonical !== expected) issues.push(`${route}: canonical ${canonical} != ${expected}`);
  if (!html.includes(`<html lang="${locale}" dir="${["ar", "ur"].includes(locale) ? "rtl" : "ltr"}"`)) issues.push(`${route}: document language/direction`);
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) issues.push(`${route}: expected one H1`);
  if (!html.includes('name="description"')) issues.push(`${route}: missing description`);
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
  if (/^\/(en|ar|ur|id|fr|tr)\/search$/.test(route) && !noindex) issues.push(`${route}: search must be noindex`);
  if (!noindex) {
    indexablePages++;
    const title = decode(html.match(/<title>([^<]+)<\/title>/)?.[1] || "");
    const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] || "");
    for (const [value, label, registry] of [[title, "title", titles], [description, "description", descriptions]]) {
      if (!value.trim()) { issues.push(`${route}: empty ${label}`); continue; }
      const key = `${locale}:${value}`;
      if (registry.has(key)) issues.push(`${route}: duplicate indexable ${label} with ${registry.get(key)}`);
      registry.set(key, route);
    }
  }
  if (!html.includes('hrefLang="x-default"') && !html.includes('hreflang="x-default"')) issues.push(`${route}: missing language alternates`);
  const basePath = canonicalPath.replace(/^\/(en|ar|ur|id|fr|tr)(?=\/|$)/, "");
  const alternates = [...html.matchAll(/<link\b[^>]*rel="alternate"[^>]*>/gi)].map(([tag]) => ({ language: tag.match(/\bhreflang="([^"]+)"/i)?.[1], href: decode(tag.match(/\bhref="([^"]+)"/i)?.[1] || "") })).filter((item) => item.language);
  for (const language of ["en", "ar", "ur", "id", "fr", "tr", "x-default"]) {
    const alternate = alternates.find((item) => item.language === language);
    const expectedAlternate = new URL(`/${language === "x-default" ? "en" : language}${basePath}`, origin).href;
    if (!alternate || alternate.href !== expectedAlternate) issues.push(`${route}: incorrect ${language} alternate`);
    languageLinks++;
  }
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  for (const match of body.matchAll(/\bhref="([^"]+)"/g)) {
    const href = decode(match[1]);
    if (!href.startsWith("/") && !href.startsWith("#")) continue;
    links++;
    const url = new URL(href, new URL(canonicalPath, origin));
    const target = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
    const file = path.join(root, target);
    const targetHtml = htmlByPath.get(target === "/" ? "/" : target);
    if (!targetHtml && !existsSync(file)) { issues.push(`${route}: broken link ${href}`); continue; }
    if (url.hash && targetHtml && !targetHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) issues.push(`${route}: missing anchor ${href}`);
    if (/^\/(?:learn|tajweed|glossary|practice|articles|about|sources|editorial-policy|search|listen|my-learning)(?:\/|$)/.test(url.pathname)) issues.push(`${route}: unlocalized internal link ${href}`);
    const linkedLocale = url.pathname.match(/^\/(en|ar|ur|id|fr|tr)(?:\/|$)/)?.[1];
    if (linkedLocale && linkedLocale !== locale) issues.push(`${route}: link changes language ${href}`);
  }
  for (const data of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    structuredDataBlocks++;
    try { JSON.parse(data[1]); } catch { issues.push(`${route}: invalid structured data`); }
  }
}
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const robots = await readFile(path.join(root, "robots.txt"), "utf8");
if (!robots.includes(new URL("/sitemap.xml", origin).href)) issues.push("Robots: missing canonical sitemap reference");
for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const url = new URL(decode(match[1]));
  const key = url.pathname.replace(/\/+$/, "") || "/";
  const html = htmlByPath.get(key);
  if (url.origin !== new URL(origin).origin) issues.push(`Sitemap: wrong origin ${url}`);
  if (!html) issues.push(`Sitemap: missing page ${url}`);
  else if (/<meta name="robots" content="[^"]*noindex/.test(html)) issues.push(`Sitemap: noindex page ${url}`);
  if (/\/search\//.test(url.pathname)) issues.push(`Sitemap: search utility ${url}`);
}
const redirects = await readFile(path.join(root, "_redirects"), "utf8");
const redirectSources = new Set();
for (const line of redirects.split(/\r?\n/).filter(line => line.trim() && !line.startsWith("#"))) {
  const [source, target, status] = line.split(/\s+/);
  if (status !== "301" || !/^\/(en|ar|ur|id|fr|tr)\/learn\//.test(source)) issues.push(`Redirect: unexpected rule ${line}`);
  if (redirectSources.has(source)) issues.push(`Redirect: duplicate source ${source}`);
  redirectSources.add(source);
  if (source.split("/")[1] !== target.split("/")[1] || !htmlByPath.has(target.replace(/\/+$/, ""))) issues.push(`Redirect: invalid destination ${target}`);
}
const uniqueIssues = [...new Set(issues)];
await writeFile(path.resolve(import.meta.dirname, "../docs/export-audit-results.json"), JSON.stringify({ pages: localized, indexablePages, links, languageLinks, structuredDataBlocks, issues: uniqueIssues }, null, 2) + "\n");
console.log(`${localized} localized HTML pages; ${indexablePages} indexable pages; ${links} internal links; ${languageLinks} language alternates; ${uniqueIssues.length} issues.`);
for (const issue of uniqueIssues.slice(0, 65)) console.error(issue);
process.exitCode = uniqueIssues.length ? 1 : 0;
