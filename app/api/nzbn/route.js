// app/api/nzbn/route.js
// Looks up New Zealand Business Number (NZBN) using the NZBN API v5.
// Requires: NZBN_API_KEY in .env.local
// Get your key at: https://developer.business.govt.nz/

const NZBN_URL = 'https://api.business.govt.nz/gateway/nzbn/v5/entities';


function formatNZBN(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length !== 13) return digits;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)} ${digits.slice(10)}`;
}

function cleanName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\blimited\b|\bltd\b|\btrading\b|\btrust\b|\bgroup\b/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchScore(query, candidate) {
  const a = cleanName(query);
  const b = cleanName(candidate);
  if (!a || !b) return 0;
  if (b === a) return 1;
  if (b.includes(a) || a.includes(b)) return 0.9;
  const wordsA = new Set(a.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(b.split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  return overlap / Math.max(wordsA.size, wordsB.size);
}

async function searchNZBN(businessName, apiKey) {
  const params = new URLSearchParams({
    'search-term': businessName.slice(0, 100),
    'entity-status': 'REGISTERED',
  });
  const url = `${NZBN_URL}?${params}`;
  const res = await fetch(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`NZBN API returned ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function parseNZBNResponse(data, businessName) {
  const items = data?.items;
  if (!items?.length) return null;

  let best = null;
  let bestScore = 0;

  for (const item of items) {
    // API uses numeric status codes; "Registered" is the description for active entities
    if (item.entityStatusDescription && item.entityStatusDescription !== 'Registered') continue;

    const score = matchScore(businessName, item.entityName || '');
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  if (!best || bestScore < 0.3) return null;

  const entityCode = best.entityTypeCode || '';
  // entityTypeDescription is already human-readable (e.g. "NZ Limited Company")
  const entityType = best.entityTypeDescription || entityCode || '';

  return {
    abn: formatNZBN(best.nzbn),
    abn_raw: best.nzbn,
    entity_type: entityType,
    entity_code: entityCode,
    matched_name: best.entityName,
    match_score: Math.round(bestScore * 100),
  };
}

export async function POST(request) {
  try {
    const { businessName } = await request.json();

    if (!businessName?.trim()) {
      return Response.json({ error: 'No business name provided' }, { status: 400 });
    }

    if (!process.env.NZBN_API_KEY) {
      return Response.json({ abn: null, entity_type: null }, { status: 200 });
    }

    const data = await searchNZBN(businessName.trim(), process.env.NZBN_API_KEY);
    const result = parseNZBNResponse(data, businessName.trim());

    if (!result) {
      return Response.json({ abn: null, entity_type: null });
    }

    return Response.json(result);
  } catch (err) {
    console.error('NZBN lookup error:', err.message);
    return Response.json({ abn: null, entity_type: null, error: err.message });
  }
}
