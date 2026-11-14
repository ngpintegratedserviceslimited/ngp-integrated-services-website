#!/usr/bin/env node
/**
 * Live/preview HTTP smoke test. Uses Node.js 20 built-in fetch only.
 * Run: SITE_BASE_URL=https://ngpintegratedservices.com node scripts/smoke-live-site.mjs
 */
import process from "node:process";

const productionOrigin = "https://ngpintegratedservices.com";
const base = new URL((process.env.SITE_BASE_URL || productionOrigin).replace(/\/+$/, "") + "/");
const expectedAdsRow = "google.com, pub-2745538383126037, DIRECT, f08c47fec0942fa0";
const gaId = "G-190BLHG93V";
const failures = [];
const warnings = [];
const mediaAssets = new Map();

async function request(url, { method = "GET", redirect = "follow" } = {}) {
  return fetch(url, { method, redirect, signal: AbortSignal.timeout(25000), headers: { "User-Agent": "NGP-Site-Smoke-Test/2.0" } });
}
function log(message) { console.log(message); }
function fail(message) { failures.push(message); }
function warn(message) { warnings.push(message); }
function expectedCanonical(pathname) {
  return new URL(pathname === "/" ? "/" : pathname.replace(/\/+$/, ""), productionOrigin).href;
}
function addAsset(raw, pageUrl) {
  const value = String(raw || "").trim().replace(/&amp;/g, "&");
  if (!value || /^(?:data:|blob:|javascript:|mailto:|tel:|#)/i.test(value)) return;
  let url;
  try { url = new URL(value, pageUrl); } catch { return; }
  if (url.origin !== base.origin || !/\.(?:png|jpe?g|webp|gif|svg|avif|mp4|webm|mov|m4v)(?:$|[?#])/i.test(url.href)) return;
  url.hash = ""; url.search = "";
  mediaAssets.set(url.href, mediaAssets.get(url.href) || { path: url.pathname, refs: 0 });
  mediaAssets.get(url.href).refs++;
}
function collectAssets(html, pageUrl) {
  for (const match of html.matchAll(/\b(?:src|href|poster|data-src)\s*=\s*["']([^"']+)["']/gi)) addAsset(match[1], pageUrl);
  for (const match of html.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(",")) addAsset(candidate.trim().split(/\s+/)[0], pageUrl);
  }
  for (const match of html.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) addAsset(match[1], pageUrl);
}

for (const file of ["/robots.txt", "/ads.txt", "/sitemap.xml"]) {
  try {
    const response = await request(new URL(file, base));
    log((response.ok ? "PASS " : "FAIL ") + file + " -> HTTP " + response.status);
    if (!response.ok) fail(file + " returned HTTP " + response.status);
    if (file === "/robots.txt") {
      const body = await response.text();
      if (!body.includes(productionOrigin + "/sitemap.xml")) fail("robots.txt does not reference the canonical sitemap.");
    }
    if (file === "/ads.txt") {
      const body = await response.text();
      if (!body.split(/\r?\n/).map((x) => x.trim()).includes(expectedAdsRow)) fail("ads.txt does not contain the expected AdSense publisher row.");
    }
    if (file !== "/sitemap.xml") continue;

    const xml = await response.text();
    const locations = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map((m) => m[1].trim());
    if (!locations.length) fail("sitemap.xml contains no URL locations.");
    if (new Set(locations).size !== locations.length) fail("sitemap.xml contains duplicate URL locations.");
    log("INFO Sitemap URLs discovered: " + locations.length);

    const pages = await Promise.all(locations.map(async (location) => {
      let parsed;
      try { parsed = new URL(location); } catch { fail("Invalid sitemap URL: " + location); return null; }
      if (parsed.origin !== productionOrigin) fail("Non-canonical sitemap origin: " + location);
      if (parsed.pathname !== "/" && parsed.pathname.endsWith("/")) fail("Sitemap URL has trailing slash: " + location);
      const canonical = expectedCanonical(parsed.pathname);
      const requestUrl = new URL(parsed.pathname + parsed.search, base);
      try {
        const pageResponse = await request(requestUrl);
        log((pageResponse.ok ? "PASS " : "FAIL ") + parsed.pathname + " -> HTTP " + pageResponse.status + " (" + pageResponse.url + ")");
        if (!pageResponse.ok) { fail(parsed.pathname + " returned HTTP " + pageResponse.status); return null; }
        if (new URL(pageResponse.url).href !== canonical) fail(parsed.pathname + " resolved to non-canonical URL " + pageResponse.url);
        const html = await pageResponse.text();
        const canonicalTag = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] || "";
        const canonicalHref = canonicalTag.match(/\bhref=["']([^"']+)["']/i)?.[1] || "";
        if (canonicalHref !== canonical) fail(parsed.pathname + " canonical tag mismatch: " + (canonicalHref || "missing") + " (expected " + canonical + ")");
        if (!/<title\b[^>]*>\s*[^<]+<\/title>/i.test(html)) fail(parsed.pathname + " has no page title.");
        if (!/<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']{40,}["']/i.test(html)) warn(parsed.pathname + " has a missing or short meta description.");

        if (parsed.pathname !== "/") {
          const slashUrl = new URL(parsed.pathname.replace(/\/+$/, "") + "/", base);
          const slashResponse = await request(slashUrl, { redirect: "manual" });
          const locationHeader = slashResponse.headers.get("location");
          let target = "";
          try { target = new URL(locationHeader, slashUrl).href; } catch {}
          if (![301, 308].includes(slashResponse.status) || target !== canonical) {
            fail("Slash variant did not permanently redirect to " + canonical + " (status " + slashResponse.status + ", location " + (locationHeader || "missing") + ").");
          }
        }

        collectAssets(html, requestUrl);
        const stylesheets = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
        for (const ref of stylesheets) {
          try {
            const cssUrl = new URL(ref, requestUrl);
            if (cssUrl.origin !== base.origin) continue;
            const cssResponse = await request(cssUrl);
            if (!cssResponse.ok) { fail("Stylesheet " + cssUrl.pathname + " returned HTTP " + cssResponse.status); continue; }
            collectAssets(await cssResponse.text(), cssUrl);
          } catch (error) { fail("Stylesheet fetch failed for " + ref + ": " + error.message); }
        }
        return { path: parsed.pathname, html };
      } catch (error) { fail(parsed.pathname + " request failed: " + error.message); return null; }
    }));

    const homepage = pages.find((page) => page?.path === "/")?.html || "";
    const contact = pages.find((page) => page?.path === "/contact")?.html || "";
    if (!/name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(homepage)) fail("Homepage is missing a responsive viewport declaration.");
    if (!/id=["']primary-navigation["']/.test(homepage) || !/aria-controls=["']primary-navigation["']/.test(homepage) || !/aria-expanded=["']false["']/.test(homepage)) fail("Homepage mobile navigation controls are incomplete.");
    if (!/cookie-banner/.test(homepage) || !/cookie-accept/.test(homepage) || !/cookie-reject/.test(homepage)) fail("Homepage cookie accept/reject controls are incomplete.");
    if (!/float-call/.test(homepage) || !/float-wa/.test(homepage)) fail("Homepage floating telephone/WhatsApp enquiry links are missing.");
    if (!homepage.includes(gaId) || !homepage.includes("ngp-enquiry-events.js")) fail("Homepage GA4/enquiry tracking bootstrap is missing.");
    if (!contact.includes("ngp-contact-form") || !contact.includes("ngp-enquiry-events.js")) fail("Contact form tracking hook is missing.");
  } catch (error) { fail(file + " request failed: " + error.message); }
}

try {
  const scriptResponse = await request(new URL("/assets/js/ngp-enquiry-events.js", base));
  if (!scriptResponse.ok) fail("Enquiry event script returned HTTP " + scriptResponse.status);
  const script = await scriptResponse.text();
  for (const eventName of ["whatsapp_click", "phone_click", "contact_form_submit"]) {
    if (!script.includes(eventName)) fail("Enquiry tracking event is missing: " + eventName);
  }
} catch (error) { fail("Could not retrieve enquiry event script: " + error.message); }

await Promise.all([...mediaAssets.entries()].map(async ([url, item]) => {
  try {
    const response = await request(url);
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const video = /\.(?:mp4|webm|mov|m4v)$/i.test(item.path);
    if (!response.ok) fail("Media " + item.path + " returned HTTP " + response.status);
    if (video ? !contentType.startsWith("video/") : !contentType.startsWith("image/")) fail("Media " + item.path + " has unexpected content type: " + (contentType || "missing"));
    log((response.ok ? "PASS " : "FAIL ") + "media " + item.path + " -> HTTP " + response.status + " (" + (contentType || "no content-type") + "), refs=" + item.refs);
    if (response.body) await response.body.cancel();
  } catch (error) { fail("Media " + item.path + " request failed: " + error.message); }
}));

try {
  const missingResponse = await request(new URL("/media/assets/img/__ngp_missing_asset_probe__.jpg", base));
  const contentType = (missingResponse.headers.get("content-type") || "").toLowerCase();
  if (missingResponse.status !== 404 || contentType.includes("text/html")) fail("Missing media fallback must return a non-HTML 404; got HTTP " + missingResponse.status + " (" + contentType + ").");
  log("PASS missing-media fallback -> HTTP " + missingResponse.status + " (" + contentType + ")");
  if (missingResponse.body) await missingResponse.body.cancel();
} catch (error) { fail("Missing media probe failed: " + error.message); }

for (const message of warnings) log("WARN " + message);
for (const message of failures) log("FAIL " + message);
log("Smoke test complete: " + failures.length + " failure(s), " + warnings.length + " warning(s), " + mediaAssets.size + " unique image/video asset(s) checked.");
if (failures.length) process.exit(1);
