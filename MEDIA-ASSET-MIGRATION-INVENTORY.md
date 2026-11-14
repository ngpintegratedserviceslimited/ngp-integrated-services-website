# NGP Media Asset Migration Inventory
**Updated:** 14 November 2026  
**Repository branch:** `main` (current release base)

## Inventory summary

- Current repository base: `main`, commit `e0f8a1eada0ba27a0499d7eec11adba915fc2fa9` (PR #22).
- The live Projects page contains the five field-photo references added by PR #22 (`field-1.jpg` through `field-5.jpg`). This confirms the PR #22 gallery markup is present in production.
- A current active-source search found no page/code references to `sol2.jpg` or `signvid.mp4`. Their remaining mentions in this file and the dated live audit are historical records only.
- The two unavailable originals are retired, not replaced with stock media. ICT Digital has no `sol2.jpg` image slot; Projects has no `signvid.mp4` player. Existing Projects gallery photos and its other video cards remain in place, so the retired assets do not leave blank image or video slots.
- PR #23 removes the legacy `.infy.uk` media proxy. The Pages Function serves packaged assets only and passes through the local asset response, including a genuine 404 for a missing file.
- This PR is source-only. No merge, Cloudflare configuration change, or production deployment is performed here.


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

## Retired originals

- `sol2.jpg` — unavailable and intentionally retired; no active page references remain.
- `signvid.mp4` — unavailable and intentionally retired; no active page references remain.

Neither file is replaced with unrelated imagery or video.


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
| /media/signageassets/img/vet.jpg | 1 | projects.html |

## Recovered signage image path correction

On 12 November 2026, 15 files matching the previously missing signage/printing filenames were located in the repository's root `img/` directory and visually inspected. References in `projects.html`, `index.html`, `printing-signage/index.html` and `integrated-projects/index.html` were updated from `/media/signageassets/img/` to `/img/` for these files: `prints.jpg`, `publishing.jpg`, `souvenir.jpg`, `signage.jpg`, `machine.jpg`, `jotter.jpg`, `envelopes.jpg`, `throwpillow.jpg`, `mugs.jpg`, `frames.jpg`, `tshirts.jpg`, `invoice.jpg`, `sign.jpg`, `neon.jpg` and `bcard.jpg`. These are existing repository files, not stock substitutions. The Git tree records `img/envelopes.jpg` at 2,363,218 bytes.

## Homepage video path correction

On 12 November 2026, the three homepage video links in `index.html` were corrected to point to the verified recovered originals under `/media/assets/img/`: `bv2.mp4`, `bv3.mp4` and `bv5.mp4`. The original recovered files remain unchanged. This source correction is committed on the repair branch; live/preview HTTP delivery still requires verification.

## Migration handling and release gates

1. Keep the existing NGP design, page structure and remaining working media unchanged.
2. Serve media from the repository's bundled Pages assets; do not proxy missing files to the retired InfinityFree host.
3. Confirm that each referenced local asset returns the expected status and content type.
4. Keep intentionally retired assets out of page markup and gallery/player components.
5. Run the repository static quality gate and inspect the PR preview before merge.
6. After an authorised merge/deployment, recheck the production media URLs and page layout. This PR itself does not deploy.


## Outstanding owner-side evidence

- No original file is required for `sol2.jpg` or `signvid.mp4`; both have been retired from active page references.
- Production deployment and post-deployment HTTP checks remain a separate release step requiring approval.



No credentials should be uploaded with the media archive.
