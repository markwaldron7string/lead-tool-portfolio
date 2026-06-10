// app/api/research/route.js
// Deep research - fetches a buyer's agent website and uses GPT-4o to produce
// a qualitative analysis to help cold callers personalise their outreach.
// Separate from the /api/enrich route (which uses gpt-4o-mini for contact data).

import OpenAI from 'openai';

const CONTACT_SLUGS = [
  '/contact', '/contact-us', '/about', '/about-us',
  '/our-team', '/team', '/meet-the-team', '/who-we-are',
  '/our-story', '/people',
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-AU,en;q=0.9',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function normaliseUrl(url) {
  if (!url) return null;
  url = url.trim();
  if (!url.startsWith('http')) url = 'https://' + url;
  return url;
}

function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000); // slightly more text than enrich for richer analysis
}

// ── Page fetcher ──────────────────────────────────────────────────────────────

async function fetchPage(url, timeout = 8000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { headers: HEADERS, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();
    return { html, finalUrl: res.url };
  } catch { return null; }
}

async function getPageText(baseUrl) {
  let home = await fetchPage(baseUrl);

  // Try www prefix if direct fetch fails
  if (!home) {
    try {
      const parsed = new URL(baseUrl);
      if (!parsed.hostname.startsWith('www.')) {
        const alt = baseUrl.replace(parsed.hostname, 'www.' + parsed.hostname);
        home = await fetchPage(alt);
      }
    } catch {}
    if (!home) return null;
  }

  const finalBase = home.finalUrl || baseUrl;
  let allHtml = home.html;

  // Also fetch a contact/about page for richer content
  for (const [, href] of home.html.matchAll(/href=["']([^"']*?)["']/gi)) {
    const lower = href.toLowerCase();
    if (CONTACT_SLUGS.some(slug => lower.includes(slug))) {
      try {
        const contactUrl = new URL(href, finalBase).href;
        if (contactUrl !== finalBase) {
          const contact = await fetchPage(contactUrl);
          if (contact) allHtml += ' ' + contact.html;
        }
      } catch {}
      break;
    }
  }

  return extractText(allHtml);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { website, businessName } = await request.json();

    if (!website) {
      return Response.json({ error: 'No website provided', cold_call_hook: null }, { status: 400 });
    }

    const url = normaliseUrl(website);
    if (!url) {
      return Response.json({ error: 'Invalid URL', cold_call_hook: null }, { status: 400 });
    }

    const pageText = await getPageText(url);
    if (!pageText) {
      return Response.json({ error: 'Could not fetch website', cold_call_hook: null });
    }

    const prompt = `You are analysing an Australian buyers agent business website to help a sales person personalise their outreach.

Business: ${businessName}
Website content: ${pageText}

Provide a structured analysis in valid JSON only:
{
  "summary": "2-3 sentence overview of what this business does",
  "specialisation": "Their main focus e.g. investment, SMSF, first home, owner-occupier, off-market",
  "areas_covered": "Geographic areas they serve based on website content",
  "price_range": "Typical property price range they work with if mentioned",
  "client_type": "Who their typical client is e.g. interstate investors, first home buyers, SMSF trustees",
  "team_size": "Solo operator or team - estimate from website if possible",
  "differentiator": "What makes them unique or their key selling point",
  "tone": "Professional tone - e.g. corporate, boutique, personal, data-driven",
  "cold_call_hook": "One sentence personalised conversation starter for a cold caller"
}`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.3,
    });

    const raw = (response.choices[0]?.message?.content || '').trim();
    try {
      const clean = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      return Response.json(JSON.parse(clean));
    } catch {
      return Response.json({ error: 'Could not parse AI response', cold_call_hook: null });
    }

  } catch (err) {
    console.error('Research error:', err);
    return Response.json({ error: err.message, cold_call_hook: null }, { status: 500 });
  }
}
