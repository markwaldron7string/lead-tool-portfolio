#!/usr/bin/env node
/**
 * Build portfolio CSVs from the live lead-tool datasets.
 *
 * Preserves row count and distributions for: city, region/state, rating, reviews,
 * category, entity type, lead score, source search, and empty/unfetched fields.
 * Replaces sensitive fields with obviously fictional dummy data.
 *
 * Usage:
 *   node scripts/anonymize_portfolio_data.js
 *   node scripts/anonymize_portfolio_data.js --source ../lead-tool/public
 *   node scripts/anonymize_portfolio_data.js --pad-only
 *
 * `--pad-only` resizes the existing public dummy CSVs to TARGET_COUNTS
 * without needing the private production source.
 */

const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

const ROOT = path.join(__dirname, "..");
const DEFAULT_SOURCE = path.join(__dirname, "..", "..", "lead-tool", "public");
const OUT_DIR = path.join(ROOT, "public");

// Production lead counts the public dummy CSVs should match.
const TARGET_COUNTS = { AU: 7649, NZ: 1879 };

const CSV_COLUMNS = [
  "Business Name", "Phone", "Website", "Street", "City", "State",
  "Rating", "Reviews", "Emails", "Founder Name",
  "LinkedIn Company", "LinkedIn Personal", "Instagram", "Facebook",
  "ABN", "Entity Type", "Category", "Lead Score", "Source Search", "Research Summary",
];

const SILLY_ADJECTIVES = [
  "Totally Fake",
  "Definitely Not Real",
  "Captain Obvious",
  "Imaginary",
  "Pretend",
  "Suspiciously Legit",
  "Absolutely Made Up",
  "Certified Fictional",
  "Banana Republic",
  "Quantum",
];

const SILLY_NOUNS = [
  "Buyers Agency",
  "Property Shenanigans",
  "Homes & Hogwash",
  "Advocates Anonymous",
  "Dream Home Depot",
  "Off-Market Emporium",
  "House Hunters Hoax",
  "Mortgage Mayhem",
  "Suburb Safari Co",
  "Brick & Giggle",
];

const SILLY_FOUNDERS = [
  "Pat Faux",
  "Sam Sample",
  "Alex Alias",
  "Jordan Jokester",
  "Taylor Testdata",
  "Morgan Mock",
  "Casey Contrived",
  "Riley Rubbish",
  "Jamie Jest",
  "Quinn Quip",
];

const SILLY_STREETS = [
  "123 Fake Street",
  "42 Demo Drive",
  "1 Pretend Parade",
  "99 Sample Square",
  "7 Hogwash Highway",
  "404 Not Found Road",
  "3 Test Terrace",
  "88 Placeholder Place",
];

function parseArgs() {
  const args = process.argv.slice(2);
  let source = DEFAULT_SOURCE;
  let padOnly = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--source" && args[i + 1]) {
      source = path.resolve(args[++i]);
    }
    if (args[i] === "--pad-only") {
      padOnly = true;
    }
  }
  return { source, padOnly };
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hasValue(value) {
  const v = (value ?? "").trim();
  return v.length > 0 && v !== "---";
}

function preserveOrEmpty(value) {
  const v = (value ?? "").trim();
  if (!v || v === "---") return "";
  return value;
}

function fakeBusinessName(index, city, rand) {
  const adj = SILLY_ADJECTIVES[Math.floor(rand() * SILLY_ADJECTIVES.length)];
  const noun = SILLY_NOUNS[Math.floor(rand() * SILLY_NOUNS.length)];
  const cityPart = city ? ` ${city}` : "";
  return `${adj}${cityPart} ${noun} #${index + 1}`;
}

function fakePhone(country, index, rand) {
  if (country === "NZ") {
    const part = String(100 + Math.floor(rand() * 900));
    const part2 = String(100 + Math.floor(rand() * 900));
    const part3 = String(1000 + Math.floor(rand() * 9000)).slice(-4);
    return `+64 21 ${part} ${part3}`;
  }
  const part = String(400 + Math.floor(rand() * 500));
  const part2 = String(100 + Math.floor(rand() * 900));
  const part3 = String(100 + Math.floor(rand() * 900));
  return `+61 ${part} ${part2} ${part3}`;
}

function fakeWebsite(index) {
  return `https://totally-fake-buyers-${index + 1}.example`;
}

function fakeEmail(index, founder) {
  const slug = founder.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "") || `lead${index + 1}`;
  return `${slug}@fake-buyers.example`;
}

function fakeFounder(index, rand) {
  return SILLY_FOUNDERS[Math.floor(rand() * SILLY_FOUNDERS.length)];
}

function fakeStreet(index, rand) {
  return SILLY_STREETS[Math.floor(rand() * SILLY_STREETS.length)];
}

function fakeLinkedInCompany(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `https://www.linkedin.com/company/${slug}`;
}

function fakeLinkedInPersonal(index, founder) {
  const slug = founder.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `https://www.linkedin.com/in/${slug || `fake-founder-${index + 1}`}`;
}

function fakeInstagram(index) {
  return `https://www.instagram.com/fake_buyers_${index + 1}`;
}

function fakeFacebook(index) {
  return `https://www.facebook.com/fake.buyers.${index + 1}`;
}

function fakeAbn(country, index, rand) {
  if (country === "NZ") {
    return `9429${String(100000000 + index).padStart(9, "0").slice(0, 9)}`;
  }
  const parts = [
    String(10 + Math.floor(rand() * 89)).padStart(2, "0"),
    String(100 + Math.floor(rand() * 900)),
    String(100 + Math.floor(rand() * 900)),
    String(100 + Math.floor(rand() * 900)),
  ];
  return parts.join(" ");
}

function fakeResearchSummary(index) {
  return `Demo-only research blurb #${index + 1}. This business is entirely fictional and exists only in the portfolio dataset.`;
}

function anonymizeRow(row, index, country) {
  const rand = mulberry32(0x9e3779b9 ^ (index + 1) ^ (country === "NZ" ? 0x4e5a : 0x4155));
  const city = preserveOrEmpty(row.City);
  const businessName = fakeBusinessName(index, city, rand);
  const founder = hasValue(row["Founder Name"]) ? fakeFounder(index, rand) : "";

  return {
    "Business Name": businessName,
    Phone: hasValue(row.Phone) ? fakePhone(country, index, rand) : "",
    Website: hasValue(row.Website) ? fakeWebsite(index) : "",
    Street: hasValue(row.Street) ? fakeStreet(index, rand) : "",
    City: city,
    State: preserveOrEmpty(row.State),
    Rating: preserveOrEmpty(row.Rating),
    Reviews: preserveOrEmpty(row.Reviews),
    Emails: hasValue(row.Emails) ? fakeEmail(index, founder) : "",
    "Founder Name": founder,
    "LinkedIn Company": hasValue(row["LinkedIn Company"]) ? fakeLinkedInCompany(businessName) : "",
    "LinkedIn Personal": hasValue(row["LinkedIn Personal"]) ? fakeLinkedInPersonal(index, founder) : "",
    Instagram: hasValue(row.Instagram) ? fakeInstagram(index) : "",
    Facebook: hasValue(row.Facebook) ? fakeFacebook(index) : "",
    ABN: hasValue(row.ABN) ? fakeAbn(country, index, rand) : "",
    "Entity Type": preserveOrEmpty(row["Entity Type"]),
    Category: preserveOrEmpty(row.Category),
    "Lead Score": preserveOrEmpty(row["Lead Score"]),
    "Source Search": preserveOrEmpty(row["Source Search"]),
    "Research Summary": hasValue(row["Research Summary"]) ? fakeResearchSummary(index) : "",
  };
}

function summarize(label, rows) {
  const countFilled = (field) => rows.filter((r) => hasValue(r[field])).length;
  console.log(`\n${label}: ${rows.length} rows`);
  console.log(`  with email: ${countFilled("Emails")}`);
  console.log(`  with founder: ${countFilled("Founder Name")}`);
  console.log(`  with phone: ${countFilled("Phone")}`);
  console.log(`  with website: ${countFilled("Website")}`);
  console.log(`  with ABN: ${countFilled("ABN")}`);
  console.log(`  with rating: ${countFilled("Rating")}`);
}

function readCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    throw new Error(`${path.basename(filePath)}: ${parsed.errors[0].message}`);
  }
  return parsed.data;
}

function writeCsv(filePath, rows) {
  const csv = Papa.unparse(rows, { columns: CSV_COLUMNS });
  fs.writeFileSync(filePath, csv.endsWith("\n") ? csv : `${csv}\n`, "utf8");
}

function padRows(rows, country, target) {
  if (rows.length === target) return rows;
  if (rows.length > target) return rows.slice(0, target);

  const templates = rows.length ? rows : [];
  if (!templates.length) {
    throw new Error(`Cannot pad ${country} to ${target}: no template rows`);
  }

  // Seeded random sample so extra rows follow the overall fill-rate
  // and geo mix instead of cloning the score-sorted head of the file.
  const rand = mulberry32(country === "NZ" ? 0x4e5a0001 : 0x41550001);
  const out = [...rows];
  while (out.length < target) {
    const template = templates[Math.floor(rand() * templates.length)];
    out.push(anonymizeRow(template, out.length, country));
  }
  return out;
}

function processFile(sourceDir, filename, country) {
  const inputPath = path.join(sourceDir, filename);
  const outputPath = path.join(OUT_DIR, filename);
  const rows = padRows(
    readCsv(inputPath).map((row, index) => anonymizeRow(row, index, country)),
    country,
    TARGET_COUNTS[country],
  );
  writeCsv(outputPath, rows);
  summarize(filename, rows);
  console.log(`  wrote ${outputPath}`);
  return rows.length;
}

function padPublicFile(filename, country) {
  const outputPath = path.join(OUT_DIR, filename);
  const rows = padRows(readCsv(outputPath), country, TARGET_COUNTS[country]);
  writeCsv(outputPath, rows);
  summarize(filename, rows);
  console.log(`  wrote ${outputPath}`);
  return rows.length;
}

function main() {
  const { source, padOnly } = parseArgs();

  if (padOnly) {
    console.log(`Padding public dummy CSVs to ${TARGET_COUNTS.AU} AU + ${TARGET_COUNTS.NZ} NZ`);
    const au = padPublicFile("leads_au.csv", "AU");
    const nz = padPublicFile("leads_nz.csv", "NZ");
    console.log(`\nDone. Dummy dataset is ${au} AU + ${nz} NZ leads.`);
    return;
  }

  if (!fs.existsSync(source)) {
    console.error(`Source directory not found: ${source}`);
    process.exit(1);
  }

  console.log(`Anonymizing portfolio data from ${source}`);
  const au = processFile(source, "leads_au.csv", "AU");
  const nz = processFile(source, "leads_nz.csv", "NZ");
  console.log(`\nDone. Generated ${au} AU + ${nz} NZ anonymized leads.`);
}

main();
