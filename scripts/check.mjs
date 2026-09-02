import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { business, links } from "../src/data/business.mjs";
import { serviceCategories } from "../src/data/services.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const pageFiles = ["index.html", "services/index.html", "gallery/index.html", "visit/index.html"];
const pages = await Promise.all(pageFiles.map(async (file) => ({ file, html: await readFile(path.join(dist, file), "utf8") })));
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

const expectedUrls = [business.bookingUrl, business.social.facebook, business.social.instagram, links.text, links.call, links.directions];
for (const expected of expectedUrls) {
  assert(pages.some(({ html }) => html.includes(expected.replaceAll("&", "&amp;"))) || pages.some(({ html }) => html.includes(expected)), `Missing expected URL: ${expected}`);
}

for (const { file, html } of pages) {
  assert(html.includes(business.address.street), `${file}: current street address is missing`);
  assert(html.includes(business.phone.display) || file === "gallery/index.html" || file === "services/index.html", `${file}: current phone is missing`);
  assert(!/Hurst|420 Grapevine|817-849-5808|817-807-8630/i.test(html), `${file}: stale contact information found`);
  assert((html.match(/<h1\b/g) || []).length === 1, `${file}: expected exactly one h1`);
  assert(/<title>[^<]+<\/title>/.test(html), `${file}: title is missing`);
  assert(/<meta name="description" content="[^"]+"/.test(html), `${file}: meta description is missing`);
  assert(/<link rel="canonical" href="https:\/\/utopiannails\.com/.test(html), `${file}: canonical URL is missing`);

  const jsonLd = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];
  try {
    const parsed = JSON.parse(jsonLd);
    assert(parsed["@type"] === "NailSalon", `${file}: schema type is not NailSalon`);
    assert(parsed.telephone === business.phone.uri, `${file}: schema phone is incorrect`);
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
for (const category of serviceCategories) {
  const groups = category.groups ?? [{ services: category.services }];
  for (const service of groups.flatMap((group) => group.services)) {
    assert(servicesHtml.includes(service.name), `Services page is missing: ${service.name}`);
    assert(servicesHtml.includes(service.price), `Services page is missing price ${service.price} for ${service.name}`);
  }
}

for (const requiredFile of ["robots.txt", "sitemap.xml", "favicon.svg"]) {
  try { await access(path.join(dist, requiredFile)); } catch { failures.push(`Missing production file: ${requiredFile}`); }
}

if (failures.length) {
  console.error(`Validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${pages.length} pages, business links, structured data, local assets, and the complete service menu.`);
}
