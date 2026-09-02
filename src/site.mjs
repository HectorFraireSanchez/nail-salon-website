import { business, links } from "./data/business.mjs";
import { serviceCategories, popularServices, policies } from "./data/services.mjs";
import { galleryImages, homeGalleryFiles, reviews } from "./data/gallery.mjs";

const icon = (name) => {
  const paths = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.74a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/>',
    map: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none"/>',
    facebook: '<path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
  };
  return `<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

const externalAttrs = 'target="_blank" rel="noopener noreferrer"';
const homeGallery = homeGalleryFiles.map((file) => galleryImages.find((image) => image.file === file));
const encodedHours = encodeURIComponent(JSON.stringify(business.hours.map(({ day, display, closed }) => ({ day, display, closed: Boolean(closed) }))));

function todayHoursStatus({ className = "hero-hours", linkToHours = false } = {}) {
  const tag = linkToHours ? "a" : "p";
  const href = linkToHours ? ' href="/visit/"' : "";
  return `<${tag} class="${className}"${href} data-today-hours data-hours="${encodedHours}" data-time-zone="${business.timeZone}">
    ${icon("clock")}<span data-today-hours-label>View today’s salon hours</span>
  </${tag}>`;
}

const pageMeta = {
  home: {
    path: "/",
    title: "Utopian Nails Spa | Nail Salon in Fort Worth, TX",
    description: "Discover manicures, pedicures, builder gel, dip powder, acrylic nails, nail art, and waxing at Utopian Nails Spa in Fort Worth. Text or call to book.",
  },
  services: {
    path: "/services/",
    title: "Nail Services & Prices | Utopian Nails Spa Fort Worth",
    description: "View current prices for pedicures, manicures, builder gel, dip powder, acrylic nails, nail art, waxing, and kids services at Utopian Nails Spa.",
  },
  gallery: {
    path: "/gallery/",
    title: "Nail Art Gallery | Utopian Nails Spa Fort Worth",
    description: "Browse real nail work from Utopian Nails Spa in Fort Worth, including French tips, acrylic designs, colorful nail art, and classic manicures.",
  },
  visit: {
    path: "/visit/",
    title: "Visit Utopian Nails Spa | Hours & Directions in Fort Worth",
    description: "Find Utopian Nails Spa at 6201 Sunset Dr 650, Suite 104 in Fort Worth. View hours, get directions, or call or text to book your appointment.",
  },
};

function structuredData(meta) {
  const openingHoursSpecification = business.hours
    .filter((entry) => !entry.closed)
    .map((entry) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${entry.day}`,
      opens: entry.opens,
      closes: entry.closes,
    }));

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NailSalon",
    "@id": `${business.siteUrl}/#salon`,
    name: business.name,
    url: business.siteUrl,
    mainEntityOfPage: `${business.siteUrl}${meta.path}`,
    image: `${business.siteUrl}/assets/gallery/15.webp`,
    logo: `${business.siteUrl}/assets/logo.png`,
    email: business.email,
    telephone: business.phone.uri,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    openingHoursSpecification,
    sameAs: [business.social.facebook, business.social.instagram],
  }).replace(/</g, "\\u003c");
}

function header(active) {
  const nav = [
    ["home", "/", "Home"],
    ["services", "/services/", "Services"],
    ["gallery", "/gallery/", "Gallery"],
    ["visit", "/visit/", "Visit"],
  ];
  return `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" data-header>
      <div class="header-inner shell">
        <a class="brand" href="/" aria-label="Utopian Nails Spa home">
          <img src="/assets/logo.png" width="430" height="203" alt="Utopian Nails Spa" />
        </a>
        <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav" data-menu-toggle>
          <span></span><span></span><span></span>
        </button>
        <nav class="site-nav" id="site-nav" aria-label="Primary navigation" data-nav>
          <div class="nav-links">
            ${nav.map(([key, href, label]) => `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
          </div>
          <a class="button button-small button-light" href="${links.text}">${icon("message")} Text to book</a>
        </nav>
      </div>
    </header>`;
}

function mobileActions() {
  return `<aside class="mobile-actions" aria-label="Quick booking actions">
    <a href="${links.text}">${icon("message")}<span>Text to book</span></a>
    <a href="${links.call}">${icon("phone")}<span>Call to book</span></a>
  </aside>`;
}

function hoursList(compact = false) {
  return `<dl class="hours-list${compact ? " hours-list-compact" : ""}">${business.hours.map((entry) => `<div><dt>${entry.day}</dt><dd>${entry.display}</dd></div>`).join("")}</dl>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="shell footer-grid">
      <div class="footer-brand">
        <img src="/assets/logo.png" width="430" height="203" alt="Utopian Nails Spa" loading="lazy" />
        <p>Thoughtful nail care, creative finishes, and a little room to unwind in Fort Worth.</p>
        <div class="social-links">
          <a href="${business.social.instagram}" ${externalAttrs} aria-label="Utopian Nails Spa on Instagram">${icon("instagram")}<span>Instagram</span></a>
          <a href="${business.social.facebook}" ${externalAttrs} aria-label="Utopian Nails Spa on Facebook">${icon("facebook")}<span>Facebook</span></a>
        </div>
      </div>
      <div>
        <p class="footer-label">Explore</p>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="/services/">Services & prices</a>
          <a href="/gallery/">Our work</a>
          <a href="/visit/">Hours & location</a>
          <a href="${links.text}">Text to book</a>
        </nav>
      </div>
      <div>
        <p class="footer-label">Visit</p>
        <address>
          <a href="${links.directions}" ${externalAttrs}>${business.address.street}<br />${business.address.city}, ${business.address.state} ${business.address.postalCode}</a>
        </address>
        <a class="footer-contact" href="${links.call}">${business.phone.display}</a>
        <a class="footer-contact footer-email" href="${links.email}">${business.email}</a>
      </div>
    </div>
    <div class="shell footer-bottom"><p>© <span data-year></span> Utopian Nails Spa</p><p>Nail salon in Fort Worth, Texas</p></div>
  </footer>`;
}

function ctaBanner({ eyebrow = "Your next set starts here", title = "Ready for a little time to yourself?", text = "Choose the booking option that works best for you. We’ll take it from there." } = {}) {
  return `<section class="cta-banner section" aria-labelledby="cta-title">
    <div class="shell cta-inner">
      <div><p class="eyebrow">${eyebrow}</p><h2 id="cta-title">${title}</h2><p>${text}</p></div>
      <div class="button-row">
        <a class="button button-light" href="${links.text}">${icon("message")} Text to book</a>
        <a class="button button-outline-light" href="${links.call}">${icon("phone")} Call to book</a>
      </div>
    </div>
  </section>`;
}

function layout(page, body, options = {}) {
  const meta = pageMeta[page];
  const bodyClass = options.bodyClass ? ` class="${options.bodyClass}"` : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}" />
  <link rel="canonical" href="${business.siteUrl}${meta.path}" />
  <meta name="theme-color" content="#241c1a" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Utopian Nails Spa" />
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:url" content="${business.siteUrl}${meta.path}" />
  <meta property="og:image" content="${business.siteUrl}/assets/gallery/11.webp" />
  <meta property="og:image:width" content="680" />
  <meta property="og:image:height" content="510" />
  <meta property="og:image:alt" content="Bright blue nails by Utopian Nails Spa" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/assets/styles.css" />
  <script type="application/ld+json">${structuredData(meta)}</script>
</head>
<body${bodyClass}>
  ${header(page)}
  <main id="main">${body}</main>
  ${footer()}
  ${mobileActions()}
  <script type="module" src="/assets/app.js"></script>
</body>
</html>`;
}

function popularServiceCards() {
  return popularServices.map((service) => `<article class="popular-card">
    <p class="popular-category">${service.category}</p>
    <div class="popular-title"><h3>${service.name}</h3><p class="price">${service.price}</p></div>
    ${service.suffix ? `<p class="price-suffix">${service.suffix}</p>` : ""}
    <p>${service.detail}</p>
  </article>`).join("");
}

function reviewCards() {
  return reviews.map((review) => `<figure class="review-card"><blockquote>“${review.quote}”</blockquote><figcaption>${review.author}</figcaption></figure>`).join("");
}

export function homePage() {
  const galleryMarkup = homeGallery.map((image, index) => `<a class="home-gallery-item home-gallery-item-${index + 1}" href="/gallery/" aria-label="View the full nail gallery">
    <img src="/assets/gallery/${image.file}" width="${image.width}" height="${image.height}" alt="${image.alt}" ${index < 2 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} />
  </a>`).join("");

  const body = `
    <section class="hero">
      <div class="shell hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Nail salon · Fort Worth, Texas</p>
          <h1>A little escape.<br /><em>A beautiful finish.</em></h1>
          <p class="hero-lede">From polished classics to bold nail art, come settle in for thoughtful care and a look that feels like you.</p>
          ${todayHoursStatus({ linkToHours: true })}
          <div class="button-row hero-actions">
            <a class="button button-primary" href="${links.text}">${icon("message")} Text to book</a>
            <a class="button button-secondary" href="${links.call}">${icon("phone")} Call to book</a>
          </div>
          <a class="hero-location" href="${links.directions}" ${externalAttrs}>${icon("map")}<span>${business.address.street}<br />Fort Worth, TX</span></a>
        </div>
        <div class="hero-visual" aria-label="Nail art by Utopian Nails Spa">
          <div class="hero-image-main"><img src="/assets/gallery/15.webp" width="382" height="510" alt="Glossy lavender almond nails" fetchpriority="high" /></div>
          <div class="hero-image-accent"><img src="/assets/gallery/5.webp" width="287" height="510" alt="Detailed floral nail art with gold accents" fetchpriority="high" /></div>
          <p class="hero-note"><span>Made for your mood</span><span aria-hidden="true">✦</span></p>
        </div>
      </div>
    </section>

    <section class="trust-strip" aria-label="Salon services"><div class="shell"><p>Manicures</p><span>✦</span><p>Pedicures</p><span>✦</span><p>Builder Gel</p><span>✦</span><p>Dip & Acrylic</p><span>✦</span><p>Nail Art</p></div></section>

    <section class="section work-preview" aria-labelledby="work-title">
      <div class="shell">
        <div class="section-heading split-heading">
          <div><p class="eyebrow">Fresh from the salon</p><h2 id="work-title">Find your next look.</h2></div>
          <div><p>Color, shape, texture, or something completely your own—bring the inspiration and we’ll make it wearable.</p><a class="text-link" href="/gallery/">Explore the gallery ${icon("arrow")}</a></div>
        </div>
        <div class="home-gallery">${galleryMarkup}</div>
      </div>
    </section>

    <section class="section popular-services" aria-labelledby="popular-title">
      <div class="shell">
        <div class="section-heading centered-heading"><p class="eyebrow">A good place to start</p><h2 id="popular-title">Salon favorites, priced clearly.</h2><p>Explore a few popular choices, then see the complete service menu for every option and add-on.</p></div>
        <div class="popular-grid">${popularServiceCards()}</div>
        <div class="centered-action"><a class="button button-secondary" href="/services/">View all services & prices ${icon("arrow")}</a></div>
      </div>
    </section>

    <section class="section experience-section" aria-labelledby="experience-title">
      <div class="shell experience-grid">
        <div class="experience-images">
          <img class="experience-large" src="/assets/gallery/4.webp" width="382" height="510" alt="Glossy burgundy stiletto nails with diagonal accents" loading="lazy" />
          <img class="experience-small" src="/assets/gallery/10.webp" width="457" height="510" alt="Natural short manicure with pink French tips" loading="lazy" />
        </div>
        <div class="experience-copy">
          <p class="eyebrow">The Utopian feeling</p>
          <h2 id="experience-title">Care in every detail.</h2>
          <p class="large-copy">A salon visit should feel easy from the moment you choose your service to the final coat.</p>
          <div class="benefit-list">
            <div><span>01</span><h3>Options for every mood</h3><p>Soft neutrals, bold color, added length, intricate art, or a clean classic.</p></div>
            <div><span>02</span><h3>Relaxation built in</h3><p>Choose from pedicures with exfoliation, masks, paraffin, and hot stone massage.</p></div>
            <div><span>03</span><h3>Booking made simple</h3><p>Text or call the salon to reserve your appointment.</p></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section reviews-section" aria-labelledby="reviews-title">
      <div class="shell">
        <div class="section-heading split-heading"><div><p class="eyebrow">Kind words</p><h2 id="reviews-title">What guests remember.</h2></div><p>Real comments shared by Utopian Nails Spa customers.</p></div>
        <div class="review-grid">${reviewCards()}</div>
      </div>
    </section>

    <section class="section visit-preview" aria-labelledby="visit-title">
      <div class="shell visit-card">
        <div class="visit-photo"><img src="/assets/gallery/7.webp" width="480" height="510" alt="Bright neon manicure beside a leafy plant" loading="lazy" /></div>
        <div class="visit-details">
          <p class="eyebrow">Come see us</p><h2 id="visit-title">Your chair is waiting.</h2>
          <a class="address-link" href="${links.directions}" ${externalAttrs}>${icon("map")}<span>${business.address.street}<br />${business.address.city}, ${business.address.state} ${business.address.postalCode}</span></a>
          ${hoursList(true)}
          <div class="button-row"><a class="button button-primary" href="${links.directions}" ${externalAttrs}>Get directions ${icon("arrow")}</a><a class="button button-quiet" href="${links.call}">${icon("phone")} Call</a></div>
        </div>
      </div>
    </section>
    ${ctaBanner()}`;
  return layout("home", body);
}

function serviceItem(service) {
  return `<article class="service-item">
    <div class="service-name-row"><h4>${service.name}</h4><p class="price">${service.price}</p></div>
    ${service.description ? `<p class="service-description">${service.description}</p>` : ""}
    ${service.notes?.length ? `<ul class="service-notes" aria-label="Upgrades">${service.notes.map((note) => `<li>${note}</li>`).join("")}</ul>` : ""}
  </article>`;
}

function serviceCategory(category, index) {
  const groups = category.groups ?? [{ title: null, services: category.services }];
  return `<section class="service-category" id="${category.id}" aria-labelledby="${category.id}-title">
    <div class="category-heading">
      <div><p class="eyebrow">${category.eyebrow}</p><h2 id="${category.id}-title">${category.title}</h2><p>${category.intro}</p></div>
      <img src="/assets/gallery/${category.image}" alt="${category.imageAlt}" width="382" height="510" loading="${index === 0 ? "eager" : "lazy"}" />
    </div>
    <div class="service-groups">
      ${groups.map((group) => `<div class="service-group">${group.title ? `<div class="service-group-heading"><h3>${group.title}</h3>${group.description ? `<p>${group.description}</p>` : ""}</div>` : ""}<div class="service-list">${group.services.map(serviceItem).join("")}</div></div>`).join("")}
    </div>
  </section>`;
}

export function servicesPage() {
  const body = `
    <section class="page-hero service-page-hero">
      <div class="shell page-hero-grid">
        <div><p class="eyebrow">Services & prices</p><h1>Choose your kind of <em>care.</em></h1><p>Browse the complete menu—from quick polish changes to spa pedicures and custom enhancements. Prices marked “+” may vary by length or design.</p></div>
        <div class="page-hero-image"><img src="/assets/gallery/6.webp" width="293" height="510" alt="Long sculpted nail set in navy, peach, and chrome" loading="lazy" /></div>
      </div>
    </section>
    <nav class="category-nav" aria-label="Service categories"><div class="shell category-nav-scroll">${serviceCategories.map((category) => `<a href="#${category.id}">${category.navLabel}</a>`).join("")}</div></nav>
    <div class="shell service-menu">${serviceCategories.map(serviceCategory).join("")}</div>
    <section class="section policy-section" id="policies" aria-labelledby="policy-title"><div class="shell policy-grid"><div><p class="eyebrow">Before your visit</p><h2 id="policy-title">Salon policies</h2><p>These guidelines help the team keep appointments comfortable, fair, and on time.</p></div><ol>${policies.map((policy) => `<li>${policy}</li>`).join("")}</ol></div></section>
    ${ctaBanner({ eyebrow: "Found your service?", title: "Let’s get it on the calendar.", text: "Text or call the salon to ask about pricing, discuss a design, and reserve your time." })}`;
  return layout("services", body, { bodyClass: "services-page" });
}

export function galleryPage() {
  const gallery = galleryImages.map((image, index) => `<button class="gallery-tile gallery-tile-${(index % 7) + 1}" type="button" data-lightbox-trigger data-src="/assets/gallery/${image.file}" data-alt="${image.alt}" aria-label="Enlarge: ${image.alt}">
    <img src="/assets/gallery/${image.file}" width="${image.width}" height="${image.height}" alt="${image.alt}" loading="${index < 4 ? "eager" : "lazy"}" ${index < 2 ? 'fetchpriority="high"' : ""} />
  </button>`).join("");
  const body = `
    <section class="page-hero gallery-page-hero"><div class="shell gallery-hero-inner"><div><p class="eyebrow">Our work</p><h1>Details worth a <em>closer look.</em></h1></div><p>From understated French tips to bright color and dimensional art, browse real sets from the Utopian Nails Spa gallery.</p></div></section>
    <section class="gallery-section section" aria-label="Nail art gallery"><div class="shell gallery-grid">${gallery}</div></section>
    <dialog class="lightbox" data-lightbox aria-label="Enlarged gallery image"><button type="button" class="lightbox-close" data-lightbox-close aria-label="Close enlarged image">${icon("close")}</button><button type="button" class="lightbox-nav lightbox-prev" data-lightbox-prev aria-label="Previous image">‹</button><figure><img src="" alt="" data-lightbox-image /><figcaption data-lightbox-caption></figcaption></figure><button type="button" class="lightbox-nav lightbox-next" data-lightbox-next aria-label="Next image">›</button></dialog>
    ${ctaBanner({ eyebrow: "Have a reference photo?", title: "Bring the idea. We’ll talk through the details.", text: "Text the salon to share a look, or call to reserve your appointment." })}`;
  return layout("gallery", body, { bodyClass: "gallery-page" });
}

export function visitPage() {
  const body = `
    <section class="page-hero visit-page-hero"><div class="shell page-hero-grid"><div class="visit-hero-copy"><p class="eyebrow">Visit Utopian Nails Spa</p><h1>Come in, settle down, <em>leave polished.</em></h1><p class="visit-intro">Find us in Fort Worth. Text or call to book, or tap the address for turn-by-turn directions.</p><div class="visit-mobile-essentials"><a class="visit-mobile-address" href="${links.directions}" ${externalAttrs}>${icon("map")}<span>${business.address.street}<br />${business.address.city}, ${business.address.state} ${business.address.postalCode}</span></a>${todayHoursStatus({ className: "visit-today-hours" })}<a class="button button-light" href="${links.directions}" ${externalAttrs}>Get directions ${icon("arrow")}</a></div><div class="button-row visit-desktop-actions"><a class="button button-primary" href="${links.directions}" ${externalAttrs}>${icon("map")} Get directions</a><a class="button button-secondary" href="${links.text}">${icon("message")} Text us</a></div></div><div class="page-hero-image"><img src="/assets/gallery/16.webp" width="287" height="510" alt="Vibrant pink manicure with playful wavy art" loading="lazy" /></div></div></section>
    <section class="section contact-section" aria-label="Visit details"><div class="shell contact-grid">
      <div class="contact-card contact-card-location"><p class="eyebrow">Location</p><h2 id="contact-title">Fort Worth, Texas</h2><address>${business.address.street}<br />${business.address.city}, ${business.address.state} ${business.address.postalCode}</address><a class="text-link" href="${links.directions}" ${externalAttrs}>Open in Google Maps ${icon("arrow")}</a></div>
      <div class="contact-card contact-card-hours"><p class="eyebrow">Weekly hours</p>${hoursList()}</div>
      <div class="contact-card"><p class="eyebrow">Get in touch</p><div class="contact-links"><a href="${links.text}">${icon("message")}<span><small>Text to book</small>${business.phone.display}</span></a><a href="${links.call}">${icon("phone")}<span><small>Call the salon</small>${business.phone.display}</span></a><a href="${links.email}">${icon("mail")}<span><small>Email</small>${business.email}</span></a></div></div>
    </div></section>
    <div class="visit-mobile-image" aria-hidden="true"><img src="/assets/gallery/16.webp" width="287" height="510" alt="" loading="lazy" /></div>
    <section class="section booking-choice" aria-labelledby="booking-choice-title"><div class="shell"><div class="section-heading centered-heading"><p class="eyebrow">Book your way</p><h2 id="booking-choice-title">Two easy ways to reserve.</h2></div><div class="booking-choice-grid"><a href="${links.text}">${icon("message")}<span><strong>Text to book</strong><small>Start a conversation with the salon</small></span>${icon("arrow")}</a><a href="${links.call}">${icon("phone")}<span><strong>Call to book</strong><small>Speak directly with the salon</small></span>${icon("arrow")}</a></div></div></section>
    <section class="section social-section"><div class="shell social-card"><div><p class="eyebrow">Stay inspired</p><h2>Follow along for more nail ideas.</h2></div><div class="button-row"><a class="button button-secondary" href="${business.social.instagram}" ${externalAttrs}>${icon("instagram")} Instagram</a><a class="button button-secondary" href="${business.social.facebook}" ${externalAttrs}>${icon("facebook")} Facebook</a></div></div></section>`;
  return layout("visit", body, { bodyClass: "visit-page" });
}
