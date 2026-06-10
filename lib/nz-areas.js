// lib/nz-areas.js
// Primary NZ scrape / map cities with coordinates and regional grouping.

export const NZ_AREAS = {
  Auckland: {
    lat: -36.8485, lng: 174.7633, region: "Auckland",
    bounds: { west: 174.2557, south: -37.4411, east: 175.2913, north: -36.4235 },
  },
  Wellington: {
    lat: -41.2865, lng: 174.7762, region: "Wellington",
    bounds: { west: 174.6550, south: -41.4228, east: 175.4109, north: -40.9220 },
  },
  Christchurch: {
    lat: -43.5321, lng: 172.6362, region: "Canterbury",
    bounds: { west: 172.0152, south: -43.8389, east: 172.8079, north: -43.1275 },
  },
  Hamilton: {
    lat: -37.7870, lng: 175.2793, region: "Waikato",
    bounds: { west: 174.9059, south: -38.0576, east: 175.5442, north: -37.5434 },
  },
  Tauranga: {
    lat: -37.6878, lng: 176.1651, region: "Bay of Plenty",
    bounds: { west: 175.8445, south: -38.0268, east: 176.4149, north: -37.6147 },
  },
  Dunedin: {
    lat: -45.8788, lng: 170.5028, region: "Otago",
    bounds: { west: 170.0005, south: -46.1154, east: 170.7509, north: -45.5092 },
  },
  "Palmerston North": {
    lat: -40.3523, lng: 175.6082, region: "Manawatu-Wanganui",
    bounds: { west: 175.3588, south: -40.5629, east: 175.9170, north: -40.1235 },
  },
  Nelson: {
    lat: -41.2706, lng: 173.2840, region: "Nelson",
    bounds: { west: 172.8658, south: -41.6092, east: 173.5987, north: -41.0516 },
  },
  Rotorua: {
    lat: -38.1368, lng: 176.2497, region: "Bay of Plenty",
    bounds: { west: 175.9817, south: -38.3077, east: 176.6036, north: -37.9370 },
  },
  "New Plymouth": {
    lat: -39.0556, lng: 174.0752, region: "Taranaki",
    bounds: { west: 173.8641, south: -39.2560, east: 174.4754, north: -38.9526 },
  },
};

export const NZ_AREA_GROUPS = [
  {
    label: "Auckland",
    areas: ["Auckland"],
  },
  {
    label: "Upper North Island",
    areas: ["Hamilton", "Tauranga", "Rotorua", "New Plymouth"],
  },
  {
    label: "Lower North Island",
    areas: ["Wellington", "Palmerston North"],
  },
  {
    label: "South Island",
    areas: ["Christchurch", "Dunedin", "Nelson"],
  },
];

export const NZ_AREA_NAMES = NZ_AREA_GROUPS.flatMap((g) => g.areas);

export const NZ_REGION_NAMES = [...new Set(Object.values(NZ_AREAS).map((a) => a.region))].sort();

const REGION_ALIASES = {
  Auckland: "Auckland",
  Wellington: "Wellington",
  Canterbury: "Canterbury",
  Waikato: "Waikato",
  "Bay of Plenty": "Bay of Plenty",
  Otago: "Otago",
  "Manawatu-Wanganui": "Manawatu-Wanganui",
  Nelson: "Nelson",
  Taranaki: "Taranaki",
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
  "auckland city": "Auckland",
  "auckland": "Auckland",
  "wellington": "Wellington",
  "christchurch": "Christchurch",
  "hamilton": "Hamilton",
  "tauranga": "Tauranga",
  "mount maunganui": "Tauranga",
  "papamoa": "Tauranga",
  "dunedin": "Dunedin",
  "palmerston north": "Palmerston North",
  "nelson": "Nelson",
  "rotorua": "Rotorua",
  "new plymouth": "New Plymouth",
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
