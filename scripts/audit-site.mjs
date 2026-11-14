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
if (exists("_redirects")) {
  const redirectRules = read("_redirects").split("\n").map((line) => line.trim()).filter(Boolean);
  if (redirectRules.some((line) => { const fields = line.split(" ").filter(Boolean); return fields[0]?.endsWith("/") && fields[fields.length - 1] === "200"; })) fail("A trailing-slash route is still internally rewritten with status 200 instead of redirected.");
  if (!redirectRules.some((line) => { const fields = line.split(" ").filter(Boolean); return fields[0]?.endsWith("/") && fields[fields.length - 1] === "301"; })) fail("No explicit permanent trailing-slash redirect rules were found.");
}
if (exists("functions/_middleware.js")) {
  const middleware = read("functions/_middleware.js");
  if (!middleware.includes('url.pathname.endsWith("/")') || !middleware.includes('Response.redirect(url.toString(), 301)')) fail("Cloudflare middleware is missing the global non-trailing-slash canonical redirect.");
  if (!middleware.includes('url.pathname.endsWith(".html")') || !middleware.includes('url.pathname.endsWith("/index.html")')) fail("Cloudflare middleware is missing direct HTML alias canonical redirects.");
}
if (exists("style.css") && !read("style.css").includes(".nav nav.mobile-open")) {
  fail("Shared stylesheet is missing the mobile navigation panel rules.");
}

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
const missingMediaAssets = new Set();
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
  if (/https?:\/\/(?:www\.)?ngpintegratedservices\.infy\.uk\/media\//i.test(html)) legacyHostReferences++;
  const mediaMatches = [...html.matchAll(/(?:src|href)=["'](\/media\/[^"']+)/g)];
  mediaReferences += mediaMatches.length;
  for (const match of mediaMatches) {
    const localPath = match[1].split(/[?#]/)[0].replace(/^\/+/, "");
    if (!exists(localPath)) missingMediaAssets.add(localPath);
  }

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\b[^>]*\bname=["']description["'][^>]*\bcontent="([^"]*)"/i)?.[1]
    || html.match(/<meta\b[^>]*\bcontent="([^"]*)"[^>]*\bname=["']description["']/i)?.[1]
    || html.match(/<meta\b[^>]*\bname='description'[^>]*\bcontent='([^']*)'/i)?.[1];
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
    if (!["privacy-policy.html", "terms.html"].includes(rel)) {
      const gaConfigCount = (html.match(/gtag\(\s*["']config["']\s*,\s*["']G-190BLHG93V["']/g) || []).length;
      if (gaConfigCount !== 1) fail(`Expected exactly one GA4 config on sitemap page ${rel}; found ${gaConfigCount}`);
      if (!html.includes("ngp-consent") || !html.includes("Reject optional") || !/cookie-(?:accept|reject|essential)/.test(html)) {
        fail(`Missing complete consent-choice controls on sitemap page: ${rel}`);
      }
      const hasPrimaryNav = /<nav\b[^>]*id=["']primary-navigation["']/i.test(html);
      const hasMenuControl = /<button\b(?=[^>]*aria-controls=["']primary-navigation["'])(?=[^>]*aria-expanded=["']false["'])[^>]*>/i.test(html);
      if (!hasPrimaryNav || !hasMenuControl) fail(`Missing accessible mobile navigation controls on sitemap page: ${rel}`);
      if (hasMenuControl && !/classList\.toggle\(["']mobile-open["']\)/.test(html)) fail(`Mobile menu does not toggle its navigation panel on ${rel}`);
      if (!html.includes("/assets/js/ngp-enquiry-events.js")) fail("Enquiry event tracking script is not loaded on " + rel);
    }
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
    if (pathname.startsWith("/media/") || pathname.startsWith("media/")) continue; // checked against bundled files above
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
if (exists("assets/js/ngp-enquiry-events.js")) {
  const eventScript = read("assets/js/ngp-enquiry-events.js");
  for (const eventName of ["whatsapp_click", "phone_click", "contact_form_submit"]) {
    if (!eventScript.includes(eventName)) fail(`Missing enquiry tracking event: ${eventName}`);
  }
} else fail("Missing assets/js/ngp-enquiry-events.js enquiry tracking implementation.");
if (exists("index.html")) {
  const home = read("index.html");
  if (!/name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(home)) fail("Homepage is missing its responsive viewport declaration.");
  if (!home.includes("cookie-accept") || !home.includes("cookie-reject") || !home.includes("float-call") || !home.includes("float-wa")) {
    fail("Homepage is missing mobile cookie controls or floating enquiry links.");
  }
}
if (!gaOccurrences) warn("No GA4 measurement ID found in HTML; confirm whether analytics is intentionally disabled.");
if (legacyHostReferences) warn(`Legacy media-origin URL appears in ${legacyHostReferences} HTML file(s); investigate and remove after verified media migration.`);
if (missingMediaAssets.size) warn(`${missingMediaAssets.size} referenced media asset(s) are not bundled locally and still depend on the legacy fallback: ${[...missingMediaAssets].join(", ")}`);
report.push(`HTML files scanned: ${htmlFiles.length}`);
report.push(`GA4 ID occurrences: ${gaOccurrences} (expected ID: ${GA_ID})`);
report.push(`Internal reference warnings: ${internalLinkFailures}`);
report.push(`Legacy-host HTML files: ${legacyHostReferences}`);
report.push(`Media references (local-first Pages route): ${mediaReferences}`);
report.push(`Missing bundled media assets: ${missingMediaAssets.size}`);

console.log("NGP WEBSITE QUALITY GATE");
for (const line of report) console.log(`PASS/INFO  ${line}`);
for (const message of warnings) console.log(`WARN      ${message}`);
for (const message of errors) console.error(`FAIL      ${message}`);
console.log(`\nResult: ${errors.length} error(s), ${warnings.length} warning(s)`);
if (errors.length) process.exit(1);
