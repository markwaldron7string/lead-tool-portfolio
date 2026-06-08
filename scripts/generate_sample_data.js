#!/usr/bin/env node
/**
 * scripts/generate_sample_data.js
 *
 * Generates realistic-looking sample CSVs for the portfolio/demo version
 * of the lead scraper. Run with:  node scripts/generate_sample_data.js
 *
 * Output:
 *   public/leads_au.csv  - 75 fake Australian buyers-agent leads
 *   public/leads_nz.csv  - 25 fake New Zealand buyers-agent leads
 *
 * All data is fictional. No real business names, phone numbers, email
 * addresses or ABN/NZBN numbers are used.
 */

"use strict";
const fs   = require("fs");
const path = require("path");

// ── Utility helpers ───────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
const randFloat = (lo, hi, dp = 1) =>
  parseFloat((Math.random() * (hi - lo) + lo).toFixed(dp));
const prob = (p) => Math.random() < p;

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/['''&]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Name / location data pools ────────────────────────────────────────────────

const AU_SURNAMES = [
  "Morrison", "Henderson", "Campbell", "Mitchell", "Robertson",
  "MacKenzie", "Patterson", "Fletcher", "Harrison", "Thornton",
  "Gallagher", "Brennan", "Fitzgerald", "Sullivan", "Whitfield",
  "Blackwood", "Ashford", "Carmichael", "Dunlop", "Ellsworth",
  "Fairfax", "Grantham", "Hartley", "Ingram", "Jardine",
  "Kingsley", "Lawson", "Montague", "Norwood", "Pemberton",
  "Radcliffe", "Stafford", "Talbot", "Underwood", "Vickers",
  "Warwick", "Alderton", "Bracewell", "Crompton", "Davenport",
  "Eccleston", "Fordham", "Greenwood", "Holsworth", "Kershaw",
  "Lindley", "Merriweather", "Newbury", "Openshaw", "Priestley",
  "Ravenswood", "Shuttleworth", "Tomlinson", "Whitmore", "Ingham",
  "Cartwright", "Drummond", "Fullerton", "Gillespie", "Harrington",
];

const AU_FIRST_MALE = [
  "James", "Michael", "Daniel", "Matthew", "Andrew",
  "Christopher", "Thomas", "Joshua", "Luke", "Nathan",
  "Benjamin", "Samuel", "Jack", "William", "Ryan",
  "Liam", "Patrick", "Nicholas", "Cameron", "Brendan",
  "Adam", "Dylan", "Sean", "Jake", "Ethan",
  "Marcus", "Adrian", "Simon", "Grant", "Darren",
];

const AU_FIRST_FEMALE = [
  "Emma", "Sarah", "Jessica", "Emily", "Olivia",
  "Sophie", "Charlotte", "Hannah", "Lauren", "Natalie",
  "Megan", "Rebecca", "Amy", "Kate", "Claire",
  "Samantha", "Rachel", "Zoe", "Chloe", "Georgia",
  "Melissa", "Lisa", "Kylie", "Alicia", "Bridget",
  "Renee", "Cassandra", "Fiona", "Nicole", "Joanne",
];

const NZ_SURNAMES = [
  "Walker", "Taylor", "Anderson", "Thompson", "Williams",
  "Davies", "Evans", "Wilson", "Clarke", "Cooper",
  "Stewart", "Murray", "Reid", "Bell", "Gibson",
  "Duncan", "Fraser", "Mackay", "Grant", "Scott",
  "Robertson", "Sutherland", "McDonald", "Cameron", "Sinclair",
  "Henderson", "Fletcher", "Patterson", "Morrison", "Brennan",
];

const NZ_FIRST_MALE = [
  "James", "Jack", "Ethan", "Oliver", "Noah",
  "Liam", "Sam", "Ben", "Tom", "Daniel",
  "Luke", "Nathan", "Ryan", "Dylan", "Callum",
  "Hamish", "Finn", "Rory", "Connor", "Marcus",
];

const NZ_FIRST_FEMALE = [
  "Olivia", "Charlotte", "Sophie", "Isabella", "Emma",
  "Ava", "Mia", "Grace", "Chloe", "Lucy",
  "Ella", "Zoe", "Sarah", "Hannah", "Emily",
  "Aroha", "Freya", "Isla", "Poppy", "Ruby",
];

// Suburbs / areas used in business names (distinct from the city the lead is in)
const AU_SUBURB_WORDS = [
  "Bayside", "Northside", "Eastside", "Riverside", "Harbourside",
  "Prestige", "Premier", "Capital", "Metro", "Urban",
  "Pacific", "Coastal", "Peninsula", "Bayside", "Sunrise",
  "Southern Cross", "Blue Mountains", "Inner West", "North Shore", "City Central",
  "Lakeside", "Parklands", "Beachfront", "Highland", "Summerset",
];

const NZ_SUBURB_WORDS = [
  "Harbourside", "Northside", "Pacific", "Metro", "Capital",
  "Coastal", "Southern", "Tasman", "Rangitoto", "Tūī",
  "Pohutukawa", "Alpine", "Scenic", "City Central", "Bayside",
];

// ── Business name patterns ────────────────────────────────────────────────────

const AU_NAME_PATTERNS = [
  (area, sur, first) => `${area} Buyers Agency`,
  (area, sur, first) => `${area} Property Advocacy`,
  (area, sur, first) => `${sur} Buyers Advocates`,
  (area, sur, first) => `${sur} Property Buyers`,
  (area, sur, first) => `${first} ${sur} Property Buyers`,
  (area, sur, first) => `${sur} & Associates Buyers Agents`,
  (area, sur, first) => `${area} Property Acquisitions`,
  (area, sur, first) => `${sur} Buyers Advocate`,
  (area, sur, first) => `${first} ${sur} Buyers Agency`,
  (area, sur, first) => `${sur} Property Group`,
  (area, sur, first) => `${area} Buyers Agents`,
  (area, sur, first) => `${first} ${sur} Property Advocacy`,
  (area, sur, first) => `${sur} Acquisitions`,
  (area, sur, first) => `${area} Property Consultants`,
  (area, sur, first) => `${sur} Strategic Buyers`,
];

const NZ_NAME_PATTERNS = [
  (area, sur, first) => `${area} Buyers Agency`,
  (area, sur, first) => `${area} Property Advocacy`,
  (area, sur, first) => `${sur} Buyers Advocates`,
  (area, sur, first) => `${sur} Property Buyers`,
  (area, sur, first) => `${first} ${sur} Property Buyers`,
  (area, sur, first) => `${sur} & Associates Buyers Agents`,
  (area, sur, first) => `${area} Property Acquisitions`,
  (area, sur, first) => `${sur} Buyers Advocate`,
  (area, sur, first) => `${first} ${sur} Buyers Agency`,
  (area, sur, first) => `${area} Property Consultants`,
];

// ── AU location data ──────────────────────────────────────────────────────────

const AU_CITIES_BY_STATE = {
  "New South Wales": [
    "Sydney", "Parramatta", "Chatswood", "Manly", "Cronulla",
    "Mosman", "Castle Hill", "Penrith", "Sutherland", "Ryde",
    "Strathfield", "North Sydney", "Baulkham Hills", "Wollongong",
    "Newcastle", "Hornsby", "Bankstown", "Blacktown", "Bondi",
    "Dee Why", "Pymble", "Gordon", "Turramurra", "Crows Nest",
  ],
  "Victoria": [
    "Melbourne", "Richmond", "St Kilda", "Toorak", "South Yarra",
    "Hawthorn", "Brighton", "Geelong", "Ballarat", "Bendigo",
    "Box Hill", "Doncaster", "Frankston", "Camberwell", "Moonee Ponds",
    "Ringwood", "Glen Waverley", "Fitzroy", "Prahran", "Essendon",
    "Malvern", "Carnegie", "Caulfield", "Burwood", "Heidelberg",
  ],
  "Queensland": [
    "Brisbane", "Gold Coast", "Sunshine Coast", "Toowoomba", "Townsville",
    "Ipswich", "Rockhampton", "Noosa", "Caloundra", "Redcliffe",
    "Springfield", "Southport", "Surfers Paradise", "Nundah", "Chermside",
    "Fortitude Valley", "Newstead", "Paddington", "Woolloongabba", "Indooroopilly",
  ],
  "South Australia": [
    "Adelaide", "Glenelg", "Norwood", "Prospect", "Unley",
    "Mount Barker", "Burnside", "Mitcham", "Marion", "Henley Beach",
    "Glenelg North", "Stirling", "Hahndorf", "Victor Harbor", "Aldgate",
  ],
  "Western Australia": [
    "Perth", "Fremantle", "Subiaco", "Nedlands", "Cottesloe",
    "Joondalup", "Mandurah", "Rockingham", "Victoria Park",
    "Claremont", "Mosman Park", "Karrinyup", "Scarborough",
    "Mount Lawley", "Leederville", "Applecross", "Floreat",
  ],
  "Tasmania": [
    "Hobart", "Launceston", "Devonport", "Burnie", "Kingston",
    "Sandy Bay", "Battery Point", "West Hobart", "Glenorchy", "Rosny Park",
  ],
  "Australian Capital Territory": [
    "Canberra", "Belconnen", "Tuggeranong", "Gungahlin", "Woden",
    "Braddon", "Manuka", "Barton", "Deakin", "Yarralumla",
  ],
  "Northern Territory": [
    "Darwin", "Palmerston", "Casuarina", "Alice Springs", "Nightcliff",
  ],
};

const NZ_CITIES = [
  "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga",
  "Dunedin", "Palmerston North", "Nelson", "Rotorua", "New Plymouth",
  "Napier", "Hastings", "Invercargill", "Whangarei", "Blenheim",
  "Gisborne", "Whanganui", "Upper Hutt", "Lower Hutt", "Porirua",
];

// ── Category setup ────────────────────────────────────────────────────────────

// Weighted pool: 35/25/15/10/8/4/3 = 100 entries
const CATEGORY_POOL = [
  ...Array(35).fill("Investment BA"),
  ...Array(25).fill("Uncategorised"),
  ...Array(15).fill("Owner-occupier"),
  ...Array(10).fill("SMSF"),
  ...Array(8).fill("Property advisor"),
  ...Array(4).fill("Off-the-plan"),
  ...Array(3).fill("Project sales"),
];

const SOURCE_BY_CATEGORY = {
  "Investment BA":    (city) => `investment buyers agent ${city}`,
  "Owner-occupier":   (city) => `buyers agent first home ${city}`,
  "SMSF":             (city) => `SMSF buyers agent ${city}`,
  "Uncategorised":    (city) => `buyers agent ${city}`,
  "Property advisor": (city) => `property advisor ${city}`,
  "Off-the-plan":     (city) => `off the plan buyers agent ${city}`,
  "Project sales":    (city) => `project marketing ${city}`,
};

// ── Entity types ──────────────────────────────────────────────────────────────

const AU_ENTITY_TYPES = [
  ...Array(45).fill("Australian Private Company"),
  ...Array(30).fill("Sole Trader"),
  ...Array(15).fill("Discretionary Trading Trust"),
  ...Array(10).fill("Partnership"),
];

const NZ_ENTITY_TYPES = [
  ...Array(55).fill("New Zealand Limited Company"),
  ...Array(25).fill("Sole Trader"),
  ...Array(20).fill("Partnership or Joint Venture"),
];

// ── Phone number generators ───────────────────────────────────────────────────

function auPhone(state) {
  if (prob(0.45)) {
    // Mobile
    return `+61 4${randInt(10, 99)} ${randInt(100, 999)} ${randInt(100, 999)}`;
  }
  const areaCode = {
    "New South Wales":               "2",
    "Victoria":                      "3",
    "Queensland":                    "7",
    "South Australia":               "8",
    "Western Australia":             "8",
    "Tasmania":                      "3",
    "Australian Capital Territory":  "2",
    "Northern Territory":            "8",
  }[state] || "2";
  return `+61 ${areaCode} ${randInt(1000, 9999)} ${randInt(1000, 9999)}`;
}

function nzPhone(city) {
  if (prob(0.4)) {
    return `+64 21 ${randInt(100, 999)} ${randInt(1000, 9999)}`;
  }
  const areaCode =
    city === "Auckland"                          ? "9" :
    city === "Wellington" || city === "Upper Hutt" ||
    city === "Lower Hutt" || city === "Porirua"  ? "4" :
    city === "Christchurch" || city === "Nelson" ||
    city === "Blenheim" || city === "Dunedin" ||
    city === "Invercargill"                      ? "3" :
    city === "Hamilton" || city === "Tauranga"  ||
    city === "Rotorua"  || city === "Whangarei"  ? "7" : "6";
  return `+64 ${areaCode} ${randInt(100, 999)} ${randInt(1000, 9999)}`;
}

// ── ABN / NZBN generators ─────────────────────────────────────────────────────

function fakeABN() {
  // Format: XX XXX XXX XXX - random digits, not checksum-valid (fine for demo)
  const n = () => randInt(0, 9);
  return `${n()}${n()} ${n()}${n()}${n()} ${n()}${n()}${n()} ${n()}${n()}${n()}`;
}

function fakeNZBN() {
  // Format: 9429 + 9 random digits = 13 chars
  let s = "9429";
  for (let i = 0; i < 9; i++) s += randInt(0, 9);
  return s;
}

// ── Scoring (mirrors lib/processor.js scoreLead) ──────────────────────────────

function scoreLead(lead) {
  let s = 0;
  if (lead.emails)       s += 30;
  if (lead.founderName)  s += 20;
  if (lead.website)      s += 10;
  if (lead.phone)        s += 10;

  const rating = parseFloat(lead.totalScore);
  if (!isNaN(rating)) {
    if      (rating >= 4.8) s += 15;
    else if (rating >= 4.5) s += 12;
    else if (rating >= 4.0) s += 8;
    else if (rating >= 3.5) s += 4;
  }

  const reviews = parseInt(lead.reviewsCount);
  if (!isNaN(reviews)) {
    if      (reviews >= 50) s += 10;
    else if (reviews >= 20) s += 7;
    else if (reviews >= 10) s += 4;
    else if (reviews >= 1)  s += 2;
  }

  if (lead.category && lead.category !== "Uncategorised" && lead.category !== "EXCLUDED") {
    s += 5;
  }

  if (lead.linkedinCo)       s = Math.min(100, s + 3);
  if (lead.linkedinPersonal) s = Math.min(100, s + 3);
  if (lead.instagram)        s = Math.min(100, s + 2);
  if (lead.abn)              s = Math.min(100, s + 2);

  return s;
}

// ── AU streets ────────────────────────────────────────────────────────────────

const AU_STREETS = [
  "George St", "Elizabeth St", "King St", "Queen St", "Market St",
  "Flinders St", "Collins St", "Bourke St", "William St", "Victoria St",
  "Pacific Hwy", "Main St", "High St", "Church St", "Crown St",
  "York St", "Sussex St", "Kent St", "Pitt St", "Clarence St",
  "Bridge Rd", "Station St", "Railway Pde", "Commercial Rd", "Chapel St",
];

const NZ_STREETS = [
  "Lambton Quay", "Willis St", "Victoria St", "Queen St",
  "Ponsonby Rd", "Karangahape Rd", "Dominion Rd", "Riccarton Rd",
  "Colombo St", "High St", "Durham St", "Moorhouse Ave",
  "Taranaki St", "Cuba St", "Manners St", "Courtenay Pl",
  "Shortland St", "Symonds St", "Great North Rd", "New North Rd",
];

// ── Lead generator: Australia ─────────────────────────────────────────────────

function generateAULead() {
  // State distribution weighted roughly by population
  const stateWeights = [
    ["New South Wales",              32],
    ["Victoria",                     26],
    ["Queensland",                   20],
    ["Western Australia",            11],
    ["South Australia",               7],
    ["Australian Capital Territory",  2],
    ["Tasmania",                      1],
    ["Northern Territory",            1],
  ];
  const total = stateWeights.reduce((acc, [, w]) => acc + w, 0);
  let r = Math.random() * total;
  let state = "New South Wales";
  for (const [s, w] of stateWeights) {
    r -= w;
    if (r <= 0) { state = s; break; }
  }

  const city    = pick(AU_CITIES_BY_STATE[state]);
  const surname = pick(AU_SURNAMES);
  const isFemale = prob(0.4);
  const firstName = isFemale ? pick(AU_FIRST_FEMALE) : pick(AU_FIRST_MALE);

  // Area word used in name (50% use city, 50% use suburb word)
  const areaWord = prob(0.5) ? city : pick(AU_SUBURB_WORDS);
  const pattern  = pick(AU_NAME_PATTERNS);
  const businessName = pattern(areaWord, surname, firstName);
  const slug     = slugify(businessName);
  const domain   = `${slug}.com.au`;
  const website  = `https://www.${domain}`;

  const category = pick(shuffled(CATEGORY_POOL));
  const source   = (SOURCE_BY_CATEGORY[category] || SOURCE_BY_CATEGORY["Uncategorised"])(city);

  const hasEmail   = prob(0.60);
  const emailUser  = prob(0.55) ? "info" : firstName.toLowerCase();
  const email      = hasEmail ? `${emailUser}@${domain}` : "";

  const hasFounder  = prob(0.65);
  const founderName = hasFounder ? `${firstName} ${surname}` : "";

  const hasLinkedInCo = prob(0.35);
  const linkedinCo    = hasLinkedInCo ? `https://www.linkedin.com/company/${slug}` : "";

  // Personal LinkedIn only makes sense when there's a named founder
  const hasLinkedInPers = hasFounder && prob(0.23);
  const linkedinPersonal = hasLinkedInPers
    ? `https://www.linkedin.com/in/${firstName.toLowerCase()}-${surname.toLowerCase()}`
    : "";

  const hasInstagram = prob(0.45);
  const instagram    = hasInstagram
    ? `https://www.instagram.com/${slug.replace(/-/g, "_")}`
    : "";

  const hasABN     = prob(0.85);
  const abn        = hasABN ? fakeABN() : "";
  const entityType = hasABN ? pick(AU_ENTITY_TYPES) : "";

  const totalScore   = randFloat(4.1, 5.0, 1);
  const reviewsCount = randInt(3, 127);
  const street       = `${randInt(1, 250)} ${pick(AU_STREETS)}`;

  const leadData = {
    website, phone: auPhone(state), emails: email,
    founderName, linkedinCo, linkedinPersonal, instagram,
    abn, totalScore, reviewsCount, category,
  };

  const leadScore = scoreLead(leadData);

  return {
    "Business Name":    businessName,
    "Phone":            leadData.phone,
    "Website":          website,
    "Street":           street,
    "City":             city,
    "State":            state,
    "Rating":           totalScore,
    "Reviews":          reviewsCount,
    "Emails":           email,
    "Founder Name":     founderName,
    "LinkedIn Company": linkedinCo,
    "LinkedIn Personal":linkedinPersonal,
    "Instagram":        instagram,
    "Facebook":         "",
    "ABN":              abn,
    "Entity Type":      entityType,
    "Category":         category,
    "Lead Score":       leadScore,
    "Source Search":    source,
    "Research Summary": "",
  };
}

// ── Lead generator: New Zealand ───────────────────────────────────────────────

function generateNZLead() {
  const city    = pick(NZ_CITIES);
  const surname = pick(NZ_SURNAMES);
  const isFemale = prob(0.4);
  const firstName = isFemale ? pick(NZ_FIRST_FEMALE) : pick(NZ_FIRST_MALE);

  const areaWord = prob(0.5) ? city : pick(NZ_SUBURB_WORDS);
  const pattern  = pick(NZ_NAME_PATTERNS);
  const businessName = pattern(areaWord, surname, firstName);
  const slug     = slugify(businessName);
  const domain   = `${slug}.co.nz`;
  const website  = `https://www.${domain}`;

  const category = pick(shuffled(CATEGORY_POOL));
  const source   = (SOURCE_BY_CATEGORY[category] || SOURCE_BY_CATEGORY["Uncategorised"])(city);

  const hasEmail   = prob(0.60);
  const emailUser  = prob(0.55) ? "info" : firstName.toLowerCase();
  const email      = hasEmail ? `${emailUser}@${domain}` : "";

  const hasFounder  = prob(0.65);
  const founderName = hasFounder ? `${firstName} ${surname}` : "";

  const hasLinkedInCo = prob(0.35);
  const linkedinCo    = hasLinkedInCo ? `https://www.linkedin.com/company/${slug}` : "";

  const hasLinkedInPers = hasFounder && prob(0.23);
  const linkedinPersonal = hasLinkedInPers
    ? `https://www.linkedin.com/in/${firstName.toLowerCase()}-${surname.toLowerCase()}`
    : "";

  const hasInstagram = prob(0.45);
  const instagram    = hasInstagram
    ? `https://www.instagram.com/${slug.replace(/-/g, "_")}`
    : "";

  const hasNZBN    = prob(0.60);
  const nzbn       = hasNZBN ? fakeNZBN() : "";
  const entityType = hasNZBN ? pick(NZ_ENTITY_TYPES) : "";

  const totalScore   = randFloat(4.1, 5.0, 1);
  const reviewsCount = randInt(3, 127);
  const street       = `${randInt(1, 200)} ${pick(NZ_STREETS)}`;

  const leadData = {
    website, phone: nzPhone(city), emails: email,
    founderName, linkedinCo, linkedinPersonal, instagram,
    abn: nzbn, totalScore, reviewsCount, category,
  };

  const leadScore = scoreLead(leadData);

  return {
    "Business Name":    businessName,
    "Phone":            leadData.phone,
    "Website":          website,
    "Street":           street,
    "City":             city,
    "State":            city,         // NZ: region = city
    "Rating":           totalScore,
    "Reviews":          reviewsCount,
    "Emails":           email,
    "Founder Name":     founderName,
    "LinkedIn Company": linkedinCo,
    "LinkedIn Personal":linkedinPersonal,
    "Instagram":        instagram,
    "Facebook":         "",
    "ABN":              nzbn,         // NZBN stored in ABN column
    "Entity Type":      entityType,
    "Category":         category,
    "Lead Score":       leadScore,
    "Source Search":    source,
    "Research Summary": "",
  };
}

// ── CSV writer ────────────────────────────────────────────────────────────────

const HEADERS = [
  "Business Name", "Phone", "Website", "Street", "City", "State",
  "Rating", "Reviews", "Emails", "Founder Name",
  "LinkedIn Company", "LinkedIn Personal", "Instagram", "Facebook",
  "ABN", "Entity Type", "Category", "Lead Score", "Source Search",
  "Research Summary",
];

function escapeCell(v) {
  return `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
}

function buildCSV(rows) {
  const lines = [HEADERS.join(",")];
  for (const row of rows) {
    lines.push(HEADERS.map((h) => escapeCell(row[h])).join(","));
  }
  return lines.join("\n") + "\n";
}

// ── Main ──────────────────────────────────────────────────────────────────────

function generateUnique(fn, count, maxAttempts = count * 8) {
  const seen = new Set();
  const rows = [];
  let attempts = 0;
  while (rows.length < count && attempts < maxAttempts) {
    attempts++;
    const row = fn();
    // Normalised key used for dedup (same logic as processor.js normalizeKey)
    const key = row["Business Name"].toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seen.has(key)) {
      seen.add(key);
      rows.push(row);
    }
  }
  if (rows.length < count) {
    console.warn(`⚠  Could only generate ${rows.length}/${count} unique leads`);
  }
  return rows;
}

console.log("Generating sample data...\n");

const auRows = generateUnique(generateAULead, 75);
const nzRows = generateUnique(generateNZLead, 25);

const publicDir = path.resolve(__dirname, "..", "public");
fs.writeFileSync(path.join(publicDir, "leads_au.csv"), buildCSV(auRows), "utf-8");
fs.writeFileSync(path.join(publicDir, "leads_nz.csv"), buildCSV(nzRows), "utf-8");

// ── Verification output ───────────────────────────────────────────────────────

function stateAbbr(s) {
  return { "New South Wales": "NSW", "Victoria": "VIC", "Queensland": "QLD",
           "Western Australia": "WA", "South Australia": "SA",
           "Australian Capital Territory": "ACT", "Tasmania": "TAS",
           "Northern Territory": "NT" }[s] || s;
}

console.log(`✓ public/leads_au.csv  - ${auRows.length} leads`);
console.log(`✓ public/leads_nz.csv  - ${nzRows.length} leads`);

console.log("\n── AU sample (first 3 rows) ──────────────────────────────────");
for (const row of auRows.slice(0, 3)) {
  console.log(
    `  "${row["Business Name"]}"  |  ${row["City"]}, ${stateAbbr(row["State"])}` +
    `  |  ${row["Phone"]}  |  Score ${row["Lead Score"]}  |  ${row["Category"]}`
  );
}

console.log("\n── NZ sample (first 3 rows) ──────────────────────────────────");
for (const row of nzRows.slice(0, 3)) {
  console.log(
    `  "${row["Business Name"]}"  |  ${row["City"]}` +
    `  |  ${row["Phone"]}  |  Score ${row["Lead Score"]}  |  ${row["Category"]}`
  );
}

// Score distribution
const auScores = auRows.map((r) => Number(r["Lead Score"]));
const nzScores = nzRows.map((r) => Number(r["Lead Score"]));
const dist = (scores) => ({
  "Best  (≥75)": scores.filter((s) => s >= 75).length,
  "Great (≥60)": scores.filter((s) => s >= 60 && s < 75).length,
  "Good  (≥40)": scores.filter((s) => s >= 40 && s < 60).length,
  "Low   (<40)": scores.filter((s) => s < 40).length,
});

console.log("\n── Score distribution ────────────────────────────────────────");
const auDist = dist(auScores);
const nzDist = dist(nzScores);
for (const [label, n] of Object.entries(auDist)) {
  console.log(`  AU ${label}: ${n}    NZ: ${nzDist[label]}`);
}

// Category breakdown
const catCount = (rows) => rows.reduce((acc, r) => {
  acc[r["Category"]] = (acc[r["Category"]] || 0) + 1;
  return acc;
}, {});
const auCats = catCount(auRows);
const nzCats = catCount(nzRows);
console.log("\n── AU category breakdown ─────────────────────────────────────");
for (const [cat, n] of Object.entries(auCats).sort((a, b) => b[1] - a[1])) {
  const pct = Math.round((n / auRows.length) * 100);
  console.log(`  ${cat.padEnd(22)} ${String(n).padStart(2)}  (${pct}%)`);
}

// Data quality checks
const auWithEmail  = auRows.filter((r) => r["Emails"]).length;
const auWithName   = auRows.filter((r) => r["Founder Name"]).length;
const auWithABN    = auRows.filter((r) => r["ABN"]).length;
const auWithLinked = auRows.filter((r) => r["LinkedIn Company"]).length;
const nzWithEmail  = nzRows.filter((r) => r["Emails"]).length;
console.log("\n── AU data completeness ──────────────────────────────────────");
console.log(`  Email:          ${auWithEmail}/${auRows.length} (${Math.round(auWithEmail/auRows.length*100)}%)`);
console.log(`  Founder name:   ${auWithName}/${auRows.length} (${Math.round(auWithName/auRows.length*100)}%)`);
console.log(`  ABN:            ${auWithABN}/${auRows.length} (${Math.round(auWithABN/auRows.length*100)}%)`);
console.log(`  LinkedIn (Co):  ${auWithLinked}/${auRows.length} (${Math.round(auWithLinked/auRows.length*100)}%)`);
console.log(`\nNZ  Email:        ${nzWithEmail}/${nzRows.length} (${Math.round(nzWithEmail/nzRows.length*100)}%)`);
console.log("\nDone. ✓");
