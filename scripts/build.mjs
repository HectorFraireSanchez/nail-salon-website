import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { homePage, servicesPage, galleryPage, visitPage } from "../src/site.mjs";
import { galleryImages } from "../src/data/gallery.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

await mkdir(path.join(dist, "assets", "gallery"), { recursive: true });
await rm(path.join(dist, "favicon.svg"), { force: true });

async function copyIfChanged(source, destination) {
  const sourceContent = await readFile(source);
  try {
    const existingContent = await readFile(destination);
    if (sourceContent.equals(existingContent)) return;
  } catch (error) {
    if (error?.code === "EPERM") {
      console.warn(`Skipped locked asset already present in build: ${path.basename(destination)}`);
      return;
    }
    // The destination does not exist yet.
  }
  await writeFile(destination, sourceContent);
}

const gallerySource = path.join(root, "gallery");
const galleryFiles = galleryImages.map((image) => image.file);

await Promise.all([
  copyIfChanged(path.join(root, "logo.png"), path.join(dist, "assets", "logo.png")),
  copyIfChanged(path.join(root, "src", "public", "styles.css"), path.join(dist, "assets", "styles.css")),
  copyIfChanged(path.join(root, "src", "public", "app.js"), path.join(dist, "assets", "app.js")),
  ...galleryFiles.map((file) => copyIfChanged(path.join(gallerySource, file), path.join(dist, "assets", "gallery", file))),
]);

const pages = [
  ["index.html", homePage()],
  [path.join("services", "index.html"), servicesPage()],
  [path.join("gallery", "index.html"), galleryPage()],
  [path.join("visit", "index.html"), visitPage()],
];

for (const [relativePath, html] of pages) {
  const outputPath = path.join(dist, relativePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, "utf8");
}

await writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: https://utopiannails.com/sitemap.xml\n`, "utf8");
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://utopiannails.com/</loc><priority>1.0</priority></url>
  <url><loc>https://utopiannails.com/services/</loc><priority>0.9</priority></url>
  <url><loc>https://utopiannails.com/gallery/</loc><priority>0.8</priority></url>
  <url><loc>https://utopiannails.com/visit/</loc><priority>0.8</priority></url>
</urlset>
`, "utf8");

console.log(`Built ${pages.length} pages in ${dist}`);
