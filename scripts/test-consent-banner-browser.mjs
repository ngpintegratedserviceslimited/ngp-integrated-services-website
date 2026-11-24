#!/usr/bin/env node
/**
 * Browser regression checks for NGP consent banners and logo aspect ratios.
 * Requires Playwright and Chromium; the GitHub Actions workflow installs both.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const ORIGIN = "http://127.0.0.1:4178";
const EXPECTED_COPY = "Essential technologies keep this website working. With your permission, analytics and advertising technologies may also be used to understand website performance, improve our services and support relevant advertising. You can accept or reject optional technologies at any time. Read our";
const ROUTES = [
  "/", "/contact", "/logistics", "/consultancy", "/ict-digital", "/smart-security",
  "/knowledge-centre", "/facility-cleaning", "/printing-signage",
  "/integrated-projects", "/engineering-infrastructure",
  "/knowledge-centre/vsat-site-readiness", "/knowledge-centre/event-sound-planning",
  "/knowledge-centre/solar-backup-planning", "/knowledge-centre/borehole-planning-guide",
  "/knowledge-centre/office-network-planning", "/knowledge-centre/access-control-planning",
  "/knowledge-centre/automated-gate-selection", "/knowledge-centre/cctv-planning-maintenance",
  "/knowledge-centre/ict-maintenance-checklist", "/knowledge-centre/transport-planning-checklist",
  "/knowledge-centre/printing-signage-project-planning",
  "/privacy-policy", "/terms", "/about", "/services", "/momodu-godspower-oluwaseyi",
];
const VIEWPORTS = [{ name: "mobile", width: 390, height: 844 }, { name: "desktop", width: 1440, height: 900 }];
const FULL_CHOICE_TESTS = new Set(["/", "/contact", "/privacy-policy", "/terms", "/about", "/services", "/momodu-godspower-oluwaseyi"]);

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const relative = clean.replace(/^\/+/, "");
  const candidates = !relative ? ["index.html"] :
    path.extname(relative) ? [relative] : [relative + ".html", path.join(relative, "index.html")];
  for (const candidate of candidates) {
    const resolved = path.resolve(ROOT, candidate);
    if (resolved.startsWith(ROOT + path.sep) && fs.existsSync(resolved) && fs.statSync(resolved).isFile()) return resolved;
  }
  return null;
}
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };
const server = http.createServer((req, res) => {
  const file = resolveFile(new URL(req.url, ORIGIN).pathname);
  if (!file) { res.writeHead(404); res.end("Not found"); return; }
  res.writeHead(200, { "content-type": mime[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(4178, "127.0.0.1", resolve));

let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      await page.route("**/*", (routeRequest) => {
        const requestUrl = new URL(routeRequest.request().url());
        return requestUrl.origin === ORIGIN ? routeRequest.continue() : routeRequest.abort();
      });
      await page.goto(ORIGIN + route, { waitUntil: "domcontentloaded" });
      const banner = page.locator("#cookie-banner, #cookie-consent").first();
      assert.equal(await banner.isVisible(), true, "Fresh visitor banner not visible: " + route + " (" + viewport.name + ")");
      const copy = (await banner.innerText()).replace(/\s+/g, " ").trim();
      assert.ok(copy.includes(EXPECTED_COPY), "Consent copy differs: " + route);
      assert.equal((await page.locator("#cookie-accept").innerText()).trim(), "Accept optional", "Accept label differs: " + route);
      const reject = page.locator("#cookie-reject, #cookie-essential").first();
      assert.equal((await reject.innerText()).trim(), "Reject optional", "Reject label differs: " + route);
      const box = await banner.boundingBox();
      assert.ok(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1,
        "Consent banner exceeds " + viewport.name + " viewport: " + route + " " + JSON.stringify(box));
      for (const [label, locator] of [["Accept", page.locator("#cookie-accept")], ["Reject", reject]]) {
        const buttonBox = await locator.boundingBox();
        assert.ok(buttonBox && buttonBox.x >= 0 && buttonBox.y >= 0 && buttonBox.x + buttonBox.width <= viewport.width + 1 && buttonBox.y + buttonBox.height <= viewport.height + 1,
          label + " button is outside the " + viewport.name + " viewport: " + route);
      }

      const logos = page.locator('img[alt*="logo" i]');
      for (let i = 0; i < await logos.count(); i++) {
        const info = await logos.nth(i).evaluate((img) => {
          const rect = img.getBoundingClientRect();
          return { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, width: rect.width, height: rect.height };
        });
        if (info.naturalWidth && info.naturalHeight && info.width > 0 && info.height > 0) {
          const naturalRatio = info.naturalWidth / info.naturalHeight;
          const renderedRatio = info.width / info.height;
          assert.ok(Math.abs(renderedRatio - naturalRatio) < 0.02, "NGP logo aspect ratio is distorted on " + route + ": " + JSON.stringify(info));
        }
      }

      if (FULL_CHOICE_TESTS.has(route)) {
        await page.locator("#cookie-accept").click();
        assert.equal(await page.evaluate(() => localStorage.getItem("ngp-consent")), "accepted", "Accept did not persist on " + route);
        const accepted = await page.evaluate(() => window.dataLayer.filter((item) => item && item[0] === "consent" && item[1] === "update").map((item) => item[2]).at(-1));
        assert.equal(accepted?.analytics_storage, "granted", "Accept did not grant analytics on " + route);
        assert.equal(accepted?.ad_storage, "granted", "Accept did not grant advertising storage on " + route);
        await page.reload({ waitUntil: "domcontentloaded" });
        assert.equal(await page.locator("#cookie-banner, #cookie-consent").first().isVisible(), false, "Accepted choice was not remembered on " + route);

        await page.evaluate(() => localStorage.removeItem("ngp-consent"));
        await page.reload({ waitUntil: "domcontentloaded" });
        assert.equal(await page.locator("#cookie-banner, #cookie-consent").first().isVisible(), true, "Cleared choice did not restore the banner on " + route);
        await page.locator("#cookie-reject, #cookie-essential").first().click();
        assert.equal(await page.evaluate(() => localStorage.getItem("ngp-consent")), "essential", "Reject did not persist on " + route);
        const rejected = await page.evaluate(() => window.dataLayer.filter((item) => item && item[0] === "consent" && item[1] === "update").map((item) => item[2]).at(-1));
        assert.equal(rejected?.analytics_storage, "denied", "Reject did not deny analytics on " + route);
        assert.equal(rejected?.ad_storage, "denied", "Reject did not deny advertising storage on " + route);
        await page.reload({ waitUntil: "domcontentloaded" });
        assert.equal(await page.locator("#cookie-banner, #cookie-consent").first().isVisible(), false, "Rejected choice was not remembered on " + route);
      }
      await context.close();
      console.log("PASS " + viewport.name + " " + route);
    }
  }
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
console.log("PASS consent browser checks: 27 pages at mobile and desktop; fresh visits, visible controls, viewport fit, logo aspect ratios, accept/reject signals and saved-choice persistence on all pages with independent dynamic implementations.");
