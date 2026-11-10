# NGP Corporate Website — Quality Programme Baseline
**Baseline date:** 10 November 2026  
**Repository:** `ngpintegratedserviceslimited/ngp-integrated-services-website`  
**Production domain:** `https://ngpintegratedservices.com`

## Why this programme exists
The website is a corporate trust, service-discovery and enquiry platform. A successful release must demonstrate more than visual changes: accurate company information, clear service scope, useful technical content, accessible navigation, reliable media, crawlable pages, correct measurement, privacy controls and repeatable release checks.

## Verified repository baseline
- The November content and consent repair was merged in PR #11 at merge commit `a90f5f54d95fcedbb3a8298b750faa0033ebc2d6`.
- The repository is a static Cloudflare Pages site with HTML pages, shared CSS, a `_redirects` file and a Pages Function for legacy media.
- Sitemap currently contains 24 canonical HTTPS URLs on `ngpintegratedservices.com`, including six Knowledge Centre guides.
- Confirmed GA4 measurement ID: `G-190BLHG93V`.
- Confirmed AdSense publisher row: `google.com, pub-2745538383126037, DIRECT, f08c47fec0942fa0`.
- The sitemap's route structure includes root HTML pages, directory-based service/article pages and profile content. Cloudflare Pages route mapping must be preserved.
- The root `robots.txt` references the canonical sitemap.

## Findings requiring action

### P0 — Legacy media dependency
`functions/media/[[path]].js` fetches requested images from `ngpintegratedservices.infy.uk`. This creates a dependency on the former host and can leave images unavailable or slow if that host changes. Do not delete the proxy until the complete source asset inventory is copied to durable production-managed storage and all references are verified.

### P0 — Runtime and deployment verification
The repository is not proof of what Cloudflare currently serves. The live domain, Pages deployment, redirects, headers, media responses, and root `ads.txt`/sitemap responses must be checked against a known deployment SHA. A browser-level smoke test is still required.

### P1 — Consent and tag governance
The site uses a custom consent banner and Google Consent Mode defaults. Repository inspection alone cannot verify actual browser storage, network requests, regional rules, or Google-certified CMP status. Test fresh sessions for accept, reject, persistence, and withdrawal; confirm GA4 and advertising tags do not fire in a way inconsistent with the applicable consent configuration. Confirm any Google account-side CMP requirement before monetisation.

### P1 — Page and content architecture
The site has a 24-URL sitemap, but the content system is a collection of static pages rather than a managed publishing system. Establish a controlled page register, content owner, last-reviewed date, evidence source and next review date. Separate:
- corporate facts and legal identity;
- services and deliverables;
- sector/use-case pages;
- project capability versus completed, evidenced case studies;
- training programmes versus proposed facilities;
- knowledge-centre guides and technical advice;
- legal and privacy information.

Do not publish client names, completed project claims, certifications, training dates, facilities, performance statistics or partnerships unless documentary evidence is available and approved.

### P1 — Accessibility and responsive experience
Run keyboard, focus, contrast, mobile navigation, heading hierarchy, form-label, alt-text and zoom checks. Automated checks are useful but do not replace manual review on mobile and desktop.

### P2 — Performance and search quality
Measure real page weight, image formats/dimensions, caching, compression, render-blocking assets, Core Web Vitals, canonical consistency, metadata, structured data, internal links and indexability. Avoid adding structured data claims that cannot be supported.

## Automated quality gate introduced
`scripts/audit-site.mjs` checks sitemap format/uniqueness/canonical host, source-file route coverage, page titles/canonicals/H1s, legacy GA and AdSense IDs, consent label regression, ads.txt publisher row, AdSense loading on legal/error pages, and local file/route references. Legacy media proxy references are reported as warnings until migration is complete.

GitHub Actions runs this gate on pushes to the main and quality/content branches and on pull requests targeting main.

## Release acceptance criteria
1. Static quality gate passes with no errors; warnings are triaged and documented.
2. Every sitemap URL returns HTTP 200 and the intended canonical page in the Cloudflare preview and production.
3. Every internal link resolves; no unintended 404s or redirect loops.
4. Every image/video loads from production-managed storage; no dependency on the old InfinityFree host remains.
5. Mobile and desktop layout, keyboard access, contrast and form behaviour are manually checked.
6. Consent is tested in a clean browser profile: default, accept, reject, saved choice and withdrawal.
7. GA4 events are confirmed in DebugView/Realtime with consent state respected.
8. Root `ads.txt` returns HTTP 200 from both HTTP and HTTPS entry points, and its publisher ID matches the AdSense account.
9. Search Console sitemap and indexing diagnostics are reviewed; AdSense site status is reviewed in the account.
10. The exact commit SHA deployed to Cloudflare is recorded and a post-deploy smoke test is completed.

## Manual checks that require owner/account access
- Cloudflare Pages production and preview deployment status, build logs, domains and redirects.
- Google Analytics DebugView/Realtime and property configuration.
- Google Search Console ownership, sitemap status, coverage/indexing and manual actions.
- AdSense site review, publisher account, CMP requirement and ads.txt status.
- Original media archive and approval of any case-study photographs or project evidence.

## Current release posture
**Not certified production-ready by this repository audit.** The repository contains useful content and correct known identifiers, but live deployment, media migration, consent behaviour, analytics reception and account-side diagnostics remain outstanding.

## Content expansion — 10 November 2026
Three additional Knowledge Centre guides were added for VSAT/satellite site readiness, solar backup planning for security and ICT equipment, and printing/signage project planning. The Knowledge Centre now links to six practical guides. The new routes are included in the sitemap and Cloudflare Pages redirects.
