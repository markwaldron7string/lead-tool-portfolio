// lib/au-areas.js
// 101 AU suburb-level and regional areas with coordinates, state, and scrape radius.
// Imported by both the scrape API route (server) and ScrapePanel / CoverageView (client).

export const AU_AREAS = {
  // ── NSW & ACT ──────────────────────────────────────────────────────────────
  "Eastern Suburbs Sydney":            { lat: -33.8915, lng: 151.2767, state: "New South Wales",               radius: 30000 },
  "Inner West Sydney":                 { lat: -33.8882, lng: 151.1593, state: "New South Wales",               radius: 30000 },
  "Canterbury-Bankstown":              { lat: -33.9175, lng: 151.0733, state: "New South Wales",               radius: 30000 },
  "St George Sydney":                  { lat: -33.9667, lng: 151.1167, state: "New South Wales",               radius: 30000 },
  "Sydney CBD":                        { lat: -33.8688, lng: 151.2093, state: "New South Wales",               radius: 30000 },
  "Lower North Shore Sydney":          { lat: -33.8333, lng: 151.2,    state: "New South Wales",               radius: 30000 },
  "Upper North Shore Sydney":          { lat: -33.7667, lng: 151.1833, state: "New South Wales",               radius: 30000 },
  "Northern Beaches Sydney":           { lat: -33.75,   lng: 151.2833, state: "New South Wales",               radius: 30000 },
  "Parramatta":                        { lat: -33.815,  lng: 151.0011, state: "New South Wales",               radius: 30000 },
  "Hills District Sydney":             { lat: -33.7167, lng: 151.0,    state: "New South Wales",               radius: 30000 },
  "Western Sydney Blacktown Penrith":  { lat: -33.768,  lng: 150.905,  state: "New South Wales",               radius: 30000 },
  "Liverpool Fairfield":               { lat: -33.92,   lng: 150.92,   state: "New South Wales",               radius: 30000 },
  "Blue Mountains Outer West":         { lat: -33.7167, lng: 150.3167, state: "New South Wales",               radius: 50000 },
  "Sutherland Shire":                  { lat: -34.0333, lng: 151.0667, state: "New South Wales",               radius: 30000 },
  "South West Campbelltown Camden":    { lat: -34.0667, lng: 150.8167, state: "New South Wales",               radius: 30000 },
  "Central Coast North Wyong":         { lat: -33.2833, lng: 151.4167, state: "New South Wales",               radius: 30000 },
  "Central Coast South Gosford":       { lat: -33.4333, lng: 151.3333, state: "New South Wales",               radius: 30000 },
  "Newcastle City":                    { lat: -32.9283, lng: 151.7817, state: "New South Wales",               radius: 30000 },
  "Lake Macquarie":                    { lat: -33.0333, lng: 151.6167, state: "New South Wales",               radius: 30000 },
  "Maitland Hunter Valley":            { lat: -32.7333, lng: 151.55,   state: "New South Wales",               radius: 50000 },
  "Port Stephens":                     { lat: -32.7167, lng: 152.1,    state: "New South Wales",               radius: 30000 },
  "Wollongong":                        { lat: -34.4278, lng: 150.8931, state: "New South Wales",               radius: 30000 },
  "Shellharbour Kiama":                { lat: -34.5833, lng: 150.8667, state: "New South Wales",               radius: 30000 },
  "Shoalhaven Nowra":                  { lat: -34.8833, lng: 150.6,    state: "New South Wales",               radius: 50000 },
  "Batemans Bay Eurobodalla":          { lat: -35.7167, lng: 150.1833, state: "New South Wales",               radius: 50000 },
  "Belconnen Canberra":                { lat: -35.2333, lng: 149.0667, state: "Australian Capital Territory",  radius: 30000 },
  "Gungahlin Canberra":                { lat: -35.1833, lng: 149.1333, state: "Australian Capital Territory",  radius: 30000 },
  "Tuggeranong Canberra":              { lat: -35.4167, lng: 149.0667, state: "Australian Capital Territory",  radius: 30000 },
  "North Canberra Inner North":        { lat: -35.25,   lng: 149.1333, state: "Australian Capital Territory",  radius: 30000 },
  "South Canberra Woden Weston Creek": { lat: -35.35,   lng: 149.0833, state: "Australian Capital Territory",  radius: 30000 },
  "Queanbeyan":                        { lat: -35.3533, lng: 149.2342, state: "New South Wales",               radius: 30000 },
  "Goulburn":                          { lat: -34.7547, lng: 149.7214, state: "New South Wales",               radius: 50000 },
  "Port Macquarie":                    { lat: -31.4333, lng: 152.9,    state: "New South Wales",               radius: 50000 },
  "Coffs Harbour":                     { lat: -30.2986, lng: 153.1094, state: "New South Wales",               radius: 50000 },
  "Taree Mid Coast":                   { lat: -31.9167, lng: 152.45,   state: "New South Wales",               radius: 50000 },
  "Byron Bay Ballina":                 { lat: -28.65,   lng: 153.5667, state: "New South Wales",               radius: 50000 },
  "Lismore Richmond Valley":           { lat: -28.8167, lng: 153.2833, state: "New South Wales",               radius: 50000 },
  "Tweed Heads":                       { lat: -28.1833, lng: 153.55,   state: "New South Wales",               radius: 30000 },
  "Tamworth":                          { lat: -31.0833, lng: 150.9333, state: "New South Wales",               radius: 50000 },
  "Armidale":                          { lat: -30.5167, lng: 151.6667, state: "New South Wales",               radius: 50000 },
  "Wagga Wagga":                       { lat: -35.1167, lng: 147.3667, state: "New South Wales",               radius: 50000 },
  "Albury":                            { lat: -36.0806, lng: 146.9158, state: "New South Wales",               radius: 50000 },
  "Bathurst Orange":                   { lat: -33.4167, lng: 149.5833, state: "New South Wales",               radius: 50000 },
  "Dubbo":                             { lat: -32.2569, lng: 148.6011, state: "New South Wales",               radius: 50000 },

  // ── VIC ────────────────────────────────────────────────────────────────────
  "Melbourne Inner CBD Fitzroy Carlton":         { lat: -37.8136, lng: 144.9631, state: "Victoria", radius: 30000 },
  "Melbourne Inner East Boroondara Hawthorn":    { lat: -37.8333, lng: 145.05,   state: "Victoria", radius: 30000 },
  "Melbourne Inner South Bayside St Kilda":      { lat: -37.8667, lng: 144.9833, state: "Victoria", radius: 30000 },
  "Melbourne North East Doncaster Manningham":   { lat: -37.7667, lng: 145.1167, state: "Victoria", radius: 30000 },
  "Melbourne North West Moonee Valley Moreland": { lat: -37.75,   lng: 144.9333, state: "Victoria", radius: 30000 },
  "Melbourne South East Knox Dandenong Casey":   { lat: -37.9833, lng: 145.2167, state: "Victoria", radius: 30000 },
  "Melbourne West Wyndham Maribyrnong Melton":   { lat: -37.8667, lng: 144.7333, state: "Victoria", radius: 30000 },
  "Melbourne Outer East Yarra Ranges Maroondah": { lat: -37.8167, lng: 145.35,   state: "Victoria", radius: 30000 },
  "Mornington Peninsula":                        { lat: -38.2167, lng: 145.0333, state: "Victoria", radius: 30000 },
  "Geelong Surf Coast":                          { lat: -38.1499, lng: 144.3617, state: "Victoria", radius: 30000 },
  "Ballarat":                                    { lat: -37.5622, lng: 143.8503, state: "Victoria", radius: 50000 },
  "Bendigo":                                     { lat: -36.757,  lng: 144.2794, state: "Victoria", radius: 50000 },
  "Latrobe Valley Gippsland":                    { lat: -38.2,    lng: 146.3333, state: "Victoria", radius: 50000 },
  "Shepparton":                                  { lat: -36.3833, lng: 145.4,    state: "Victoria", radius: 50000 },
  "Wodonga":                                     { lat: -36.1214, lng: 146.8881, state: "Victoria", radius: 50000 },
  "Warrnambool South West Coast":                { lat: -38.3833, lng: 142.4833, state: "Victoria", radius: 50000 },
  "Daylesford Macedon Ranges":                   { lat: -37.35,   lng: 144.3333, state: "Victoria", radius: 50000 },

  // ── QLD ────────────────────────────────────────────────────────────────────
  "Brisbane Inner City CBD South Brisbane":          { lat: -27.4698, lng: 153.0251, state: "Queensland", radius: 30000 },
  "Brisbane North Chermside Nundah":                 { lat: -27.3833, lng: 153.0333, state: "Queensland", radius: 30000 },
  "Brisbane South Holland Park Mt Gravatt":          { lat: -27.5333, lng: 153.05,   state: "Queensland", radius: 30000 },
  "Brisbane East Wynnum Manly Carindale":            { lat: -27.4667, lng: 153.1667, state: "Queensland", radius: 30000 },
  "Brisbane West Toowong Indooroopilly":             { lat: -27.4833, lng: 152.9833, state: "Queensland", radius: 30000 },
  "Moreton Bay North Caboolture Bribie Island":      { lat: -27.0667, lng: 152.95,   state: "Queensland", radius: 30000 },
  "Moreton Bay South Strathpine Lawnton":            { lat: -27.3,    lng: 152.9833, state: "Queensland", radius: 30000 },
  "Logan Beaudesert":                                { lat: -27.6333, lng: 153.1167, state: "Queensland", radius: 30000 },
  "Ipswich":                                         { lat: -27.6167, lng: 152.7667, state: "Queensland", radius: 30000 },
  "Redlands":                                        { lat: -27.5333, lng: 153.3,    state: "Queensland", radius: 30000 },
  "Gold Coast North Coomera Hope Island":            { lat: -27.8667, lng: 153.3,    state: "Queensland", radius: 30000 },
  "Gold Coast Central Surfers Paradise Broadbeach":  { lat: -28.0,    lng: 153.4333, state: "Queensland", radius: 30000 },
  "Gold Coast South Palm Beach Coolangatta":         { lat: -28.1333, lng: 153.4833, state: "Queensland", radius: 30000 },
  "Sunshine Coast North Noosa":                      { lat: -26.3833, lng: 153.0833, state: "Queensland", radius: 30000 },
  "Sunshine Coast Central Maroochydore Mooloolaba":  { lat: -26.65,   lng: 153.0667, state: "Queensland", radius: 30000 },
  "Toowoomba":                                       { lat: -27.5667, lng: 151.95,   state: "Queensland", radius: 30000 },
  "Cairns":                                          { lat: -16.9186, lng: 145.7781, state: "Queensland", radius: 30000 },
  "Townsville":                                      { lat: -19.2564, lng: 146.8183, state: "Queensland", radius: 30000 },
  "Mackay":                                          { lat: -21.15,   lng: 149.1667, state: "Queensland", radius: 50000 },
  "Rockhampton":                                     { lat: -23.3833, lng: 150.5,    state: "Queensland", radius: 50000 },
  "Hervey Bay Bundaberg":                            { lat: -25.2833, lng: 152.6833, state: "Queensland", radius: 50000 },

  // ── WA ─────────────────────────────────────────────────────────────────────
  "Perth Inner CBD Subiaco Fremantle":               { lat: -31.9505, lng: 115.8605, state: "Western Australia", radius: 30000 },
  "Perth North West Joondalup Wanneroo":             { lat: -31.7333, lng: 115.7667, state: "Western Australia", radius: 30000 },
  "Perth North East Swan Midland Kalamunda":         { lat: -31.8833, lng: 116.0167, state: "Western Australia", radius: 30000 },
  "Perth South West Cockburn Kwinana Rockingham":    { lat: -32.1833, lng: 115.8167, state: "Western Australia", radius: 30000 },
  "Perth South East Canning Gosnells Armadale":      { lat: -32.1333, lng: 116.0,    state: "Western Australia", radius: 30000 },
  "Mandurah Peel Region":                            { lat: -32.5297, lng: 115.7231, state: "Western Australia", radius: 30000 },
  "Bunbury South West WA":                           { lat: -33.3333, lng: 115.6333, state: "Western Australia", radius: 50000 },

  // ── SA ─────────────────────────────────────────────────────────────────────
  "Adelaide Central Hills CBD Inner East Burnside":  { lat: -34.9285, lng: 138.6007, state: "South Australia", radius: 30000 },
  "Adelaide North Prospect Tea Tree Gully Elizabeth":{ lat: -34.7833, lng: 138.65,   state: "South Australia", radius: 30000 },
  "Adelaide West Port Adelaide Hindmarsh West Lakes":{ lat: -34.8667, lng: 138.5,    state: "South Australia", radius: 30000 },
  "Adelaide South Marion Morphett Vale Onkaparinga": { lat: -35.1,    lng: 138.55,   state: "South Australia", radius: 30000 },
  "Barossa Valley Clare Valley":                     { lat: -34.5333, lng: 138.95,   state: "South Australia", radius: 50000 },
  "Fleurieu Peninsula Victor Harbor":                { lat: -35.55,   lng: 138.6167, state: "South Australia", radius: 50000 },

  // ── TAS ────────────────────────────────────────────────────────────────────
  "Hobart Inner CBD Sandy Bay Battery Point":        { lat: -42.8821, lng: 147.3272, state: "Tasmania", radius: 30000 },
  "Hobart North East Clarence Glenorchy Kingston":   { lat: -42.8333, lng: 147.3833, state: "Tasmania", radius: 30000 },
  "Launceston":                                      { lat: -41.4419, lng: 147.145,  state: "Tasmania", radius: 30000 },
  "Devonport North West Coast":                      { lat: -41.1833, lng: 146.35,   state: "Tasmania", radius: 50000 },

  // ── NT ─────────────────────────────────────────────────────────────────────
  "Darwin Palmerston":                               { lat: -12.4634, lng: 130.8456, state: "Northern Territory", radius: 30000 },
  "Alice Springs":                                   { lat: -23.698,  lng: 133.8807, state: "Northern Territory", radius: 50000 },
};

// Grouped for UI dropdowns and coverage view
export const AU_AREA_GROUPS = [
  {
    label: "NSW & ACT",
    areas: [
      "Eastern Suburbs Sydney",
      "Inner West Sydney",
      "Canterbury-Bankstown",
      "St George Sydney",
      "Sydney CBD",
      "Lower North Shore Sydney",
      "Upper North Shore Sydney",
      "Northern Beaches Sydney",
      "Parramatta",
      "Hills District Sydney",
      "Western Sydney Blacktown Penrith",
      "Liverpool Fairfield",
      "Blue Mountains Outer West",
      "Sutherland Shire",
      "South West Campbelltown Camden",
      "Central Coast North Wyong",
      "Central Coast South Gosford",
      "Newcastle City",
      "Lake Macquarie",
      "Maitland Hunter Valley",
      "Port Stephens",
      "Wollongong",
      "Shellharbour Kiama",
      "Shoalhaven Nowra",
      "Batemans Bay Eurobodalla",
      "Belconnen Canberra",
      "Gungahlin Canberra",
      "Tuggeranong Canberra",
      "North Canberra Inner North",
      "South Canberra Woden Weston Creek",
      "Queanbeyan",
      "Goulburn",
      "Port Macquarie",
      "Coffs Harbour",
      "Taree Mid Coast",
      "Byron Bay Ballina",
      "Lismore Richmond Valley",
      "Tweed Heads",
      "Tamworth",
      "Armidale",
      "Wagga Wagga",
      "Albury",
      "Bathurst Orange",
      "Dubbo",
    ],
  },
  {
    label: "VIC",
    areas: [
      "Melbourne Inner CBD Fitzroy Carlton",
      "Melbourne Inner East Boroondara Hawthorn",
      "Melbourne Inner South Bayside St Kilda",
      "Melbourne North East Doncaster Manningham",
      "Melbourne North West Moonee Valley Moreland",
      "Melbourne South East Knox Dandenong Casey",
      "Melbourne West Wyndham Maribyrnong Melton",
      "Melbourne Outer East Yarra Ranges Maroondah",
      "Mornington Peninsula",
      "Geelong Surf Coast",
      "Ballarat",
      "Bendigo",
      "Latrobe Valley Gippsland",
      "Shepparton",
      "Wodonga",
      "Warrnambool South West Coast",
      "Daylesford Macedon Ranges",
    ],
  },
  {
    label: "QLD",
    areas: [
      "Brisbane Inner City CBD South Brisbane",
      "Brisbane North Chermside Nundah",
      "Brisbane South Holland Park Mt Gravatt",
      "Brisbane East Wynnum Manly Carindale",
      "Brisbane West Toowong Indooroopilly",
      "Moreton Bay North Caboolture Bribie Island",
      "Moreton Bay South Strathpine Lawnton",
      "Logan Beaudesert",
      "Ipswich",
      "Redlands",
      "Gold Coast North Coomera Hope Island",
      "Gold Coast Central Surfers Paradise Broadbeach",
      "Gold Coast South Palm Beach Coolangatta",
      "Sunshine Coast North Noosa",
      "Sunshine Coast Central Maroochydore Mooloolaba",
      "Toowoomba",
      "Cairns",
      "Townsville",
      "Mackay",
      "Rockhampton",
      "Hervey Bay Bundaberg",
    ],
  },
  {
    label: "WA",
    areas: [
      "Perth Inner CBD Subiaco Fremantle",
      "Perth North West Joondalup Wanneroo",
      "Perth North East Swan Midland Kalamunda",
      "Perth South West Cockburn Kwinana Rockingham",
      "Perth South East Canning Gosnells Armadale",
      "Mandurah Peel Region",
      "Bunbury South West WA",
    ],
  },
  {
    label: "SA",
    areas: [
      "Adelaide Central Hills CBD Inner East Burnside",
      "Adelaide North Prospect Tea Tree Gully Elizabeth",
      "Adelaide West Port Adelaide Hindmarsh West Lakes",
      "Adelaide South Marion Morphett Vale Onkaparinga",
      "Barossa Valley Clare Valley",
      "Fleurieu Peninsula Victor Harbor",
    ],
  },
  {
    label: "TAS",
    areas: [
      "Hobart Inner CBD Sandy Bay Battery Point",
      "Hobart North East Clarence Glenorchy Kingston",
      "Launceston",
      "Devonport North West Coast",
    ],
  },
  {
    label: "NT",
    areas: [
      "Darwin Palmerston",
      "Alice Springs",
    ],
  },
];

// Flat list of all 101 area names (for TEMPLATES and city selector)
export const AU_AREA_NAMES = AU_AREA_GROUPS.flatMap((g) => g.areas);

export const AU_STATE_NAMES = [...new Set(Object.values(AU_AREAS).map((a) => a.state))].sort();

const STATE_ALIASES = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  SA: "South Australia",
  WA: "Western Australia",
  TAS: "Tasmania",
  NT: "Northern Territory",
  ACT: "Australian Capital Territory",
  "New South Wales": "New South Wales",
  Victoria: "Victoria",
  Queensland: "Queensland",
  "South Australia": "South Australia",
  "Western Australia": "Western Australia",
  Tasmania: "Tasmania",
  "Northern Territory": "Northern Territory",
  "Australian Capital Territory": "Australian Capital Territory",
  "Australian Capital Territory (ACT)": "Australian Capital Territory",
  "Northern Territory (NT)": "Northern Territory",
};

export function normaliseState(raw) {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  return STATE_ALIASES[trimmed] || trimmed;
}

export function getAreaGroupsForState(stateName) {
  if (!stateName) return AU_AREA_GROUPS;
  const state = normaliseState(stateName);
  return AU_AREA_GROUPS
    .map((group) => ({
      ...group,
      areas: group.areas.filter((area) => AU_AREAS[area]?.state === state),
    }))
    .filter((group) => group.areas.length > 0);
}

export function getAreasForState(stateName) {
  if (!stateName) return AU_AREA_NAMES;
  const state = normaliseState(stateName);
  return AU_AREA_NAMES.filter((area) => AU_AREAS[area]?.state === state);
}
