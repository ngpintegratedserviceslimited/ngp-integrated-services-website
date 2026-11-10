# NGP Live Website Verification — 10 November 2026

## Method
The public production domain was checked with fresh live fetches, not repository source inspection. This is a point-in-time external observation.

## Confirmed observations

| Check | Live result | Assessment |
|---|---|---|
| Homepage | HTTP 200 | Responding |
| Services page | HTTP 200 | Responding |
| Privacy Policy | HTTP 200, but older short policy is served | Repository/live deployment mismatch |
| Sitemap | 20 URLs discovered; listed last-modified dates are 27 October 2026 | Stale relative to the 10 November repository release |
| Company profile route | HTTP 404 | Missing from current live deployment |
| ads.txt | Expected NGP AdSense publisher row is served | Content appears correct; account-side status still needs confirmation |
| Homepage app section | Offers browser-based website installation | Not a separate Play Store/App Store app |
| Media proxy | 18 homepage-referenced image URLs tested; all returned HTTP 404 | Critical media delivery failure |

## Sample media URLs returning 404
- /media/assets/img/vsat5.jpg
- /media/assets/img/gal.jpg
- /media/signageassets/img/mugs.jpg
- /media/assets/img/sol2.jpg
- /media/assets/img/panel.jpg
- /media/signageassets/img/bcard.jpg
- /media/assets/img/vsat4.jpg
- /media/assets/img/gal2.jpg
- /media/signageassets/img/prints.jpg
- /media/signageassets/img/neon.jpg
- /media/assets/img/bim1.jpg
- /media/signageassets/img/signage.jpg
- /media/assets/img/gal3.jpg
- /media/signageassets/img/tshirts.jpg
- /media/assets/img/vsat8.jpg
- /media/assets/img/yaks.jpg
- /media/signageassets/img/envelopes.jpg
- /media/signageassets/img/jotter.jpg

The official logo at /assets/img/logo.png returned HTTP 200.

## Privacy and consent deployment mismatch
The live Privacy Policy still contains the older brief policy text and loads the AdSense script. The merged repository version contains the expanded privacy notice and removes the AdSense loader from the legal page. The live page must be updated and re-tested before the privacy work can be considered complete.

## Legacy media origin
A direct request to the old InfinityFree image origin returned HTTP 200 only when TLS certificate verification was bypassed. This is not sufficient to certify the origin as a reliable production media source. The production /media/ paths returned 404 in the checks above. The old host should not remain a long-term dependency.

## Required remediation
1. Verify the current Cloudflare Pages production deployment and its deployed commit SHA.
2. Inspect Pages Function routing/logs for /media/* and determine why the live function path returns 404 while the legacy source may still respond.
3. Recover the original image/video files and migrate them to durable production-managed storage (Cloudflare assets or R2, depending on the selected deployment design).
4. Update every image/video reference and verify every file by HTTP response and visual inspection.
5. Deploy the repository's merged privacy and content changes only after preview testing.
6. Add the company profile route to the production deployment and sitemap.
7. Run the live smoke test against the preview first, then production after release.

## Release posture
The live site is **not technically release-verified**. The media failure is a critical visitor-facing defect. The repository changes and the live site must be treated as separate states until the deployed SHA and post-deployment tests match.
