# NGP Media Asset Migration Inventory
**Updated:** 12 November 2026  
**Repository branch:** `quality/website-audit-gates-2026-11`

## Inventory summary
- After the 14 signage-image path corrections, the latest GitHub Actions inventory reports **31 unique `/media/` paths** and **80 references** across repository HTML, JavaScript and CSS. The Pages Function now checks the bundled local asset first and only contacts the legacy host when a file is absent locally.
- The static HTML quality gate reports **74 direct `/media/` references**. These now resolve through a local-first Pages asset route; only the two unavailable originals (`sol2.jpg` and `signvid.mp4`) should need the legacy fallback.
- The production audit tested 18 homepage-referenced media URLs; all 18 returned HTTP 404. The official logo at `/assets/img/logo.png` returned HTTP 200.
- The company has now supplied two restoration archives in ChatGPT. The larger archive, `ngp-site-assets-restoration.zip`, contains **29 recovered originals: 24 JPEG images and 5 MP4 videos**, preserving the repository's expected directory structure.
- The recovered archive was validated: all 24 JPEGs decoded successfully and all 5 MP4s exposed valid H.264 video streams via ffprobe.
- **Repository verification (12 November 2026):** all 29 recovered asset files are present in both `main` and `quality/website-audit-gates-2026-11`. Their Git blob SHAs and file sizes match across the two branches. This confirms repository storage; it does not establish that the current production deployment serves them.
- No separate media-upload commit was identified; the recovered archive files are confirmed present in both branches. Subsequent repair-branch commits correct media references and update this inventory.
- **15 of the 17 filenames omitted from the supplied archive were found in the repository's root `img/` directory.** References were migrated to `/img/<filename>` in the affected pages. The static audit and media inventory are the authoritative current counts; a few `/media/` references remain to be reconciled individually.
- Two assets remain unavailable in the repository: `sol2.jpg` and `signvid.mp4`.
- **Important:** no production media URL has yet been verified as repaired. Production delivery, Cloudflare routing/cache behavior, and the preview/live smoke test remain outstanding.

## Recovered original assets

| Repository-relative path | Type | Validation |
|---|---|---|
| `media/assets/img/Rovers.jpg` | JPEG 1080×810 | Decodes |
| `media/assets/img/bakes.jpeg` | JPEG 739×415 | Decodes |
| `media/assets/img/bim1.jpg` | JPEG 720×536 | Decodes |
| `media/assets/img/bim2.jpg` | JPEG 1080×810 | Decodes |
| `media/assets/img/bim3.jpg` | JPEG 653×1080 | Decodes |
| `media/assets/img/bv2.mp4` | H.264 MP4 358×640, 30.03s | Video stream validated |
| `media/assets/img/bv3.mp4` | H.264 MP4 360×640, 22.08s | Video stream validated |
| `media/assets/img/bv5.mp4` | H.264 MP4 368×656, 30.64s | Video stream validated |
| `media/assets/img/fly.jpg` | JPEG 739×415 | Decodes |
| `media/assets/img/gal.jpg` | JPEG 810×1080 | Decodes |
| `media/assets/img/gal2.jpg` | JPEG 720×715 | Decodes |
| `media/assets/img/gal3.jpg` | JPEG 480×360 | Decodes |
| `media/assets/img/gal5.jpg` | JPEG 2976×3968 | Decodes |
| `media/assets/img/gal6.jpg` | JPEG 3264×2448 | Decodes |
| `media/assets/img/gal7.jpg` | JPEG 2448×3264 | Decodes |
| `media/assets/img/gal8.jpg` | JPEG 3264×2448 | Decodes |
| `media/assets/img/panel.jpg` | JPEG 4160×3120 | Decodes |
| `media/assets/img/sat.jpg` | JPEG 540×960 | Decodes |
| `media/assets/img/vsat4.jpg` | JPEG 720×404 | Decodes |
| `media/assets/img/vsat5.jpg` | JPEG 539×404 | Decodes |
| `media/assets/img/vsat6.jpg` | JPEG 540×405 | Decodes |
| `media/assets/img/vsat7.jpg` | JPEG 540×405 | Decodes |
| `media/assets/img/vsat8.jpg` | JPEG 720×405 | Decodes |
| `media/assets/img/vsat9.jpg` | JPEG 720×404 | Decodes |
| `media/assets/img/vsatv1.mp4` | H.264 MP4 624×368, 58.97s | Video stream validated |
| `media/assets/img/vsatv2.mp4` | H.264 MP4 368×624, 49.87s | Video stream validated |
| `media/assets/img/yaks.jpg` | JPEG 3120×3120 | Decodes |
| `media/signageassets/img/doortags.jpg` | JPEG 4160×3120 | Decodes |
| `media/signageassets/img/vet.jpg` | JPEG 4160×3120 | Decodes |

## Original assets still unavailable

- `sol2.jpg` — five remaining references use `/media/assets/img/sol2.jpg`; do not replace with unrelated stock imagery.
- `signvid.mp4` — one remaining reference uses `/media/signageassets/img/signvid.mp4`; do not substitute another video.

The other 15 filenames from the earlier archive-missing list were located in the repository's root `img/` directory and their page references were migrated to `/img/`. The static audit counts 74 HTML references routed through `/media/`. The Pages Function now serves matching repository assets first via the Pages `ASSETS` binding; only missing originals use the legacy-host fallback. Production delivery still requires a post-deployment HTTP check.

## Full repository asset register

| Media path | References | Current source pages |
|---|---:|---|
| /media/assets/img/bakes.jpeg | 1 | projects.html |
| /media/assets/img/bim1.jpg | 4 | engineering-infrastructure/index.html, index.html, projects.html |
| /media/assets/img/bim2.jpg | 1 | projects.html |
| /media/assets/img/bim3.jpg | 1 | projects.html |
| /media/assets/img/bv2.mp4 | 1 | projects.html |
| /media/assets/img/bv3.mp4 | 1 | projects.html |
| /media/assets/img/bv5.mp4 | 1 | projects.html |
| /media/assets/img/fly.jpg | 1 | projects.html |
| /media/assets/img/gal.jpg | 11 | engineering-infrastructure/index.html, index.html, integrated-projects/index.html, logistics/index.html, projects.html |
| /media/assets/img/gal2.jpg | 9 | consultancy/index.html, index.html, projects.html, smart-security/index.html |
| /media/assets/img/gal3.jpg | 8 | consultancy/index.html, index.html, projects.html, smart-security/index.html |
| /media/assets/img/gal5.jpg | 1 | projects.html |
| /media/assets/img/gal6.jpg | 1 | projects.html |
| /media/assets/img/gal7.jpg | 1 | projects.html |
| /media/assets/img/gal8.jpg | 1 | projects.html |
| /media/assets/img/panel.jpg | 10 | ict-digital/index.html, index.html, integrated-projects/index.html, projects.html, smart-security/index.html |
| /media/assets/img/Rovers.jpg | 1 | projects.html |
| /media/assets/img/sat.jpg | 1 | projects.html |
| /media/assets/img/sol2.jpg | 5 | ict-digital/index.html, index.html, projects.html |
| /media/assets/img/vsat4.jpg | 4 | ict-digital/index.html, index.html |
| /media/assets/img/vsat5.jpg | 3 | index.html, projects.html |
| /media/assets/img/vsat6.jpg | 1 | projects.html |
| /media/assets/img/vsat7.jpg | 1 | projects.html |
| /media/assets/img/vsat8.jpg | 1 | projects.html |
| /media/assets/img/vsat9.jpg | 1 | projects.html |
| /media/assets/img/vsatv1.mp4 | 1 | projects.html |
| /media/assets/img/vsatv2.mp4 | 1 | projects.html |
| /media/assets/img/yaks.jpg | 1 | projects.html |
| /media/signageassets/img/doortags.jpg | 1 | projects.html |
| /media/signageassets/img/signvid.mp4 | 1 | projects.html |
| /media/signageassets/img/vet.jpg | 1 | projects.html |

## Recovered signage image path correction

On 12 November 2026, 15 files matching the previously missing signage/printing filenames were located in the repository's root `img/` directory and visually inspected. References in `projects.html`, `index.html`, `printing-signage/index.html` and `integrated-projects/index.html` were updated from `/media/signageassets/img/` to `/img/` for these files: `prints.jpg`, `publishing.jpg`, `souvenir.jpg`, `signage.jpg`, `machine.jpg`, `jotter.jpg`, `envelopes.jpg`, `throwpillow.jpg`, `mugs.jpg`, `frames.jpg`, `tshirts.jpg`, `invoice.jpg`, `sign.jpg`, `neon.jpg` and `bcard.jpg`. These are existing repository files, not stock substitutions. The Git tree records `img/envelopes.jpg` at 2,363,218 bytes.

## Homepage video path correction

On 12 November 2026, the three homepage video links in `index.html` were corrected to point to the verified recovered originals under `/media/assets/img/`: `bv2.mp4`, `bv3.mp4` and `bv5.mp4`. The original recovered files remain unchanged. This source correction is committed on the repair branch; live/preview HTTP delivery still requires verification.

## Migration handling and release gates
1. Recover the original images and videos at their original resolution and quality. Do not substitute unrelated stock images for genuine NGP project evidence.
2. Confirm each file is authorised for public use and that captions accurately describe the activity shown.
3. Store assets in a production-managed location with stable URLs, appropriate cache headers and a backup copy.
4. Preserve file names and directory paths, or update every reference consistently in a single controlled change.
5. Test each asset by HTTP status, content type, dimensions/duration and visual inspection/playback.
6. Check image alternative text and video captions/transcripts where applicable.
7. Remove the legacy media proxy only after every referenced asset is accounted for, direct and proxy URLs have been verified, and no page references the old origin.
8. Re-run the static quality gate and preview/live HTTP smoke test. Do not describe this archive receipt as a successful production migration.

## Outstanding owner-side evidence
- The two unavailable original assets: `sol2.jpg` and `signvid.mp4`.
- Cloudflare Pages/R2 or other approved production storage access to publish the recovered files.
- Preview URL and post-upload access to verify all asset responses.

No credentials should be uploaded with the media archive.
