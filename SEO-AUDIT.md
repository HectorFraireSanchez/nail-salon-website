# Utopian Nails SEO audit

Audited September 4, 2026 (America/Chicago). Live HTTP checks ran September 5 at approximately 02:12 UTC. Repository changes are ready for deployment; this audit did not publish them or modify external accounts.

## Exact changes

1. Updated the homepage title to **Utopian Nails | Nail Salon in Fort Worth, TX** and the Visit title to **Visit Utopian Nails | Fort Worth Nail Salon**. The existing Services and Gallery titles already matched the requested wording and remain unchanged.
2. Updated the Home, Services, and Visit meta descriptions. The homepage now describes the West Fort Worth studio, its services, and online/call/text booking. Services now includes Fort Worth. Visit explicitly identifies Studio 104 inside Phenix Salon Suites of Camp Bowie in Fort Worth. The existing Gallery description remains appropriate and unchanged. Shared Open Graph titles/descriptions automatically use the updated metadata.
3. Added one homepage `WebSite` JSON-LD entity with the official name and canonical homepage URL. Its `publisher` references the existing `NailSalon` ID, avoiding a duplicate Organization. This follows [Google's site-name guidance](https://developers.google.com/search/docs/appearance/site-names).
4. Made Monday closure explicit in `openingHoursSpecification` with `opens` and `closes` both `00:00`. Tuesday–Sunday hours remain unchanged. Added Fort Worth, Texas to the business schema description. Changed the containing salon-suites entity from `LocalBusiness` to `Place`, so the building is described without introducing a second incomplete business listing. The required name/address, official URL, phone, email, logo/image, and official social profiles remain accurate. These changes follow [Google's LocalBusiness guidance](https://developers.google.com/search/docs/appearance/structured-data/local-business).
5. Corrected service heading hierarchy: service names directly under a category use `h3`; names under a named `h3` subgroup retain `h4`. Updated both desktop and mobile CSS selectors to preserve the existing typography. Visible wording is unchanged.
6. Removed eager/high-priority loading from the first two homepage gallery photos, which follow the large text hero. All six homepage gallery photos now use lazy loading and asynchronous decoding. Their original files, dimensions, placement, and visual quality are unchanged.
7. Expanded the existing validation script to check unique titles/descriptions, indexability, one production canonical per page, matching Open Graph metadata, business schema identity/contact/address/social profiles, all seven days of hours, homepage site-name markup, heading order, image alt text/dimensions, robots access, and the exact four sitemap URLs.

No service prices, branding copy, testimonials, location facts, page layout, or favicon assets were changed in this audit. `priceRange`, coordinates, and review/rating schema were not invented. `NailSalon` already inherits Organization properties, so another Organization entity was unnecessary.

## Verified findings

| Area | Result |
| --- | --- |
| Live public pages | Home, Services, Gallery, and Visit return HTTP 200. No `X-Robots-Tag` header or accidental meta `noindex` was found. |
| Canonicals | Every page points to its corresponding `https://utopiannailsstudio.com/` URL, including when rendered locally. No old-domain, preview-host, or www canonicals. |
| Robots | Live `robots.txt` returns 200, allows crawling, and references the production sitemap. Pages, CSS, JavaScript, logo, and favicon paths are not blocked. |
| Sitemap | Live sitemap returns 200 and contains only the four production canonicals. The built sitemap also parses as valid XML with the correct namespace and four unique URLs. |
| Missing pages | A deliberately nonexistent live path returns a real 404, rather than a homepage soft 404. |
| Current business facts | Repository metadata uses the supplied Fort Worth address, phone, email, hours, and existing Facebook/Instagram URLs. |
| Historical information | Searched repository source, configuration, documentation, and built output, excluding Git internals and dependencies. Before this report, old domain/location/contact matches occurred only in validation assertions that reject stale content. This report documents the old domain as historical context. No stale facts are presented as current business metadata. |
| Sharing | All pages have matching Open Graph title, description, canonical URL, site name, and the existing 1024 × 1024 brand logo with image dimensions/alt metadata. |
| Semantics | One primary h1 per page; useful navigation/booking anchor text; descriptive photo alt text; corrected service heading order. Existing editorial headings and branding remain intact. |
| Images and resources | Gallery photos are already WebP, approximately 18–89 KB each. All inline content images have correct intrinsic dimensions. The hidden lightbox image is populated only when opened. Local CSS is approximately 34 KB, module JavaScript approximately 3.2 KB, with system fonts and no third-party render-blocking resources. No image recompression or architecture changes were warranted. |
| Favicon | Existing transparent pink UN assets and global size-specific declarations are preserved. All four files are present in the build. At audit time, the live site still referenced `/assets/logo.png`; `/favicon.ico` and `/favicon-48x48.png` returned 404 because the earlier favicon work had not been deployed. |

## Validation completed

- `npm run build`: passed; four production pages generated, no errors.
- `npm run check`: passed, including the expanded SEO checks.
- `git diff --check`: passed; Git reported only Windows line-ending normalization notices.
- Chrome checks at 1280 px and 390 px: all four pages passed canonical/schema parsing, image loading and actual-dimension comparisons, favicon declaration counts, one-h1 checks, and horizontal-overflow checks.
- Browser-computed service heading styles match across h3/h4 at both widths: 18.56 px desktop and 17.28 px mobile, with matching font, line height, and margins.
- Built JSON-LD was checked against Google's documented required LocalBusiness fields and Schema.org's [NailSalon type](https://schema.org/NailSalon). The homepage WebSite name/URL/publisher reference was checked separately.

This is implementation and browser validation, not a Google Rich Results Test certification or a field Core Web Vitals measurement. After deployment, run the [Rich Results Test](https://search.google.com/test/rich-results) for the live homepage/Visit page and Search Console URL Inspection. Google's Rich Results Test does not test site-name selection; use the [Schema Markup Validator](https://validator.schema.org/) for the WebSite entity. Indexing and search presentation remain Google's decisions.

## Deployment and external follow-up

1. Deploy the updated `dist/` output, including the favicon files at its root. Confirm their live responses are 200 before requesting indexing.
2. Configure a Cloudflare permanent redirect for HTTP and www variants to `https://utopiannailsstudio.com`, preserving each path and query string. Both `http://utopiannailsstudio.com/` and `https://www.utopiannailsstudio.com/` returned 200 rather than redirects during this audit. Prefer one rule that sends either variant directly to the final HTTPS root-host URL. This requires Cloudflare zone configuration under the existing static architecture: Workers static-assets `_redirects` explicitly does not support domain-level redirects. See [Cloudflare's redirect documentation](https://developers.cloudflare.com/workers/static-assets/redirects/).
3. With access to **utopiannails.com**, inventory its old URLs and configure permanent redirects to the corresponding current pages. Keep the old domain and HTTPS certificates working while redirects are needed. Avoid sending unrelated old pages indiscriminately to the homepage. If this is a full domain move, verify both properties in Search Console and use its Change of Address process where eligible. The new repository cannot redirect requests arriving at an independently controlled old domain. See [Google's site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).
4. Update the website link and current Fort Worth contact/location information in the official Google Business Profile and any controlled social/directory listings. This requires access to those accounts. If the old domain cannot be controlled, consistent official profiles and new-site metadata can help establish the current website, but cannot force removal or redirection of old results.
5. Review any publicly exposed Workers preview deployments in Cloudflare. Their page canonicals already point to production; restricting preview access or disabling unnecessary preview endpoints requires deployment/account configuration. Do not add a global `noindex` that would affect the production site.

Submit this sitemap in the Search Console property for the current domain:

- https://utopiannailsstudio.com/sitemap.xml

Use URL Inspection to request indexing of these canonical pages after deployment:

- https://utopiannailsstudio.com/
- https://utopiannailsstudio.com/services/
- https://utopiannailsstudio.com/gallery/
- https://utopiannailsstudio.com/visit/
