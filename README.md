![CI](https://github.com/markwaldron7string/lead-tool-portfolio/actions/workflows/ci.yml/badge.svg)
![E2E](https://github.com/markwaldron7string/lead-tool-portfolio/actions/workflows/cypress.yml/badge.svg)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)](https://openai.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)](YOUR_DEMO_URL)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org)
# 🏠 Buyers Agent Lead Scraper

> A full-stack lead intelligence platform that finds, verifies, and enriches every buyers agent business across Australia and New Zealand — built for a real client in the Australian property industry.

**[→ Live Demo](https://buyersagent-leadscraper.vercel.app/)**
> **Note:** This is the public portfolio version. It runs on generated sample data, and the scraping and enrichment features are disabled. The production version, with the real client dataset, is kept private.
---

![Lead Scraper Dashboard](/public/dashboard.png)

---

## Headline Metrics

| Market | Leads | Emails | Founder Names | LinkedIn Pages | Verified (ABN/NZBN) |
|---|---|---|---|---|---|
| 🇦🇺 Australia | **5,783** | 2,066 (36%) | 2,620 (45%) | 1,741 (30%) | 4,941 (85%) |
| 🇳🇿 New Zealand | **481** | 200 (42%) | 226 (47%) | 216 (45%) | 344 (72%) |

- **101 geographic areas** covered across Australia, matched to client's territory map
- **11,494 cross-area duplicates** caught and removed automatically
- **~$25,000** in manual research labour replaced
- Built and shipped in **2 weeks**

---

## What It Does

The client sells services to buyers agents and needed a way to find and contact buyers agents in Australia. Previously this was done manually through Google Maps — hours of searching, copying, and pasting into spreadsheets.

This tool automates the entire pipeline:

```
Google Places API
      ↓
  Lead table (deduplicated, classified, scored)
      ↓
  AI Enrichment (OpenAI gpt-4o-mini)
  → founder name, email, LinkedIn, Instagram, Facebook
      ↓
  Business Register Verification
  → ABN (Australia) / NZBN (New Zealand)
      ↓
  Export CSV → outreach
```

---

## Architecture

### Stack
- **Next.js 16** (App Router) — frontend + serverless API routes in one project
- **React 19** — UI with hooks (useState, useEffect, useCallback, useRef)
- **Tailwind CSS v4** — utility-first styling
- **OpenAI gpt-4o-mini** — AI enrichment for contact and social data extraction
- **Google Places API** — live business scraping with location bias
- **Australian Business Register API** — free ABN verification
- **NZ Companies Office API** — free NZBN verification
- **Papa Parse** — client-side CSV parsing
- **Vercel** — deployment and serverless functions

### Project Structure

```
lead-tool-portfolio/
  app/
    page.js                   # Country selector (AU / NZ)
    au/page.js                # Australia leads dashboard
    nz/page.js                # New Zealand leads dashboard
    api/
      scrape/route.js         # Google Places scraper — 101 AU areas + 10 NZ cities
      enrich/route.js         # AI enrichment — website fetch + GPT extraction
      abn/route.js            # Australian Business Register lookup
      nzbn/route.js           # NZ Companies Office lookup
      research/route.js       # Deep research — on-demand GPT-4o analysis
      auth/route.js           # Password authentication (cookie-based, 30 day expiry)
    login/page.js             # Login page
  lib/
    processor.js              # Dedup, classify, score, filter, CSV export
  public/
    leads_au.csv              # AU dataset (auto-loaded on startup)
    leads_nz.csv              # NZ dataset (auto-loaded on startup)
```

### How the Classifier Works

Every lead is classified on load using a keyword-based system that runs **exclusion checks before category assignment**. The exclusion text is built from business name and Google category tags only — deliberately excluding the search term to prevent false positives.

```
Exclusion check (title + Google tags only)
  → EXCLUDED if: mortgage, loan, real estate agent, property manager, etc.
  → with no buyers agent signal to override

Category match (full text including source)
  → Investment BA / SMSF / Owner-occupier / Off-the-plan / Project sales / Property advisor

Fallback
  → Source search hint (e.g. "smsf buyers agent sydney" → SMSF)
  → Uncategorised
```

### Lead Scoring (0–100)

Each lead is scored based on data completeness:

| Signal | Points |
|---|---|
| Email address | 30 |
| Founder name | 20 |
| Website | 10 |
| Phone number | 10 |
| Google rating (4.8+) | up to 15 |
| Review count (50+) | up to 10 |
| Categorised | 5 |
| Social presence | bonus |

### AI Enrichment Pipeline

For each lead, the enrichment route:
1. Fetches homepage + contact/about page server-side
2. Extracts social URLs using **two layers**: regex scan of raw HTML + JSON-LD schema parser
3. Sends page text + pre-found social URLs to GPT as context
4. GPT returns: founder name, job title, email, LinkedIn company, LinkedIn personal, Instagram, Facebook
5. Runs ABN/NZBN lookup in parallel (two-step: name search → entity detail fetch)

Cost: ~$0.001 per lead with gpt-4o-mini. Full AU dataset (~5,700 leads) ≈ $5.70.

---

## Key Features

**In-app scraper** — no Apify or third-party scraping tools needed. Pick a search term and area, results appear in the table in real time. "Run all terms" mode cycles through all 10 search terms across all 101 AU areas automatically (~2-3 hours, hands-free).

**Coverage checklist** — maps all 101 client-specified geographic areas with green/amber/gap status. Click any area to jump to filtered leads for that area.

**Area filter** — dropdown grouped by state lets users filter to specific suburbs and regions. Partial word matching handles nested geographies (e.g. "Eastern Suburbs Sydney" returns leads from Bondi, Randwick, Paddington etc.)

**Deep research** — on-demand GPT-4o analysis of individual high-value leads. Returns specialization summary, areas covered, client type, team size, and a personalized cold call hook. ~$0.03 per lead, designed for targeted use before outreach.

**Score-based filtering** — filter to Good (40+), Great (60+), or Best (75+) instantly. Interactive tooltip explains the scoring methodology with clickable tier shortcuts.

**Column controls** — resizable by drag, toggleable via panel. New columns (LinkedIn, Instagram, ABN, Entity Type) hidden by default.

**Enrichment lockdown** — export, scraping, and CSV upload all disable during bulk enrichment to prevent data integrity issues.

**Password protection** — cookie-based auth (30-day expiry) via a login page and API route. Keeps the tool private without requiring user accounts.

---

## Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI — gpt-4o-mini enrichment + gpt-4o deep research |
| `GOOGLE_PLACES_KEY` | Google Places API — live scraping |
| `ABN_GUID` | Australian Business Register — free, register at abr.business.gov.au |
| `NZBN_API_KEY` | NZ Companies Office — free, register at api.business.govt.nz |
| `SITE_PASSWORD` | Dashboard access password |
| `NEXT_PUBLIC_DEMO_MODE` | Set to `true` to disable enrichment/scraping for portfolio demo |

---

## Running Locally

```bash
git clone https://github.com/markwaldron7string/lead-tool-portfolio
cd lead-tool-portfolio
npm install
# Add environment variables to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** Run enrichment on localhost:3000, not the Vercel deployment. Vercel serverless functions have a 10-second timeout which interrupts long enrichment runs.

---

## Cost Summary

| Service | Cost | Free tier |
|---|---|---|
| OpenAI gpt-4o-mini | ~$5.70 per full AU enrichment run | $5 signup credit |
| Google Places API | ~$17 per 1,000 searches | $200/month credit |
| ABR (ABN lookup) | Free | Unlimited |
| NZ Companies Office | Free | Unlimited |
| Vercel hosting | Free | Hobby plan |

---

## Built By

Mark Waldron — [mark-waldron.com](https://mark-waldron.com) · [LinkedIn](https://linkedin.com/in/mark-waldron-449940158)

Frontend Simplified Bootcamp · 2026
