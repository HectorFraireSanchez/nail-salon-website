# Utopian Nails Spa Website

A mobile-first redesign and rebuild for [Utopian Nails Spa](https://utopiannails.com/), a real local nail salon in Fort Worth, Texas. The site is designed to help prospective guests quickly see the salon’s work, understand services and prices, and take the next step by text, phone, or directions.

## Goals

- Put booking actions within easy reach, especially on mobile
- Make the full service menu and pricing easy to scan
- Use the salon’s own photography as the main trust and conversion asset
- Keep current business information consistent throughout the site
- Provide crawlable, locally relevant content without keyword stuffing
- Keep the implementation fast, reliable, and easy to maintain

## Technology and architecture

The project uses semantic HTML, modern CSS, and a small amount of vanilla JavaScript. A dependency-free Node build script renders four static pages:

- Home
- Services and pricing
- Gallery
- Visit, hours, and contact

Core business information, services, prices, gallery metadata, and testimonials live in structured data modules under `src/data`. Shared templates generate consistent navigation, footer, booking actions, metadata, and structured data.

There is no application backend. Guests reserve appointments by texting or calling the salon.

## Performance, accessibility, and SEO

- Static, crawlable pages with no client-side rendering dependency
- Lightweight local WebP gallery images with explicit dimensions
- Lazy loading for below-the-fold imagery
- Minimal JavaScript and no third-party UI dependencies
- Responsive layouts and persistent mobile booking actions
- Semantic landmarks, skip link, visible focus styles, keyboard-accessible navigation, and an accessible native-dialog lightbox
- Reduced-motion support
- Unique titles and descriptions, canonical URLs, Open Graph metadata, sitemap, robots file, and `NailSalon` structured data
- Consistent current Fort Worth name, address, phone, hours, and social details

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm run dev
```

The terminal prints both the computer URL and one or more phone-ready network URLs.

## Test from a phone on the same network

1. Connect the computer and phone to the same Wi-Fi network. Avoid a guest Wi-Fi network, which may block communication between devices.
2. Run `npm run dev` from the project directory.
3. Keep the terminal open and look for an address labeled `Phone`, such as `http://192.168.1.25:4173`.
4. Open that exact address in Safari or Chrome on the phone. Use `http://`, not `https://`.
5. If Windows asks whether Node.js may communicate through the firewall, allow access on **Private networks**.

The computer must remain awake and the development server must remain running while the phone is connected. If the phone cannot load the site, confirm both devices are on the same non-guest Wi-Fi, temporarily disconnect a VPN, and ensure Node.js is allowed through Windows Defender Firewall on private networks.

If port `4173` is already occupied, the development server automatically tries the next available port and prints the correct URL. Always use the exact `Phone` URL shown in the latest terminal output.

To use a different port in PowerShell:

```powershell
$env:PORT=4174; npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

The production-ready static output is written to `dist/` and can be hosted by any static hosting provider.

## Project structure

```text
gallery/                 Original salon photography
logo.png                 Salon logo
src/
  data/                   Business, service, gallery, and review data
  public/                 CSS, JavaScript, and favicon
  site.mjs                Shared layout and page templates
scripts/
  build.mjs               Static production build
  dev.mjs                 Local preview server
dist/                     Generated production output
business-info.txt         Authoritative current business details
```

To update contact information or hours, edit `src/data/business.mjs`. To change services or prices, edit `src/data/services.mjs`. Gallery ordering and alt text are managed in `src/data/gallery.mjs`.
