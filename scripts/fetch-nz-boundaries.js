import { writeFileSync } from "fs";
import { NZ_AREA_NAMES } from "../lib/nz-areas.js";

const ARCGIS_URL =
  "https://services2.arcgis.com/vKb0s8tBIA3bdocZ/arcgis/rest/services/Functional_Urban_Areas_2026/FeatureServer/0/query";

// ~220 m generalisation — visually clean at map zoom levels, similar intent to AU SA4 fetch
const MAX_OFFSET = 0.002;

const CITY_FUA_NAMES = {
  Auckland: "Auckland",
  Wellington: "Wellington",
  Christchurch: "Christchurch",
  Hamilton: "Hamilton",
  Tauranga: "Tauranga",
  Dunedin: "Dunedin",
  "Palmerston North": "Palmerston North",
  Nelson: "Nelson",
  Rotorua: "Rotorua",
  "New Plymouth": "New Plymouth",
};

function coordsFromGeometry(geometry, fn) {
  if (!geometry) return;
  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach((ring) => ring.forEach(fn));
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((poly) => poly.forEach((ring) => ring.forEach(fn)));
  }
}

function boundsForGeometry(geometry) {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  coordsFromGeometry(geometry, ([lng, lat]) => {
    west = Math.min(west, lng);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    north = Math.max(north, lat);
  });
  return { west, south, east, north };
}

function mergeBounds(a, b) {
  return {
    west: Math.min(a.west, b.west),
    south: Math.min(a.south, b.south),
    east: Math.max(a.east, b.east),
    north: Math.max(a.north, b.north),
  };
}

async function fetchFuaFeatures() {
  const names = Object.values(CITY_FUA_NAMES)
    .map((n) => `'${n.replace(/'/g, "''")}'`)
    .join(",");
  const params = new URLSearchParams({
    where: `FUA2026_V1_00_NAME IN (${names})`,
    outFields: "FUA2026_V1_00,FUA2026_V1_00_NAME,OBJECTID",
    f: "geojson",
    outSR: "4326",
    returnGeometry: "true",
    maxAllowableOffset: String(MAX_OFFSET),
  });

  const res = await fetch(`${ARCGIS_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`ArcGIS HTTP ${res.status}`);
  const data = await res.json();
  if (!data.features?.length) throw new Error("No FUA features returned");
  return data.features;
}

async function main() {
  console.log("Fetching NZ Functional Urban Area boundaries from Stats NZ...");
  const rawFeatures = await fetchFuaFeatures();
  console.log(`  Got ${rawFeatures.length} polygon parts.`);

  const grouped = Object.fromEntries(NZ_AREA_NAMES.map((name) => [name, []]));
  for (const feature of rawFeatures) {
    const fuaName = feature.properties?.FUA2026_V1_00_NAME;
    const areaName = Object.entries(CITY_FUA_NAMES).find(([, v]) => v === fuaName)?.[0];
    if (areaName) grouped[areaName].push(feature);
  }

  const mapping = {};
  const outFeatures = [];
  let code = 1;

  for (const areaName of NZ_AREA_NAMES) {
    const parts = grouped[areaName];
    if (!parts.length) throw new Error(`Missing FUA geometry for ${areaName}`);
    mapping[areaName] = [];
    for (const part of parts) {
      const areaCode = String(code++);
      mapping[areaName].push(areaCode);
      outFeatures.push({
        type: "Feature",
        properties: {
          area_code: areaCode,
          area_name: areaName,
          fua_code: part.properties.FUA2026_V1_00,
          fua_name: part.properties.FUA2026_V1_00_NAME,
        },
        geometry: part.geometry,
      });
    }
  }

  const areaBounds = {};
  for (const areaName of NZ_AREA_NAMES) {
    const codes = mapping[areaName];
    const features = outFeatures.filter((f) => codes.includes(f.properties.area_code));
    areaBounds[areaName] = features.reduce(
      (acc, f) => mergeBounds(acc, boundsForGeometry(f.geometry)),
      { west: Infinity, south: Infinity, east: -Infinity, north: -Infinity },
    );
  }

  const geojson = { type: "FeatureCollection", features: outFeatures };
  writeFileSync("public/nz-areas.geojson", JSON.stringify(geojson));
  writeFileSync("public/nz-area-mapping.json", JSON.stringify(mapping, null, 2));

  console.log(`Saved public/nz-areas.geojson (${outFeatures.length} features)`);
  console.log("Saved public/nz-area-mapping.json");
  console.log("\nComputed bounds (copy into lib/nz-areas.js if needed):");
  for (const [name, b] of Object.entries(areaBounds)) {
    console.log(
      `  ${name}: { west: ${b.west.toFixed(4)}, south: ${b.south.toFixed(4)}, east: ${b.east.toFixed(4)}, north: ${b.north.toFixed(4)} },`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
