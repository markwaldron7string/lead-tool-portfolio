import { writeFileSync } from "fs";

// ~3m generalisation - visually aligned with basemap coastlines without the 97MB full dataset
const ABS_URL =
  "https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/SA4/MapServer/0/query" +
  "?where=1%3D1&outFields=sa4_code_2021,sa4_name_2021&maxAllowableOffset=0.00003&outSR=4326&f=geojson&returnGeometry=true";

const FALLBACK_URL =
  "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.min.geojson";

async function fetchWithTimeout(url, ms = 30000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function main() {
  let data;

  console.log("Fetching SA4 boundaries from ABS API...");
  try {
    const res = await fetchWithTimeout(ABS_URL, 30000);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
    if (!data.features || data.features.length === 0) throw new Error("Empty features");
    console.log(`  Got ${data.features.length} SA4 features from ABS.`);
  } catch (e) {
    console.warn(`  ABS API failed: ${e.message}`);
    console.log("Falling back to state boundaries GeoJSON...");
    const res = await fetchWithTimeout(FALLBACK_URL, 20000);
    if (!res.ok) throw new Error(`Fallback fetch HTTP ${res.status}`);
    data = await res.json();
    console.log(`  Got ${data.features?.length ?? 0} features from fallback.`);
  }

  const path = "public/au-sa4.geojson";
  writeFileSync(path, JSON.stringify(data));
  console.log(`Saved to ${path}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
