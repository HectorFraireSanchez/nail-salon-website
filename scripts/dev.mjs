import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { networkInterfaces } from "node:os";

const root = resolve(process.argv[2] || "dist");
if (!existsSync(root)) {
  const build = spawn(process.execPath, ["scripts/build.mjs"], { stdio: "inherit", shell: false });
  await new Promise((done, reject) => build.on("exit", (code) => code === 0 ? done() : reject(new Error("Build failed"))));
}

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain" };
const server = createServer((request, response) => {
  const cleanPath = decodeURIComponent((request.url || "/").split("?")[0]);
  let filePath = join(root, cleanPath);
  if (cleanPath.endsWith("/")) filePath = join(filePath, "index.html");
  if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");
  if (!existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": types[extname(filePath)] || "application/octet-stream", "Cache-Control": "no-cache" });
  createReadStream(filePath).pipe(response);
});

const requestedPort = Number(process.env.PORT || 4173);
let port = requestedPort;
const host = process.env.DEV_HOST || "0.0.0.0";

function localIpv4Addresses() {
  return Object.values(networkInterfaces())
    .flatMap((entries) => entries ?? [])
    .filter((entry) => entry.family === "IPv4" && !entry.internal)
    .map((entry) => entry.address);
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && !process.env.PORT && port < requestedPort + 10) {
    const occupiedPort = port;
    port += 1;
    console.warn(`Port ${occupiedPort} is already in use; trying ${port} instead.`);
    server.listen(port, host);
    return;
  }

  console.error(error.code === "EADDRINUSE"
    ? `Port ${port} is already in use. Choose another value for PORT.`
    : error);
  process.exitCode = 1;
});

server.on("listening", () => {
  console.log("\nUtopian Nails Spa preview is ready:");
  console.log(`  Computer: http://localhost:${port}`);

  const networkAddresses = localIpv4Addresses();
  if (networkAddresses.length) {
    for (const address of networkAddresses) console.log(`  Phone:    http://${address}:${port}`);
  } else {
    console.log("  Phone:    No active local IPv4 network was detected.");
  }

  console.log("\nKeep this terminal open while testing. Press Ctrl+C to stop.\n");
});

server.listen(port, host);
