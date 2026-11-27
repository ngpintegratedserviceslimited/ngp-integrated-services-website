#!/usr/bin/env node
/**
 * Responsive regression checks for the NGP homepage mobile layout.
 * Requires Playwright and Chromium; installed by site-quality.yml.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const ORIGIN = "http://127.0.0.1:4179";
const VIEWPORTS = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, ORIGIN).pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(ROOT, relative);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end("Not found"); return;
  }
  const ext = path.extname(file).toLowerCase();
  const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };
  res.writeHead(200, { "content-type": mime[ext] || "application/octet-stream", "cache-control": "no-store" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(4179, "127.0.0.1", resolve));

let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    await page.route("**/*", (request) => {
      const url = new URL(request.request().url());
      return url.origin === ORIGIN ? request.continue() : request.abort();
    });
    await page.goto(ORIGIN + "/", { waitUntil: "domcontentloaded" });
    const metrics = await page.evaluate(() => {
      const rect = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height, display: getComputedStyle(el).display };
      };
      const logo = document.querySelector(".brand img");
      const logoRect = logo?.getBoundingClientRect();
      const heroText = document.querySelector(".hero-grid > div:first-child");
      const textRect = heroText?.getBoundingClientRect();
      const actions = document.querySelector(".hero .actions")?.getBoundingClientRect();
      const floats = [".float-call", ".float-wa"].map((selector) => {
        const el = document.querySelector(selector);
        const r = el?.getBoundingClientRect();
        return r ? { selector, x:r.x, y:r.y, right:r.right, bottom:r.bottom, width:r.width, height:r.height, display:getComputedStyle(el).display } : null;
      });
      return {
        viewport: window.innerWidth, documentWidth: document.documentElement.scrollWidth,
        brand: rect(".brand"), logo: logoRect ? {x:logoRect.x,right:logoRect.right,width:logoRect.width,height:logoRect.height,naturalWidth:logo.naturalWidth,naturalHeight:logo.naturalHeight}:null,
        menu: rect(".mobile-menu"), nav: rect("#primary-navigation"), heading: rect(".hero h1"),
        heroText: textRect ? {x:textRect.x,y:textRect.y,right:textRect.right,bottom:textRect.bottom}:null,
        actions: actions ? {x:actions.x,y:actions.y,right:actions.right,bottom:actions.bottom}:null,
        floats
      };
    });
    assert.ok(metrics.documentWidth <= viewport.width + 1,
      viewport.name + ": horizontal page overflow " + JSON.stringify(metrics));
    assert.ok(metrics.brand && metrics.brand.x >= 0 && metrics.brand.right <= viewport.width + 1,
      viewport.name + ": brand is outside viewport " + JSON.stringify(metrics.brand));
    assert.ok(metrics.logo && metrics.logo.naturalWidth > 0 && metrics.logo.width > 0,
      viewport.name + ": official logo is missing or not rendered");
    const naturalRatio = metrics.logo.naturalWidth / metrics.logo.naturalHeight;
    const renderedRatio = metrics.logo.width / metrics.logo.height;
    assert.ok(Math.abs(naturalRatio - renderedRatio) < 0.03,
      viewport.name + ": official logo aspect ratio changed " + JSON.stringify(metrics.logo));
    assert.ok(metrics.heading && metrics.heading.x >= 0 && metrics.heading.right <= viewport.width + 1,
      viewport.name + ": hero heading exceeds viewport " + JSON.stringify(metrics.heading));
    if (viewport.width <= 600) {
      assert.ok(metrics.menu && metrics.menu.display !== "none" && metrics.menu.x >= 0 && metrics.menu.right <= viewport.width + 1,
        viewport.name + ": mobile menu is missing or clipped");
      assert.ok(metrics.nav && metrics.nav.display === "none",
        viewport.name + ": desktop navigation should be collapsed before opening");
      assert.ok(metrics.actions && metrics.floats.every(Boolean),
        viewport.name + ": hero actions or floating contact controls are missing");
      for (const f of metrics.floats) {
        assert.ok(f.display !== "none" && f.x >= 0 && f.right <= viewport.width + 1 && f.y >= 0 && f.bottom <= viewport.height + 1,
          viewport.name + ": floating control is clipped " + JSON.stringify(f));
        const a=metrics.actions;
        const intersects=!(f.right<=a.x || f.x>=a.right || f.bottom<=a.y || f.y>=a.bottom);
        assert.ok(!intersects, viewport.name + ": floating control covers hero action buttons " + JSON.stringify({float:f,actions:a}));
      }
      await page.locator(".mobile-menu").click();
      assert.equal(await page.locator("#primary-navigation").evaluate((el) => el.classList.contains("mobile-open")), true,
        viewport.name + ": mobile navigation did not open");
      await page.locator(".mobile-menu").click();
      assert.equal(await page.locator("#primary-navigation").evaluate((el) => el.classList.contains("mobile-open")), false,
        viewport.name + ": mobile navigation did not close");
    }
    console.log("PASS " + viewport.name + " " + JSON.stringify({documentWidth:metrics.documentWidth,headingWidth:metrics.heading.width,logoWidth:metrics.logo.width}));
    await context.close();
  }
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
console.log("PASS NGP homepage responsive layout checks at 360px, 390px, 768px and 1440px.");
