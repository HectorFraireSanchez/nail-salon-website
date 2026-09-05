import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { business, links } from "../src/data/business.mjs";
import { serviceCategories } from "../src/data/services.mjs";
import { homeGalleryFiles } from "../src/data/gallery.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const pageFiles = ["index.html", "services/index.html", "gallery/index.html", "visit/index.html"];
const pagePaths = new Map([
  ["index.html", "/"],
  ["services/index.html", "/services/"],
  ["gallery/index.html", "/gallery/"],
  ["visit/index.html", "/visit/"],
]);
const pages = await Promise.all(pageFiles.map(async (file) => ({ file, html: await readFile(path.join(dist, file), "utf8") })));
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const expectedUrls = [business.social.facebook, business.social.instagram, links.booking, links.text, links.call, links.directions];
assert(business.siteUrl === "https://utopiannailsstudio.com", "The canonical host must be the production root domain");
const titles = new Set();
const descriptions = new Set();
const directionsDestination = new URL(links.directions).searchParams.get("destination");
assert(directionsDestination === business.address.directionsDestination, "Google Maps directions use the wrong destination");
assert(directionsDestination.startsWith(`${business.name}, `) && directionsDestination.includes(business.address.formatted), "Google Maps directions do not identify Utopian Nails at the full studio address");
for (const expected of expectedUrls) {
  assert(pages.some(({ html }) => html.includes(expected.replaceAll("&", "&amp;"))) || pages.some(({ html }) => html.includes(expected)), `Missing expected URL: ${expected}`);
}

assert(pages.every(({ html }) => html.includes(`href="${links.booking}"`)), "Square online booking is not available on every page");
assert(pages.every(({ html }) => !html.includes(`href="${links.booking}" target=`)), "Square booking links should open in the same tab");

for (const { file, html } of pages) {
  assert(html.includes(business.address.street), `${file}: current street address is missing`);
  assert(html.includes(business.locationName), `${file}: Phenix Salon Suites location is missing`);
  assert(/small,? (?:welcoming )?nail studio|personal nail studio/i.test(html), `${file}: small nail studio description is missing`);
  assert(!/two-person/i.test(html), `${file}: staffing-specific studio description is still present`);
  assert(!/intimate nail studio/i.test(html), `${file}: old intimate studio description is still present`);
  assert(html.includes(business.phone.display) || file === "gallery/index.html" || file === "services/index.html", `${file}: current phone is missing`);
  assert(!/Hurst|420 Grapevine|6201 Sunset Dr, Suite 104|817-849-5808|817-807-8630/i.test(html), `${file}: stale contact information found`);
  assert((html.match(/<h1\b/g) || []).length === 1, `${file}: expected exactly one h1`);
  assert(/<title>[^<]+<\/title>/.test(html), `${file}: title is missing`);
  assert(/<meta name="description" content="[^"]+"/.test(html), `${file}: meta description is missing`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  assert(!titles.has(title), `${file}: duplicate page title`);
  assert(!descriptions.has(description), `${file}: duplicate meta description`);
  titles.add(title);
  descriptions.add(description);
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  assert(!metaTags.some((tag) => /name="(?:robots|googlebot|googlebot-image)"/i.test(tag) && /content="[^"]*\b(?:noindex|none)\b/i.test(tag)), `${file}: page blocks indexing`);
  assert((html.match(/<link\b[^>]*rel="canonical"/g) ?? []).length === 1, `${file}: expected one canonical declaration`);
  assert(html.includes(`<link rel="canonical" href="${business.siteUrl}${pagePaths.get(file)}"`), `${file}: canonical URL is missing`);
  for (const [property, value] of Object.entries({ "og:title": title, "og:description": description, "og:url": `${business.siteUrl}${pagePaths.get(file)}`, "og:site_name": business.name, "og:image": `${business.siteUrl}/assets/logo.png` })) {
    assert(html.includes(`<meta property="${property}" content="${value}"`), `${file}: incorrect ${property}`);
  }
  assert(html.includes(business.name), `${file}: current business name is missing`);
  assert(html.includes(business.email), `${file}: current business email is missing`);
  assert(!html.includes("Utopian Nails Spa"), `${file}: stale business name found`);
  assert(!html.includes("https://utopiannails.com"), `${file}: stale website URL found`);
  assert(!html.includes("Utopiannailsxspa@gmail.com"), `${file}: stale business email found`);
  const mapLinks = [...html.matchAll(/href="(https:\/\/www\.google\.com\/maps\/dir\/\?[^\"]+)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
  assert(mapLinks.length > 0 && mapLinks.every((href) => href === links.directions), `${file}: contains an incorrect Google Maps directions link`);
  const faviconTags = [...html.matchAll(/<link\b[^>]*rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*>/g)].map(([tag]) => tag);
  const expectedFavicons = [
    ["icon", "/favicon.ico", "16x16 32x32 48x48"],
    ["icon", "/favicon-48x48.png", "48x48"],
    ["icon", "/favicon-192x192.png", "192x192"],
    ["icon", "/favicon-512x512.png", "512x512"],
    ["apple-touch-icon", "/favicon-192x192.png", "192x192"],
  ];
  assert(faviconTags.length === expectedFavicons.length, `${file}: duplicate or unexpected favicon declarations`);
  for (const [rel, href, sizes] of expectedFavicons) {
    assert(faviconTags.filter((tag) => tag.includes(`rel="${rel}"`) && tag.includes(`href="${href}"`) && tag.includes(`sizes="${sizes}"`)).length === 1, `${file}: missing or duplicate ${rel} ${href}`);
    try { await access(path.join(dist, href)); } catch { failures.push(`${file}: missing favicon ${href}`); }
  }
  assert(html.includes('<img src="/assets/logo.png" width="1024" height="1024"'), `${file}: replacement logo dimensions are missing`);

  try {
    const entities = [...html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)].map(([, json]) => JSON.parse(json));
    const salons = entities.filter((entity) => entity["@type"] === "NailSalon");
    assert(salons.length === 1, `${file}: expected one NailSalon entity`);
    const parsed = salons[0];
    assert(parsed["@type"] === "NailSalon", `${file}: schema type is not NailSalon`);
    assert(parsed["@context"] === "https://schema.org" && parsed["@id"] === `${business.siteUrl}/#salon`, `${file}: incorrect business entity identity`);
    assert(parsed.name === business.name && parsed.url === business.siteUrl, `${file}: incorrect schema name or official URL`);
    assert(parsed.email === business.email, `${file}: incorrect schema email`);
    assert(parsed.logo === `${business.siteUrl}/assets/logo.png` && parsed.image === parsed.logo, `${file}: incorrect business logo/image`);
    assert(parsed.description.includes("Fort Worth"), `${file}: schema description does not identify Fort Worth`);
    assert(parsed.telephone === business.phone.uri, `${file}: schema phone is incorrect`);
    assert(parsed.address?.["@type"] === "PostalAddress", `${file}: missing PostalAddress`);
    assert(parsed.address?.streetAddress === business.address.street, `${file}: schema street address is incorrect`);
    assert(parsed.address?.addressLocality === business.address.city && parsed.address?.addressRegion === business.address.state && parsed.address?.postalCode === business.address.postalCode && parsed.address?.addressCountry === business.address.country, `${file}: incorrect schema locality`);
    assert(parsed.containedInPlace?.name === business.locationName, `${file}: schema Phenix Salon Suites location is missing`);
    assert(parsed.containedInPlace?.["@type"] === "Place", `${file}: containing building should not create another business entity`);
    assert(JSON.stringify(parsed.sameAs) === JSON.stringify([business.social.facebook, business.social.instagram]), `${file}: incorrect official social profiles`);
    assert(parsed.openingHoursSpecification?.length === business.hours.length, `${file}: incomplete weekly hours`);
    for (const day of business.hours) {
      const hours = parsed.openingHoursSpecification?.filter((entry) => entry.dayOfWeek === `https://schema.org/${day.day}`) ?? [];
      assert(hours.length === 1 && hours[0]["@type"] === "OpeningHoursSpecification" && hours[0].opens === (day.closed ? "00:00" : day.opens) && hours[0].closes === (day.closed ? "00:00" : day.closes), `${file}: incorrect ${day.day} hours`);
    }
    const websites = entities.filter((entity) => entity["@type"] === "WebSite");
    assert(websites.length === (file === "index.html" ? 1 : 0), `${file}: incorrect WebSite entity count`);
    if (file === "index.html") {
      assert(websites[0]?.name === business.name && websites[0]?.url === `${business.siteUrl}/` && websites[0]?.publisher?.["@id"] === parsed["@id"], "Homepage site name is not connected to the official salon");
    }
  } catch {
    failures.push(`${file}: structured data is invalid JSON`);
  }

  const assetUrls = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
  for (const assetUrl of assetUrls) {
    const assetPath = path.join(dist, ...assetUrl.split("/").filter(Boolean));
    try { await access(assetPath); } catch { failures.push(`${file}: missing local asset ${assetUrl}`); }
  }

  const headingLevels = [...html.matchAll(/<h([1-6])\b/g)].map(([, level]) => Number(level));
  assert(headingLevels.every((level, index) => index === 0 || level <= headingLevels[index - 1] + 1), `${file}: heading hierarchy skips a level`);
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (tag.includes("data-lightbox-image")) continue; // Hidden until a gallery photo is selected.
    assert(/\balt="[^"]+"/.test(tag), `${file}: image is missing useful alt text`);
    assert(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `${file}: image is missing intrinsic dimensions`);
  }
}

const servicesHtml = pages.find(({ file }) => file === "services/index.html").html;
const homeHtml = pages.find(({ file }) => file === "index.html").html;
const galleryHtml = pages.find(({ file }) => file === "gallery/index.html").html;
const visitHtml = pages.find(({ file }) => file === "visit/index.html").html;
const homePhotoReferences = homeHtml.match(/\/assets\/gallery\//g) ?? [];
const heroDescription = homeHtml.match(/<p class="hero-lede">([^<]+)<\/p>/)?.[1] ?? "";
assert(!/The Utopian feeling|Care in every detail|experience-section/.test(homeHtml), "Homepage still contains the removed experience section");
assert(heroDescription && !heroDescription.includes(business.locationName) && !/Studio 104|6201 Sunset/i.test(heroDescription), "Homepage hero description contains location details");
assert(homePhotoReferences.length === homeGalleryFiles.length, "Homepage contains photography outside its gallery showcase");
for (const file of ["services/index.html", "visit/index.html"]) {
  const html = pages.find((page) => page.file === file).html;
  assert(!html.includes("/assets/gallery/"), `${file}: contains photography outside an approved gallery area`);
}
assert(homeHtml.includes("data-today-hours"), "Homepage is missing the current-day hours prompt");
assert(homeHtml.includes(`data-time-zone="${business.timeZone}"`), "Homepage hours prompt is missing the salon timezone");
for (const [page, html] of [["Homepage", homeHtml], ["Visit page", visitHtml]]) {
  assert(html.includes(business.walkInsMessage), `${page} is missing the walk-ins message`);
}
for (const [page, html] of [["Homepage", homeHtml], ["Gallery page", galleryHtml]]) {
  assert(html.includes(`class="instagram-link`) && html.includes(`href="${business.social.instagram}" target="_blank" rel="noopener noreferrer"`), `${page} is missing its Instagram callout`);
}
assert(visitHtml.includes("visit-mobile-essentials"), "Visit page is missing the mobile essentials block");
assert(visitHtml.includes("data-today-hours"), "Visit page is missing the current-day hours prompt");
for (const entry of business.hours) {
  assert(decodeURIComponent(homeHtml).includes(`\"day\":\"${entry.day}\",\"display\":\"${entry.display}\"`), `Homepage hours prompt is missing ${entry.day}`);
}

for (const category of serviceCategories) {
  assert(servicesHtml.includes(`href="#${category.id}"`), `Services navigation is missing a link to ${category.title}`);
  const groups = category.groups ?? [{ services: category.services }];
  for (const service of groups.flatMap((group) => group.services)) {
    assert(servicesHtml.includes(service.name), `Services page is missing: ${service.name}`);
    assert(servicesHtml.includes(service.price), `Services page is missing price ${service.price} for ${service.name}`);
  }
}

for (const requiredFile of ["robots.txt", "sitemap.xml"]) {
  try { await access(path.join(dist, requiredFile)); } catch { failures.push(`Missing production file: ${requiredFile}`); }
}

const robots = await readFile(path.join(dist, "robots.txt"), "utf8");
const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
assert(robots.includes(`${business.siteUrl}/sitemap.xml`), "robots.txt contains the wrong sitemap URL");
assert(/^User-agent: \*\s+Allow: \/\s/m.test(robots) && !/^Disallow:\s*\S/m.test(robots), "robots.txt blocks public pages or assets");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
const canonicalUrls = [...pagePaths.values()].map((pagePath) => `${business.siteUrl}${pagePath}`);
assert(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "Missing sitemap namespace");
assert(sitemapUrls.length === canonicalUrls.length && new Set(sitemapUrls).size === canonicalUrls.length && sitemapUrls.every((url) => canonicalUrls.includes(url)), "Sitemap must contain exactly the four production canonical URLs");

if (failures.length) {
  console.error(`Validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${pages.length} pages, business links, structured data, local assets, and the complete service menu.`);
}
