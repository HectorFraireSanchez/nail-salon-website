# Utopian Nails

Live production website for Utopian Nails, an operating nail studio in Fort Worth, Texas, used by the business and its customers.

**[Live site: utopiannailsstudio.com](https://utopiannailsstudio.com/)**

## Overview

This project replaces an outdated web presence with a mobile-first website that reflects the business's move to a smaller studio inside Phenix Salon Suites of Camp Bowie. The previous site contained stale contact/location details and a long service menu that needed clearer organization.

Four pages connect browsing to practical next steps: **Home**, **Services & Prices**, **Gallery**, and **Visit**. Customers can compare prices, browse work, find directions, and book through Square Appointments or contact the studio.

## My role

I owned the project from business requirements through production deployment and subsequent iteration. My responsibilities included information architecture, design direction, mobile UX, development direction, implementation review, testing, debugging, and domain/SEO decisions.

I supplied business information and assets, defined booking priorities, reviewed desktop/mobile behavior, and requested targeted revisions. Business feedback shaped the wording so visitors would expect a personal studio inside a larger salon-suites building.

## Key product and engineering decisions

- **Put the selected task near the top.** Shortened mobile page introductions so pricing, photos, or visit details appear earlier. Made service-category links visibly interactive and horizontally scrollable. Kept photography in the two gallery areas to reduce decorative scrolling elsewhere.
- **Match booking to actual operations.** Removed an inactive booking link and prioritized text/call initially. When the business adopted Square, made online booking primary while retaining text and phone support. A compact mobile bar keeps these actions available with space for device safe areas.
- **Keep the architecture proportional.** I specified a preference for static, crawlable pages and external booking, with no custom scheduling backend. Codex selected the implementation within those constraints. Instagram and Google Maps use direct links; the gallery uses a native dialog lightbox without an additional library.
- **Share business data across pages.** Shared modules drive contact details, weekly hours, directions, and structured metadata. Today's hours use the studio's time zone. Content updates remain manual: the business reference file, homepage featured prices, and full service menu must be kept in sync.

## Technical overview

- **Frontend:** semantic HTML, responsive CSS, vanilla JavaScript ES modules, and local WebP images. Includes keyboard controls, visible focus styles, reduced-motion support, and lazy loading.
- **Build:** dependency-free Node.js scripts render shared templates in [src/site.mjs](src/site.mjs) with structured content from [src/data/](src/data/).
- **Hosting and version control:** Cloudflare Workers static assets, configured in [wrangler.jsonc](wrangler.jsonc), with Git and GitHub for source history.

## Production and validation

`npm run build` writes deployable static files to `dist/`, the asset directory configured for Cloudflare. Custom-domain and redirect settings are managed outside this repository.

Every page has a self-referencing HTTPS canonical, unique title/description, Open Graph metadata, and `NailSalon` JSON-LD. The homepage adds `WebSite` markup; the build generates `robots.txt` and a sitemap containing the four production URLs.

`npm run check` runs static regression checks on generated HTML and local assets. Checks evolved alongside business requirements to reject obsolete contact details, require expected booking links, enforce production canonicals, and verify business identity across structured metadata. They also check service names and price strings, heading order, image attributes, and sitemap contents.

Browser interactions and live HTTP responses were checked separately during development. The static checks do not exercise Square booking or guarantee correct service-to-price associations and complete upgrade notes; those require content review.

## Agent-assisted development

I used OpenAI Codex to accelerate implementation, debugging, and validation. I defined requirements and architectural constraints, broke revisions into focused tasks, and reviewed and corrected results. Codex produced the initial code and subsequent changes within those constraints; I retained responsibility for scope, product decisions, review, and deployment.

For example, I requested same-network phone testing and reported an occupied-port startup failure. Codex diagnosed the conflict and updated the preview server to discover local network addresses, print phone URLs, and try another port when the default is occupied.

## Running locally

Requires Node.js 18+ and npm. There are no package dependencies to install.

```bash
npm run build
npm run check
npm run dev
```

Open the printed local URL, or the `Phone` URL from a device on the same network. Re-run `npm run build` after source changes and refresh; the server does not watch files.
