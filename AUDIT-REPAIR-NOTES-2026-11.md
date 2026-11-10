# NGP Website Production Audit & Repair — 10 November 2026

## Scope

This branch contains a controlled content and consent-clarity repair based on a review of the `main` branch. It does not deploy or alter the production branch.

## Changes in this branch

- Expanded the About page with NGP's delivery principles, scope control, safety and quality awareness, and responsible claims about qualifications and references.
- Expanded Services with clearer service deliverables and a practical enquiry checklist.
- Expanded Projects with a transparent distinction between capability areas and verified named-client case studies. No project outcomes, clients, contract values or certifications have been invented.
- Expanded Training with a practical learning approach and explicit distinction between the proposed skills centre and confirmed course dates or operational facilities.
- Expanded Partnership with a documented due-diligence and governance pathway.
- Expanded Contact with the information clients should include and a warning not to submit passwords, PINs or payment-card data.
- Expanded Printing, Signage & Sound with artwork approval, materials, installation and event-sound briefing guidance.
- Expanded Integrated Projects with workstream, programme, risk, communication and handover controls.
- Standardised the visible rejection wording to "Reject optional" on pages where the legacy label was "Essential only"; the stored choice remains the existing `essential` value and optional Google Consent Mode storage remains denied.
- Updated sitemap `lastmod` dates for pages changed in this branch. The sitemap still contains 21 canonical HTTPS URLs.
- Kept the confirmed GA4 measurement ID `G-190BLHG93V` and AdSense publisher declaration `pub-2745538383126037` unchanged.

## Deliberately not changed

### Legacy media proxy

`functions/media/[[path]].js` still retrieves legacy image/video assets from the former InfinityFree host. Removing this dependency without first staging and verifying all referenced assets would cause broken images and videos. The asset migration is therefore a release blocker, not something to conceal with a speculative code change.

### Consent certification

The site has a custom consent interface and Consent Mode defaults. This branch improves the rejection wording but does not certify the implementation as a Google-certified CMP or establish legal compliance in every visitor jurisdiction. Confirm the applicable regions and configure an eligible CMP in the relevant Google account where required.

### Production and account-side verification

No deployment is performed by this branch. Before production release, verify Cloudflare Pages preview and custom-domain routing; test all sitemap URLs and media; inspect GA4 real-time/debug events; verify the live `ads.txt`; test accept/reject persistence in clean browser sessions; and review Search Console and AdSense account status.

## Release checklist

- [ ] Build and inspect the Cloudflare Pages preview.
- [ ] Check mobile layout, navigation, page titles, canonical tags and internal links.
- [ ] Confirm all 21 sitemap URLs return the intended canonical page.
- [ ] Migrate legacy media to production-managed storage and verify every image/video before removing the proxy.
- [ ] Test consent defaults, acceptance, rejection and saved-choice behaviour.
- [ ] Confirm GA4 receives expected events after consent choices.
- [ ] Confirm `https://ngpintegratedservices.com/ads.txt` serves the expected publisher row.
- [ ] Review AdSense and Search Console account-side diagnostics.
- [ ] Obtain approval before merging to `main` and deploying production.
