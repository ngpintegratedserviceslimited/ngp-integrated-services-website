# NGP Media Asset Migration Inventory
**Generated:** 10 November 2026  
**Repository branch:** quality/website-audit-gates-2026-11

## Inventory summary
- **49 unique media paths**
- **118 references** found across HTML, JavaScript and CSS
- The static HTML quality gate separately reports **111 direct /media/ references**
- 18 homepage-referenced image URLs were individually tested against production and returned HTTP 404.
- The official logo at /assets/img/logo.png returned HTTP 200.
- The remaining 31 unique media paths have not yet all been individually tested.

The same media asset is often reused on multiple pages. Preserve the existing file names and paths during migration where possible, or update every reference consistently.

## Asset register

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
| /media/assets/video/bv2.mp4 | 1 | index.html |
| /media/assets/video/bv3.mp4 | 1 | index.html |
| /media/assets/video/bv5.mp4 | 1 | index.html |
| /media/signageassets/img/bcard.jpg | 5 | index.html, printing-signage/index.html, projects.html |
| /media/signageassets/img/doortags.jpg | 1 | projects.html |
| /media/signageassets/img/envelopes.jpg | 1 | projects.html |
| /media/signageassets/img/frames.jpg | 1 | projects.html |
| /media/signageassets/img/invoice.jpg | 1 | projects.html |
| /media/signageassets/img/jotter.jpg | 1 | projects.html |
| /media/signageassets/img/machine.jpg | 1 | projects.html |
| /media/signageassets/img/mugs.jpg | 5 | index.html, printing-signage/index.html, projects.html |
| /media/signageassets/img/neon.jpg | 5 | index.html, printing-signage/index.html, projects.html |
| /media/signageassets/img/prints.jpg | 3 | index.html, projects.html |
| /media/signageassets/img/publishing.jpg | 1 | projects.html |
| /media/signageassets/img/sign.jpg | 1 | projects.html |
| /media/signageassets/img/signage.jpg | 8 | index.html, integrated-projects/index.html, printing-signage/index.html, projects.html |
| /media/signageassets/img/signvid.mp4 | 1 | projects.html |
| /media/signageassets/img/souvenir.jpg | 1 | projects.html |
| /media/signageassets/img/throwpillow.jpg | 1 | projects.html |
| /media/signageassets/img/tshirts.jpg | 3 | index.html, projects.html |
| /media/signageassets/img/vet.jpg | 1 | projects.html |

## Migration handling
1. Recover the original images and videos at their original resolution and quality. Do not substitute unrelated stock images for genuine NGP project evidence.
2. Confirm each file is authorised for public use and that captions accurately describe the activity shown.
3. Store assets in a production-managed location with stable URLs, appropriate cache headers and a backup copy.
4. Preserve file names or update every reference in a single controlled change.
5. Test each asset by HTTP status, content type, dimensions/duration and visual playback.
6. Check image alternative text and video captions/transcripts where applicable.
7. Remove the legacy media proxy only after all 49 assets are accounted for and no page references the old origin.

## Evidence needed from the company
Please provide the original image/video archive or the source folders for:
- General field and installation photos
- Satellite/VSAT installations and equipment
- Engineering/BIM and infrastructure work
- Printing, signage and branded merchandise
- Project gallery photographs and videos

Do not upload credentials or private client records with the media archive.
