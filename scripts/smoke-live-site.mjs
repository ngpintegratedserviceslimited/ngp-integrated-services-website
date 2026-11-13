#!/usr/bin/env node
/**
 * Live/preview HTTP smoke test. Uses Node.js 20 built-in fetch only.
 * Run: SITE_BASE_URL=https://ngpintegratedservices.com node scripts/smoke-live-site.mjs
 */
import process from "node:process";
const productionOrigin = "https://ngpintegratedservices.com";
const base = new URL((process.env.SITE_BASE_URL || productionOrigin).replace(/\/+$/, "") + "/");
const expectedAdsRow = "google.com, pub-2745538383126037, DIRECT, f08c47fec0942fa0";
const failures = [];
const warnings = [];
const checkedAssets = new Set();
async function get(url, method = "GET") {
  return fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "User-Agent": "NGP-Site-Smoke-Test/1.0" } });
}
function log(message) { console.log(message); }
function fail(message) { failures.push(message); }
function warn(message) { warnings.push(message); }

for (const file of ["/robots.txt", "/ads.txt", "/sitemap.xml"]) {
  try {
    const response = await get(new URL(file, base));
    log((response.ok ? "PASS " : "FAIL ") + file + " -> HTTP " + response.status);
    if (!response.ok) fail(file + " returned HTTP " + response.status);
    if (file === "/robots.txt") {
      const body = await response.text();
      if (!body.includes(productionOrigin + "/sitemap.xml")) warn("robots.txt does not reference the canonical production sitemap.");
    }
    if (file === "/ads.txt") {
      const body = await response.text();
      if (!body.split(/\r?\n/).map((x) => x.trim()).includes(expectedAdsRow)) fail("ads.txt does not contain the expected AdSense publisher row.");
    }
    if (file === "/sitemap.xml") {
      const xml = await response.text();
      const locations = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map((m) => m[1].trim());
      if (!locations.length) fail("sitemap.xml contains no URL locations.");
      if (new Set(locations).size !== locations.length) fail("sitemap.xml contains duplicate URL locations.");
      log("INFO Sitemap URLs discovered: " + locations.length);
      const pages = await Promise.all(locations.map(async (location) => {
        const parsed = new URL(location);
        const requestUrl = new URL(parsed.pathname + parsed.search, base);
        try {
          const pageResponse = await get(requestUrl);
          log((pageResponse.ok ? "PASS " : "FAIL ") + parsed.pathname + " -> HTTP " + pageResponse.status);
          if (!pageResponse.ok) {
            fail(parsed.pathname + " returned HTTP " + pageResponse.status);
            return null;
          }
          return { path: parsed.pathname, html: await pageResponse.text() };
        } catch (error) {
          fail(parsed.pathname + " request failed: " + error.message);
          return null;
        }
      }));
      for (const page of pages.filter(Boolean)) {
        const refs = [...page.html.matchAll(/<(?:img|source|video)[^>]+(?:src|poster)=["']([^"']+)["']/gi)].map((m) => m[1]);
        for (const ref of refs) {
          if (/^(?:data:|blob:|javascript:|mailto:|tel:)/i.test(ref)) continue;
          let assetUrl;
          try { assetUrl = new URL(ref, new URL(page.path, base)); } catch { continue; }
          if (assetUrl.hostname === new URL(productionOrigin).hostname) assetUrl = new URL(assetUrl.pathname + assetUrl.search, base);
          if (assetUrl.origin !== base.origin || checkedAssets.has(assetUrl.href)) continue;
          checkedAssets.add(assetUrl.href);
        }
      }
    }
  } catch (error) {
    fail(file + " request failed: " + error.message);
  }
}

// A missing media URL must be a genuine non-HTML 404, not a legacy-host page.
try {
  const missingUrl = new URL("/media/assets/img/__ngp_missing_asset_probe__.jpg", base);
  const missingResponse = await get(missingUrl);
  const contentType = missingResponse.headers.get("content-type") || "";
  log((missingResponse.status === 404 && !contentType.toLowerCase().includes("text/html") ? "PASS " : "FAIL ")
    + "missing media fallback -> HTTP " + missingResponse.status + " (" + (contentType || "no content-type") + ")");
  if (missingResponse.status !== 404) fail("Missing media probe did not return HTTP 404.");
  if (contentType.toLowerCase().includes("text/html")) fail("Missing media probe returned HTML instead of a media 404.");
} catch (error) {
  fail("Missing media probe failed: " + error.message);
}

await Promise.all([...checkedAssets].map(async (url) => {
  try {
    const response = await get(url);
    log((response.ok ? "PASS " : "FAIL ") + "asset " + new URL(url).pathname + " -> HTTP " + response.status);
    if (!response.ok) fail("Asset " + url + " returned HTTP " + response.status);
  } catch (error) {
    fail("Asset " + url + " request failed: " + error.message);
  }
}));
for (const message of warnings) log("WARN " + message);
for (const message of failures) log("FAIL " + message);
log("Smoke test complete: " + failures.length + " failure(s), " + warnings.length + " warning(s), " + checkedAssets.size + " unique media asset(s) checked.");
if (failures.length) process.exit(1);
