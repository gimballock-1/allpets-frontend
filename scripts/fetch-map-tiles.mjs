/**
 * One-time fetcher for the Contact page's static map tiles (8.10, req §6.3).
 *
 * Downloads the 3×3 OpenStreetMap raster tiles around the clinic's geo point
 * into public/images/map/ so the map renders as committed static images —
 * no Maps JS SDK, no API key, no third-party request at page view. Re-run
 * (and re-commit) whenever content/site.ts `geo` changes (Epic 18 confirms
 * the real address):
 *
 *   node scripts/fetch-map-tiles.mjs <lat> <lng>
 *
 * The grid geometry here must match src/lib/staticMap.ts (MAP_ZOOM/MAP_GRID);
 * the StaticMap component fails the render if a tile it needs is missing.
 * Tiles are © OpenStreetMap contributors (ODbL) — the page shows attribution.
 */
import fs from "node:fs";
import path from "node:path";

const ZOOM = 15;
const GRID = 3; // 3×3 tiles centered on the tile containing the point

const lat = Number(process.argv[2] ?? "35.2226");
const lng = Number(process.argv[3] ?? "-97.4395");
if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
  console.error("usage: node scripts/fetch-map-tiles.mjs <lat> <lng>");
  process.exit(1);
}

// Web-Mercator point → fractional tile coordinates (the standard XYZ scheme).
const n = 2 ** ZOOM;
const xf = ((lng + 180) / 360) * n;
const latRad = (lat * Math.PI) / 180;
const yf = ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n;

const cx = Math.floor(xf);
const cy = Math.floor(yf);
const half = Math.floor(GRID / 2);

const outDir = path.join(process.cwd(), "public", "images", "map");
fs.mkdirSync(outDir, { recursive: true });

for (let dx = -half; dx <= half; dx++) {
  for (let dy = -half; dy <= half; dy++) {
    const x = cx + dx;
    const y = cy + dy;
    const url = `https://tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`;
    const file = path.join(outDir, `${ZOOM}-${x}-${y}.png`);
    const res = await fetch(url, {
      // OSM tile-usage policy requires an identifying User-Agent.
      headers: {
        "user-agent":
          "allpets-frontend static-map fetch (one-time build asset; hello@allpets.skpodduturi.dev)",
      },
    });
    if (!res.ok) {
      console.error(`FAILED ${url} → HTTP ${res.status}`);
      process.exit(1);
    }
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    console.log(`fetched ${path.relative(process.cwd(), file)}`);
  }
}

console.log(
  `done — center tile ${ZOOM}/${cx}/${cy}, point at fractional (${xf.toFixed(3)}, ${yf.toFixed(3)})`,
);
