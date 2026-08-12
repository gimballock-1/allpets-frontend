import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Static-map geometry (8.10, req §6.3) — Web-Mercator math for rendering the
 * committed OpenStreetMap tile grid in public/images/map/ with the clinic's geo
 * point centered. The tiles are fetched ONCE by scripts/fetch-map-tiles.mjs and
 * committed, so a page view makes no third-party request and ships no Maps SDK.
 *
 * MAP_ZOOM / MAP_GRID must stay in sync with that script. Fail-fast contract
 * (matching the 8.1 loader): if content/site.ts `geo` moves outside the
 * committed grid, the build throws with the re-fetch command instead of
 * shipping a map full of broken tiles.
 */
export const MAP_ZOOM = 15;
export const MAP_GRID = 3; // 3×3 tiles centered on the tile containing the point
export const TILE_SIZE = 256;

export type MapTile = {
  /** Pixel offset of this tile inside the canvas. */
  left: number;
  top: number;
  /** Public URL of the committed tile asset. */
  src: string;
};

export type StaticMapGeometry = {
  tiles: MapTile[];
  /** The geo point's pixel position inside the canvas (where the pin goes). */
  pointX: number;
  pointY: number;
  /** Square canvas edge in px (MAP_GRID × TILE_SIZE). */
  canvasSize: number;
};

export function staticMapGeometry(lat: number, lng: number): StaticMapGeometry {
  // Standard XYZ tile scheme: geo point → fractional tile coordinates.
  const n = 2 ** MAP_ZOOM;
  const xf = ((lng + 180) / 360) * n;
  const yf = ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * n;

  const half = Math.floor(MAP_GRID / 2);
  const originX = Math.floor(xf) - half;
  const originY = Math.floor(yf) - half;

  const tiles: MapTile[] = [];
  for (let dy = 0; dy < MAP_GRID; dy++) {
    for (let dx = 0; dx < MAP_GRID; dx++) {
      const rel = `images/map/${MAP_ZOOM}-${originX + dx}-${originY + dy}.png`;
      if (!fs.existsSync(path.join(process.cwd(), "public", rel))) {
        throw new Error(
          `StaticMap: missing tile public/${rel}. The content geo point moved off the ` +
            `committed tile grid — run \`node scripts/fetch-map-tiles.mjs ${lat} ${lng}\` ` +
            `and commit the new tiles.`,
        );
      }
      tiles.push({ left: dx * TILE_SIZE, top: dy * TILE_SIZE, src: `/${rel}` });
    }
  }

  return {
    tiles,
    pointX: Math.round((xf - originX) * TILE_SIZE),
    pointY: Math.round((yf - originY) * TILE_SIZE),
    canvasSize: MAP_GRID * TILE_SIZE,
  };
}
