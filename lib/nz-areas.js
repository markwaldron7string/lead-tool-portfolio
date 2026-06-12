// lib/nz-areas.js
// Primary NZ scrape / map cities with coordinates and regional grouping.

export const NZ_AREAS = {
  // ── Auckland ────────────────────────────────────────────────────────────────
  Auckland: {
    lat: -36.8485, lng: 174.7633, region: "Auckland",
    bounds: { west: 174.2557, south: -37.4411, east: 175.2913, north: -36.4235 },
  },
  // ── Northland ───────────────────────────────────────────────────────────────
  Whangarei: {
    lat: -35.7275, lng: 174.3238, region: "Northland",
    bounds: { west: 174.1000, south: -35.9200, east: 174.5500, north: -35.5200 },
  },
  // ── Waikato ─────────────────────────────────────────────────────────────────
  Hamilton: {
    lat: -37.7870, lng: 175.2793, region: "Waikato",
    bounds: { west: 174.9059, south: -38.0576, east: 175.5442, north: -37.5434 },
  },
  Taupo: {
    lat: -38.6857, lng: 176.0702, region: "Waikato",
    bounds: { west: 175.8800, south: -38.9000, east: 176.3200, north: -38.4700 },
  },
  // ── Bay of Plenty ───────────────────────────────────────────────────────────
  Tauranga: {
    lat: -37.6878, lng: 176.1651, region: "Bay of Plenty",
    bounds: { west: 175.8445, south: -38.0268, east: 176.4149, north: -37.6147 },
  },
  Rotorua: {
    lat: -38.1368, lng: 176.2497, region: "Bay of Plenty",
    bounds: { west: 175.9817, south: -38.3077, east: 176.6036, north: -37.9370 },
  },
  // ── Gisborne ────────────────────────────────────────────────────────────────
  Gisborne: {
    lat: -38.6623, lng: 178.0176, region: "Gisborne",
    bounds: { west: 177.8300, south: -38.8500, east: 178.2200, north: -38.4500 },
  },
  // ── Hawke's Bay ─────────────────────────────────────────────────────────────
  Napier: {
    lat: -39.4928, lng: 176.9120, region: "Hawke's Bay",
    bounds: { west: 176.7200, south: -39.7200, east: 177.1100, north: -39.3000 },
  },
  Hastings: {
    lat: -39.6371, lng: 176.8449, region: "Hawke's Bay",
    bounds: { west: 176.6400, south: -39.8600, east: 177.0500, north: -39.4400 },
  },
  // ── Taranaki ────────────────────────────────────────────────────────────────
  "New Plymouth": {
    lat: -39.0556, lng: 174.0752, region: "Taranaki",
    bounds: { west: 173.8641, south: -39.2560, east: 174.4754, north: -38.9526 },
  },
  // ── Manawatu-Wanganui ───────────────────────────────────────────────────────
  "Palmerston North": {
    lat: -40.3523, lng: 175.6082, region: "Manawatu-Wanganui",
    bounds: { west: 175.3588, south: -40.5629, east: 175.9170, north: -40.1235 },
  },
  Whanganui: {
    lat: -39.9301, lng: 175.0479, region: "Manawatu-Wanganui",
    bounds: { west: 174.8300, south: -40.1300, east: 175.2500, north: -39.7300 },
  },
  // ── Wellington ──────────────────────────────────────────────────────────────
  Wellington: {
    lat: -41.2865, lng: 174.7762, region: "Wellington",
    bounds: { west: 174.6550, south: -41.4228, east: 175.4109, north: -40.9220 },
  },
  "Lower Hutt": {
    lat: -41.2127, lng: 174.8994, region: "Wellington",
    bounds: { west: 174.7200, south: -41.3600, east: 175.0700, north: -41.1000 },
  },
  "Upper Hutt": {
    lat: -41.1244, lng: 175.0547, region: "Wellington",
    bounds: { west: 174.9100, south: -41.2600, east: 175.2100, north: -41.0000 },
  },
  Porirua: {
    lat: -41.1339, lng: 174.8474, region: "Wellington",
    bounds: { west: 174.7100, south: -41.2600, east: 175.0000, north: -40.9900 },
  },
  "Kapiti Coast": {
    lat: -40.8949, lng: 175.0186, region: "Wellington",
    bounds: { west: 174.8200, south: -41.0300, east: 175.2200, north: -40.5500 },
  },
  Masterton: {
    lat: -40.9510, lng: 175.6570, region: "Wairarapa",
    bounds: { west: 175.4200, south: -41.1200, east: 175.9000, north: -40.7600 },
  },
  // ── Nelson / Tasman ─────────────────────────────────────────────────────────
  Nelson: {
    lat: -41.2706, lng: 173.2840, region: "Nelson",
    bounds: { west: 172.8658, south: -41.6092, east: 173.5987, north: -41.0516 },
  },
  // ── Marlborough ─────────────────────────────────────────────────────────────
  Blenheim: {
    lat: -41.5135, lng: 173.9612, region: "Marlborough",
    bounds: { west: 173.7200, south: -41.7100, east: 174.2200, north: -41.3100 },
  },
  // ── West Coast ──────────────────────────────────────────────────────────────
  Greymouth: {
    lat: -42.4505, lng: 171.2108, region: "West Coast",
    bounds: { west: 171.0200, south: -42.6300, east: 171.4300, north: -42.2700 },
  },
  // ── Canterbury ──────────────────────────────────────────────────────────────
  Christchurch: {
    lat: -43.5321, lng: 172.6362, region: "Canterbury",
    bounds: { west: 172.0152, south: -43.8389, east: 172.8079, north: -43.1275 },
  },
  Ashburton: {
    lat: -43.8999, lng: 171.7297, region: "Canterbury",
    bounds: { west: 171.5300, south: -44.1000, east: 171.9300, north: -43.7000 },
  },
  Timaru: {
    lat: -44.3981, lng: 171.2553, region: "Canterbury",
    bounds: { west: 171.0500, south: -44.6200, east: 171.5200, north: -44.1500 },
  },
  // ── Otago ───────────────────────────────────────────────────────────────────
  Queenstown: {
    lat: -45.0312, lng: 168.6626, region: "Otago",
    bounds: { west: 168.3200, south: -45.2600, east: 169.0400, north: -44.8000 },
  },
  Wanaka: {
    lat: -44.7020, lng: 169.1319, region: "Otago",
    bounds: { west: 168.9200, south: -44.9100, east: 169.4300, north: -44.5000 },
  },
  Dunedin: {
    lat: -45.8788, lng: 170.5028, region: "Otago",
    bounds: { west: 170.0005, south: -46.1154, east: 170.7509, north: -45.5092 },
  },
  // ── Southland ───────────────────────────────────────────────────────────────
  Invercargill: {
    lat: -46.4132, lng: 168.3538, region: "Southland",
    bounds: { west: 168.1100, south: -46.6200, east: 168.6200, north: -46.2100 },
  },
};

export const NZ_AREA_GROUPS = [
  {
    label: "Auckland",
    areas: ["Auckland"],
  },
  {
    label: "Northland",
    areas: ["Whangarei"],
  },
  {
    label: "Waikato / Bay of Plenty",
    areas: ["Hamilton", "Taupo", "Tauranga", "Rotorua"],
  },
  {
    label: "East Coast",
    areas: ["Gisborne", "Napier", "Hastings"],
  },
  {
    label: "Taranaki",
    areas: ["New Plymouth"],
  },
  {
    label: "Manawatu-Wanganui",
    areas: ["Palmerston North", "Whanganui"],
  },
  {
    label: "Wellington / Wairarapa",
    areas: ["Kapiti Coast", "Porirua", "Lower Hutt", "Upper Hutt", "Wellington", "Masterton"],
  },
  {
    label: "Top of South",
    areas: ["Nelson", "Blenheim"],
  },
  {
    label: "Canterbury / West Coast",
    areas: ["Greymouth", "Christchurch", "Ashburton", "Timaru"],
  },
  {
    label: "Otago",
    areas: ["Queenstown", "Wanaka", "Dunedin"],
  },
  {
    label: "Southland",
    areas: ["Invercargill"],
  },
];

export const NZ_AREA_NAMES = NZ_AREA_GROUPS.flatMap((g) => g.areas);

export const NZ_REGION_NAMES = [...new Set(Object.values(NZ_AREAS).map((a) => a.region))].sort();

const REGION_ALIASES = {
  Auckland: "Auckland",
  Northland: "Northland",
  Waikato: "Waikato",
  "Bay of Plenty": "Bay of Plenty",
  Gisborne: "Gisborne",
  "Hawke's Bay": "Hawke's Bay",
  "Hawkes Bay": "Hawke's Bay",
  Taranaki: "Taranaki",
  "Manawatu-Wanganui": "Manawatu-Wanganui",
  "Manawatu-Whanganui": "Manawatu-Wanganui",
  Wellington: "Wellington",
  Wairarapa: "Wairarapa",
  Nelson: "Nelson",
  Tasman: "Nelson",
  Marlborough: "Marlborough",
  "West Coast": "West Coast",
  Canterbury: "Canterbury",
  Otago: "Otago",
  Southland: "Southland",
  "North Island": "North Island",
  "South Island": "South Island",
};

export function normaliseRegion(raw) {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  return REGION_ALIASES[trimmed] || trimmed;
}

export function getAreaGroupsForRegion(regionName) {
  if (!regionName) return NZ_AREA_GROUPS;
  const region = normaliseRegion(regionName);
  return NZ_AREA_GROUPS
    .map((group) => ({
      ...group,
      areas: group.areas.filter((area) => NZ_AREAS[area]?.region === region),
    }))
    .filter((group) => group.areas.length > 0);
}

export function getAreasForRegion(regionName) {
  if (!regionName) return NZ_AREA_NAMES;
  const region = normaliseRegion(regionName);
  return NZ_AREA_NAMES.filter((area) => NZ_AREAS[area]?.region === region);
}

// Map common lead city strings to our canonical scrape areas.
const CITY_ALIASES = {
  // Auckland
  "auckland city": "Auckland",
  "auckland": "Auckland",
  "north shore": "Auckland",
  "manukau": "Auckland",
  "waitakere": "Auckland",
  "henderson": "Auckland",
  "pukekohe": "Auckland",
  // Northland
  "whangarei": "Whangarei",
  "kerikeri": "Whangarei",
  "northland": "Whangarei",
  // Waikato
  "hamilton": "Hamilton",
  "taupo": "Taupo",
  "lake taupo": "Taupo",
  // Bay of Plenty
  "tauranga": "Tauranga",
  "mount maunganui": "Tauranga",
  "papamoa": "Tauranga",
  "te puke": "Tauranga",
  "rotorua": "Rotorua",
  // Gisborne
  "gisborne": "Gisborne",
  // Hawke's Bay
  "napier": "Napier",
  "hastings": "Hastings",
  "havelock north": "Hastings",
  "hawke's bay": "Napier",
  "hawkes bay": "Napier",
  // Taranaki
  "new plymouth": "New Plymouth",
  "taranaki": "New Plymouth",
  // Manawatu-Wanganui
  "palmerston north": "Palmerston North",
  "whanganui": "Whanganui",
  "wanganui": "Whanganui",
  // Wellington
  "wellington": "Wellington",
  "lower hutt": "Lower Hutt",
  "hutt city": "Lower Hutt",
  "hutt valley": "Lower Hutt",
  "upper hutt": "Upper Hutt",
  "porirua": "Porirua",
  "kapiti": "Kapiti Coast",
  "kapiti coast": "Kapiti Coast",
  "paraparaumu": "Kapiti Coast",
  "waikanae": "Kapiti Coast",
  // Wairarapa
  "masterton": "Masterton",
  "wairarapa": "Masterton",
  "carterton": "Masterton",
  "greytown": "Masterton",
  // Nelson
  "nelson": "Nelson",
  "richmond": "Nelson",
  // Marlborough
  "blenheim": "Blenheim",
  "marlborough": "Blenheim",
  "picton": "Blenheim",
  // West Coast
  "greymouth": "Greymouth",
  "west coast": "Greymouth",
  "hokitika": "Greymouth",
  // Canterbury
  "christchurch": "Christchurch",
  "ashburton": "Ashburton",
  "timaru": "Timaru",
  "rolleston": "Christchurch",
  "rangiora": "Christchurch",
  "selwyn": "Christchurch",
  // Otago
  "queenstown": "Queenstown",
  "arrowtown": "Queenstown",
  "frankton": "Queenstown",
  "wanaka": "Wanaka",
  "dunedin": "Dunedin",
  "mosgiel": "Dunedin",
  // Southland
  "invercargill": "Invercargill",
  "southland": "Invercargill",
  "gore": "Invercargill",
};

export function cityToArea(city) {
  if (!city) return null;
  const key = String(city).trim().toLowerCase();
  if (CITY_ALIASES[key]) return CITY_ALIASES[key];
  for (const area of NZ_AREA_NAMES) {
    if (key.includes(area.toLowerCase()) || area.toLowerCase().includes(key)) return area;
  }
  return null;
}
