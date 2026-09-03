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

const expectedUrls = [business.social.facebook, business.social.instagram, links.text, links.call, links.directions];
const directionsDestination = new URL(links.directions).searchParams.get("destination");
assert(directionsDestination === business.address.directionsDestination, "Google Maps directions use the wrong destination");
assert(directionsDestination.startsWith(`${business.name}, `) && directionsDestination.includes(business.address.formatted), "Google Maps directions do not identify Utopian Nails at the full studio address");
for (const expected of expectedUrls) {
  assert(pages.some(({ html }) => html.includes(expected.replaceAll("&", "&amp;"))) || pages.some(({ html }) => html.includes(expected)), `Missing expected URL: ${expected}`);
}

assert(!pages.some(({ html }) => /manage2\.mangoforsalon\.com|book online/i.test(html)), "Inactive online booking option is still present");

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
  assert(html.includes(`<link rel="canonical" href="${business.siteUrl}${pagePaths.get(file)}"`), `${file}: canonical URL is missing`);
  assert(html.includes(business.name), `${file}: current business name is missing`);
  assert(html.includes(business.email), `${file}: current business email is missing`);
  assert(!html.includes("Utopian Nails Spa"), `${file}: stale business name found`);
  assert(!html.includes("https://utopiannails.com"), `${file}: stale website URL found`);
  assert(!html.includes("Utopiannailsxspa@gmail.com"), `${file}: stale business email found`);
  const mapLinks = [...html.matchAll(/href="(https:\/\/www\.google\.com\/maps\/dir\/\?[^\"]+)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
  assert(mapLinks.length > 0 && mapLinks.every((href) => href === links.directions), `${file}: contains an incorrect Google Maps directions link`);
  assert(html.includes('<link rel="icon" href="/assets/logo.png" type="image/png"'), `${file}: replacement logo is not used as the favicon`);
  assert(html.includes('<img src="/assets/logo.png" width="1024" height="1024"'), `${file}: replacement logo dimensions are missing`);

  const jsonLd = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];
  try {
    const parsed = JSON.parse(jsonLd);
    assert(parsed["@type"] === "NailSalon", `${file}: schema type is not NailSalon`);
    assert(parsed.telephone === business.phone.uri, `${file}: schema phone is incorrect`);
    assert(parsed.address?.streetAddress === business.address.street, `${file}: schema street address is incorrect`);
    assert(parsed.containedInPlace?.name === business.locationName, `${file}: schema Phenix Salon Suites location is missing`);
  } catch {
    failures.push(`${file}: structured data is invalid JSON`);
  }

  const assetUrls = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
  for (const assetUrl of assetUrls) {
    const assetPath = path.join(dist, ...assetUrl.split("/").filter(Boolean));
    try { await access(assetPath); } catch { failures.push(`${file}: missing local asset ${assetUrl}`); }
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
assert(sitemap.includes(`${business.siteUrl}/`) && !sitemap.includes("https://utopiannails.com/"), "sitemap.xml contains a stale website URL");

if (failures.length) {
  console.error(`Validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${pages.length} pages, business links, structured data, local assets, and the complete service menu.`);
}
