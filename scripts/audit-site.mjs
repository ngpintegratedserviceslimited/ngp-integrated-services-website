#!/usr/bin/env node
/**
 * NGP static-site quality gate. Uses Node.js built-ins only.
 * Run: node scripts/audit-site.mjs
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const DOMAIN = "https://ngpintegratedservices.com";
const GA_ID = "G-190BLHG93V";
const ADSENSE_ID = "pub-2745538383126037";
const ADSENSE_ROW = `google.com, ${ADSENSE_ID}, DIRECT, f08c47fec0942fa0`;
const errors = [];
const warnings = [];
const report = [];
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

function walk(dir, out = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", ".wrangler", "dist"].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full, out);
    else if (/\.(html?|mjs|js|css)$/.test(item.name)) out.push(path.relative(ROOT, full).split(path.sep).join("/"));
  }
  return out;
}
function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }
function routeCandidates(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (!clean || clean === "/") return ["index.html"];
  const relative = clean.replace(/^\/+|\/+$/g, "");
  return [`${relative}.html`, `${relative}/index.html`, relative];
}
function hasRoute(urlPath) {
  return routeCandidates(urlPath).some(exists);
}
function canonicalFor(urlPath) {
  return urlPath === "/" ? `${DOMAIN}/` : `${DOMAIN}${urlPath.replace(/\/+$/, "")}`;
}

const htmlFiles = walk(ROOT).filter((p) => p.endsWith(".html"));
const allTextFiles = walk(ROOT);
const sitemapPath = "sitemap.xml";
if (!exists(sitemapPath)) fail("Missing sitemap.xml");
if (!exists("ads.txt")) fail("Missing root ads.txt");
if (!exists("robots.txt")) fail("Missing robots.txt");
if (!exists("_redirects")) warn("No _redirects file found; verify Cloudflare Pages route handling.");

let sitemapUrls = [];
if (exists(sitemapPath)) {
  const xml = read(sitemapPath);
  if (!/<urlset\b/.test(xml)) fail("sitemap.xml does not contain a urlset.");
  sitemapUrls = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map((m) => m[1].trim());
  if (!sitemapUrls.length) fail("Sitemap contains no URL locations.");
  if (new Set(sitemapUrls).size !== sitemapUrls.length) fail("Sitemap contains duplicate URLs.");
  for (const url of sitemapUrls) {
    let parsed;
    try { parsed = new URL(url); } catch { fail(`Invalid sitemap URL: ${url}`); continue; }
    if (parsed.origin !== DOMAIN) fail(`Non-canonical sitemap origin: ${url}`);
    if (parsed.search || parsed.hash) fail(`Sitemap URL contains query or fragment: ${url}`);
    if (!hasRoute(parsed.pathname)) fail(`Sitemap route has no matching source file: ${parsed.pathname}`);
  }
  for (const match of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(match[1]) || Number.isNaN(Date.parse(match[1]))) {
      fail(`Invalid sitemap lastmod value: ${match[1]}`);
    }
  }
  report.push(`Sitemap: ${sitemapUrls.length} URLs`);
}

if (exists("ads.txt")) {
  const rows = read("ads.txt").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  if (!rows.includes(ADSENSE_ROW)) fail("ads.txt does not contain the expected AdSense publisher row.");
  if (rows.some((x) => x.includes("pub-5961293640549958"))) fail("Superseded AdSense publisher ID found in ads.txt.");
  if (rows.some((x) => x.startsWith("google.com,") && x !== ADSENSE_ROW)) warn("Additional Google ads.txt seller rows require account-owner verification.");
  report.push("ads.txt: expected publisher row present");
}

let gaOccurrences = 0;
let mediaReferences = 0;
let legacyHostReferences = 0;
let internalLinkFailures = 0;
for (const file of htmlFiles) {
  const html = read(file);
  const rel = file.replace(/\\/g, "/");
  if (html.includes("G-Z7WZZBPPQJ")) fail(`Superseded GA4 measurement ID found in ${rel}`);
  if (html.includes("pub-5961293640549958")) fail(`Superseded AdSense publisher ID found in ${rel}`);
  if (html.includes("Essential only")) fail(`Legacy ambiguous consent label found in ${rel}`);
  const ids = [...html.matchAll(/G-[A-Z0-9]+/g)].map((m) => m[0]);
  for (const id of ids) {
    gaOccurrences++;
    if (id !== GA_ID) fail(`Unexpected GA measurement ID ${id} in ${rel}`);
  }
  if (html.includes("ngpintegratedservices.infy.uk")) legacyHostReferences++;
  mediaReferences += (html.match(/(?:src|href|url\([^)]*)=["']?\/media\//g) || []).length;

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]
    || html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i)?.[1];
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  const h1Count = (html.match(/<h1\b/gi) || []).length;

  const isSitemapPage = sitemapUrls.some((u) => {
    const p = new URL(u).pathname;
    return routeCandidates(p).includes(rel);
  });
  if (isSitemapPage) {
    if (!title) fail(`Sitemap page has no title: ${rel}`);
    if (!description || description.length < 50) warn(`Sitemap page has missing/short meta description: ${rel}`);
    if (!canonical) fail(`Sitemap page has no canonical URL: ${rel}`);
    else {
      const expected = sitemapUrls.find((u) => routeCandidates(new URL(u).pathname).includes(rel));
      if (expected && canonical !== expected) fail(`Canonical mismatch in ${rel}: expected ${expected}, got ${canonical}`);
    }
    if (h1Count !== 1) warn(`Expected one primary H1 on ${rel}; found ${h1Count}`);
  }

  if (["privacy-policy.html", "terms.html", "404.html"].includes(rel) && html.includes("adsbygoogle.js")) {
    fail(`AdSense loader should not be present on legal/error page: ${rel}`);
  }

  const pageDir = path.dirname(rel);
  for (const m of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const value = m[1].trim();
    if (!value || /^(?:https?:|mailto:|tel:|javascript:|data:|blob:|#)/i.test(value)) continue;
    let pathname;
    try {
      pathname = value.startsWith("/")
        ? new URL(value, DOMAIN).pathname
        : path.posix.normalize(path.posix.join(pageDir === "." ? "" : pageDir, value.split(/[?#]/)[0]));
    } catch { continue; }
    if (pathname.startsWith("/media/") || pathname.startsWith("media/")) continue; // dynamic legacy media proxy; tracked separately
    if (/\.[a-z0-9]{2,5}$/i.test(pathname)) {
      const p = pathname.replace(/^\/+/, "");
      if (!exists(p)) {
        internalLinkFailures++;
        warn(`Local asset/file reference not found: ${rel} -> ${value}`);
      }
    } else if (!hasRoute(pathname.startsWith("/") ? pathname : `/${pathname}`)) {
      internalLinkFailures++;
      warn(`Local route reference has no matching source file: ${rel} -> ${value}`);
    }
  }
}
if (!gaOccurrences) warn("No GA4 measurement ID found in HTML; confirm whether analytics is intentionally disabled.");
if (legacyHostReferences) warn(`Legacy host name appears in ${legacyHostReferences} HTML file(s); investigate and remove after verified media migration.`);
if (mediaReferences) warn(`${mediaReferences} HTML media reference(s) still use the /media/ proxy; migrate and verify originals before retiring the legacy origin.`);
report.push(`HTML files scanned: ${htmlFiles.length}`);
report.push(`GA4 ID occurrences: ${gaOccurrences} (expected ID: ${GA_ID})`);
report.push(`Internal reference warnings: ${internalLinkFailures}`);
report.push(`Legacy-host HTML files: ${legacyHostReferences}`);
report.push(`Media proxy references: ${mediaReferences}`);

console.log("NGP WEBSITE QUALITY GATE");
for (const line of report) console.log(`PASS/INFO  ${line}`);
for (const message of warnings) console.log(`WARN      ${message}`);
for (const message of errors) console.error(`FAIL      ${message}`);
console.log(`\nResult: ${errors.length} error(s), ${warnings.length} warning(s)`);
if (errors.length) process.exit(1);
