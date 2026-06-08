"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { classify } from "@/lib/processor";
import { AU_AREA_GROUPS, AU_AREA_NAMES } from "@/lib/au-areas";
import { DEMO_MODE, DemoDisabled } from "@/app/components/DemoDisabled";

// Country template → page route
const TEMPLATE_ROUTES = { AU: "/au", NZ: "/nz" };

// ── Template data ─────────────────────────────────────────────────────────────

export const TEMPLATES = {
  AU: {
    label: "🇦🇺 Australia",
    terms: [
      "Buyers Agent",
      "Buyers Advocate",
      "Property Buyers Agency",
      "Investment Buyers Agent",
      "SMSF Buyers Agent",
      "Property Advisor",
      "Property Acquisition",
      "Property Strategist",
      "Off The Plan Buyers Agent",
      "Buyers Agent First Home",
    ],
    cities: AU_AREA_NAMES,
  },
  NZ: {
    label: "🇳🇿 New Zealand",
    terms: [
      "Buyers Agent",
      "Buyers Advocate",
      "Property Buyers Agency",
      "Investment Buyers Agent",
      "Property Advisor",
      "Property Acquisition",
      "Property Strategist",
      "Buyers Agent First Home",
      "Property Consultant",
      "Buyers Agent Residential",
    ],
    cities: [
      "Auckland", "Wellington", "Christchurch", "Hamilton",
      "Tauranga", "Dunedin", "Palmerston North", "Nelson",
      "Rotorua", "New Plymouth",
    ],
  },
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Preview table ─────────────────────────────────────────────────────────────

function PreviewTable({ newLeads, onViewInTable }) {
  if (!newLeads || newLeads.length === 0) return null;
  const display = newLeads.slice(0, 20);
  const overflow = newLeads.length - display.length;

  return (
    <div data-cy="scrape-preview" style={{ marginTop: 12 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          New leads preview - {newLeads.length} added
        </div>
        {onViewInTable && (
          <button
            data-cy="view-in-table"
            onClick={onViewInTable}
            style={{
              background: "none", border: "1px solid var(--border)",
              color: "var(--green)", borderRadius: 5, padding: "4px 10px",
              fontSize: 12, cursor: "pointer", transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--green)"; e.currentTarget.style.background = "rgba(62,207,142,0.08)"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "none"; }}
          >
            View all in table ↓
          </button>
        )}
      </div>
      <div style={{
        border: "1px solid var(--border)", borderRadius: 7,
        overflow: "hidden", maxHeight: 300, overflowY: "auto",
      }}>
        <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse", fontSize: 12 }}>
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "24%" }} />
          </colgroup>
          <thead>
            <tr style={{ background: "var(--surface2)" }}>
              {["Business Name", "City", "State", "Phone", "Category"].map((h) => (
                <th key={h} style={{
                  padding: "7px 10px", textAlign: "left", fontSize: 11,
                  color: "var(--muted)", fontWeight: 500, letterSpacing: "0.03em",
                  borderBottom: "1px solid var(--border)", position: "sticky", top: 0,
                  background: "var(--surface2)",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {display.map((lead, i) => (
              <tr key={i} style={{ borderBottom: i < display.length - 1 ? "1px solid var(--border)" : "none" }}>
                <td style={{ padding: "6px 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500, color: "var(--text)" }} title={lead.title}>
                  {lead.title}
                </td>
                <td style={{ padding: "6px 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--muted)" }}>
                  {lead.city || "-"}
                </td>
                <td style={{ padding: "6px 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  {lead.state || "-"}
                </td>
                <td style={{ padding: "6px 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)" }}>
                  {lead.phone || "-"}
                </td>
                <td style={{ padding: "6px 10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{
                    fontSize: 11, borderRadius: 4, padding: "2px 7px",
                    background: lead._category === "EXCLUDED" ? "rgba(224,82,82,0.12)" :
                      lead._category === "Uncategorised" ? "rgba(100,100,110,0.15)" :
                        "rgba(62,207,142,0.12)",
                    color: lead._category === "EXCLUDED" ? "var(--red)" :
                      lead._category === "Uncategorised" ? "var(--muted)" :
                        "var(--green)",
                  }}>
                    {lead._category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {overflow > 0 && (
          <div style={{
            padding: "8px 10px", fontSize: 12, color: "var(--muted)",
            borderTop: "1px solid var(--border)", background: "var(--surface)",
            fontStyle: "italic",
          }}>
            …and {overflow} more leads
          </div>
        )}
      </div>
    </div>
  );
}

// ── ScrapePanel ───────────────────────────────────────────────────────────────

export default function ScrapePanel({
  onLeadsFound,
  cities,          // city list used in custom mode
  country,         // "AU" | "NZ" - sets default template
  countryName,
  defaultOpen = false,
  onViewInTable,   // optional: called when "View all in table" is clicked
  disabled = false, // true during bulk enrichment - collapses and locks the panel
}) {
  const router = useRouter();
  const initTemplate = TEMPLATES[country] ? country : "AU";

  const [templateKey, setTemplateKey] = useState(initTemplate);
  const isCustom = templateKey === "CUSTOM";
  const template = TEMPLATES[templateKey];

  // Term state
  const [templateTerm, setTemplateTerm] = useState(
    () => TEMPLATES[initTemplate].terms[0]
  );
  const [customTerm, setCustomTerm] = useState("buyers agent");
  const [useCustomInput, setUseCustomInput] = useState(false);

  // City state
  const [templateCity, setTemplateCity] = useState(
    () => TEMPLATES[initTemplate].cities[0]
  );
  const [customCity, setCustomCity] = useState(
    () => (cities && cities[0]) || ""
  );

  const [maxResults, setMaxResults] = useState(60);
  const [allCities, setAllCities] = useState(false);
  const [open, setOpen] = useState(defaultOpen);

  // Collapse panel when bulk enrichment starts
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  // Progress / result state
  const [scraping, setScraping] = useState(false);
  const [allTermsRunning, setAllTermsRunning] = useState(false);
  const [termProgress, setTermProgress] = useState(null);
  const [cityProgress, setCityProgress] = useState(null);
  const [runTotals, setRunTotals] = useState(null);
  const [result, setResult] = useState(null);
  const [runSummary, setRunSummary] = useState(null);
  const [error, setError] = useState("");
  const cancelRef = useRef(false);

  // Preview state
  const [newLeadsPreview, setNewLeadsPreview] = useState(null);

  // Run-all-terms warning (AU has 101 areas × 10 terms = 1010 calls)
  const [showRunAllConfirm, setShowRunAllConfirm] = useState(false);

  // Derived
  const activeTerm = isCustom ? customTerm : templateTerm;
  const activeCities = isCustom ? (cities || []) : (template?.cities || []);
  const activeCity = isCustom ? customCity : templateCity;
  const isRunning = scraping || allTermsRunning;

  function handleTemplateChange(key) {
    if (TEMPLATE_ROUTES[key] && key !== country) {
      router.push(TEMPLATE_ROUTES[key]);
      return;
    }
    setTemplateKey(key);
    if (TEMPLATES[key]) {
      setTemplateTerm(TEMPLATES[key].terms[0]);
      setTemplateCity(TEMPLATES[key].cities[0]);
    }
    setResult(null);
    setError("");
    setRunSummary(null);
    setRunTotals(null);
    setAllCities(false);
    setUseCustomInput(false);
    setNewLeadsPreview(null);
    setShowRunAllConfirm(false);
  }

  async function runCity(term, targetCity) {
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchTerm: term, city: targetCity, maxResults, country }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Scrape failed");
    const classified = (data.leads || []).map((lead) => ({
      ...lead,
      _category: classify(lead, lead._source || ""),
    }));
    return onLeadsFound(classified); // returns { added, duplicates, newLeads }
  }

  async function handleScrape() {
    const term = activeTerm?.trim();
    if (!term) return;
    setScraping(true);
    setResult(null);
    setError("");
    setRunSummary(null);
    setNewLeadsPreview(null);
    cancelRef.current = false;

    const citiesForRun = allCities ? activeCities : [activeCity];
    let totalAdded = 0, totalDupes = 0, totalFound = 0;
    const allNewLeads = [];

    for (let i = 0; i < citiesForRun.length; i++) {
      if (cancelRef.current) break;
      const city = citiesForRun[i];
      if (allCities) setCityProgress({ current: i + 1, total: citiesForRun.length, city });

      try {
        const { added, duplicates, newLeads: cityNewLeads = [] } = await runCity(term, city);
        totalAdded += added;
        totalDupes += duplicates;
        totalFound += added + duplicates;
        allNewLeads.push(...cityNewLeads);
      } catch (err) {
        if (!allCities) {
          setError(
            err.message.includes("GOOGLE_PLACES_KEY")
              ? "⚠ Google Places API key not configured. Add GOOGLE_PLACES_KEY to .env.local."
              : `Error: ${err.message}`
          );
          setScraping(false);
          setCityProgress(null);
          return;
        }
        console.warn(`Scrape skipped for ${city}:`, err.message);
      }

      if (i < citiesForRun.length - 1 && !cancelRef.current) await sleep(2000);
    }

    setCityProgress(null);
    setResult({ found: totalFound, added: totalAdded, duplicates: totalDupes });
    setNewLeadsPreview(allNewLeads.length > 0 ? allNewLeads : null);
    setScraping(false);
  }

  async function handleRunAllTerms() {
    if (!template) return;
    const { terms, cities: termCities } = template;

    setAllTermsRunning(true);
    setScraping(false);
    setResult(null);
    setRunSummary(null);
    setError("");
    setNewLeadsPreview(null);
    setRunTotals({ added: 0, dupes: 0, found: 0 });
    cancelRef.current = false;

    let totalAdded = 0, totalDupes = 0, totalFound = 0;
    const allRunNewLeads = [];

    for (let ti = 0; ti < terms.length; ti++) {
      if (cancelRef.current) break;
      const term = terms[ti];
      setTermProgress({ current: ti + 1, total: terms.length, term });

      for (let ci = 0; ci < termCities.length; ci++) {
        if (cancelRef.current) break;
        const city = termCities[ci];
        setCityProgress({ current: ci + 1, total: termCities.length, city });

        try {
          const { added, duplicates, newLeads: cityNewLeads = [] } = await runCity(term, city);
          totalAdded += added;
          totalDupes += duplicates;
          totalFound += added + duplicates;
          allRunNewLeads.push(...cityNewLeads);
          setRunTotals({ added: totalAdded, dupes: totalDupes, found: totalFound });
        } catch (err) {
          console.warn(`Failed: "${term}" / ${city}:`, err.message);
        }

        if (ci < termCities.length - 1 && !cancelRef.current) await sleep(2000);
      }

      if (ti < terms.length - 1 && !cancelRef.current) await sleep(3000);
    }

    setTermProgress(null);
    setCityProgress(null);
    setAllTermsRunning(false);
    setNewLeadsPreview(allRunNewLeads.length > 0 ? allRunNewLeads : null);

    if (!cancelRef.current) {
      setRunSummary({ added: totalAdded, dupes: totalDupes, found: totalFound });
    }
    cancelRef.current = false;
  }

  function handleCancel() {
    cancelRef.current = true;
    setScraping(false);
    setAllTermsRunning(false);
    setTermProgress(null);
    setCityProgress(null);
  }

  function handleViewInTableClick() {
    setOpen(false);
    onViewInTable?.();
  }

  // How many total API calls for "Run all terms"
  const runAllCallCount = template ? template.terms.length * template.cities.length : 0;
  const isAU = templateKey === "AU";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div data-cy="scrape-panel" style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      marginBottom: 16,
      overflow: "hidden",
    }}>
      {/* ── Header / toggle ── */}
      <div
        data-cy="scrape-panel-toggle"
        onClick={() => !isRunning && !disabled && setOpen((o) => !o)}
        title={disabled ? "Scraping disabled during enrichment" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 18px",
          cursor: isRunning || disabled ? "default" : "pointer",
          borderBottom: open ? "1px solid var(--border)" : "none",
          opacity: disabled ? 0.4 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: disabled ? "var(--muted)" : isRunning ? "var(--amber)" : "var(--green)",
            boxShadow: disabled ? "none" : isRunning ? "0 0 6px var(--amber)" : "0 0 6px var(--green)",
            flexShrink: 0,
          }} />
          <div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Scrape new leads</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginLeft: 10 }}>
              Google Places API
            </span>
            {disabled && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--amber)", marginLeft: 10 }}>
                disabled during enrichment
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {result && !allTermsRunning && (
            <span style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--font-mono)" }}>
              +{result.added} leads added
            </span>
          )}
          {runTotals && allTermsRunning && (
            <span style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--font-mono)" }}>
              +{runTotals.added} so far
            </span>
          )}
          {!isRunning && !disabled && (
            <span style={{ color: "var(--muted)", fontSize: 16 }}>{open ? "−" : "+"}</span>
          )}
        </div>
      </div>

      {open && (
        <div style={{ padding: "16px 18px" }}>

          {/* ── Country selector ── */}
          <div style={{ marginBottom: 14, opacity: scraping ? 0.4 : 1, pointerEvents: scraping ? "none" : "auto", transition: "opacity 0.2s ease" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Country
            </div>
            <select
              data-cy="country-select"
              value={templateKey}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={isRunning}
              style={{ width: "100%", maxWidth: 340 }}
            >
              {Object.entries(TEMPLATES).map(([key, t]) => (
                <option key={key} value={key}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* ── Controls row ── */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>

            {/* Term selector */}
            {isCustom ? (
              <div style={{ flex: "1 1 200px", opacity: scraping ? 0.4 : 1, pointerEvents: scraping ? "none" : "auto", transition: "opacity 0.2s ease" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Search term
                </div>
                <input
                  data-cy="search-term-input"
                  type="text"
                  value={customTerm}
                  onChange={(e) => setCustomTerm(e.target.value)}
                  placeholder="e.g. buyers agent"
                  disabled={isRunning}
                  style={{ width: "100%" }}
                />
              </div>
            ) : (
              <div style={{ flex: "1 1 200px", opacity: scraping ? 0.4 : 1, pointerEvents: scraping ? "none" : "auto", transition: "opacity 0.2s ease" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Search term
                </div>
                <select
                  data-cy="search-term-select"
                  value={templateTerm}
                  onChange={(e) => setTemplateTerm(e.target.value)}
                  disabled={isRunning}
                  style={{ width: "100%" }}
                >
                  {template.terms.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            {/* City selector - hidden when all cities toggled */}
            {!allCities && (
              <div style={{ flex: "0 1 220px", opacity: scraping ? 0.4 : 1, pointerEvents: scraping ? "none" : "auto", transition: "opacity 0.2s ease" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Area
                </div>
                {isCustom ? (
                  <select
                    data-cy="area-select"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    disabled={isRunning}
                    style={{ width: "100%" }}
                  >
                    {(cities || []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : isAU ? (
                  /* AU: grouped by state with optgroups */
                  <select
                    data-cy="area-select"
                    value={templateCity}
                    onChange={(e) => setTemplateCity(e.target.value)}
                    disabled={isRunning}
                    style={{ width: "100%" }}
                  >
                    {AU_AREA_GROUPS.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.areas.map((area) => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  /* NZ: flat list */
                  <select
                    data-cy="area-select"
                    value={templateCity}
                    onChange={(e) => setTemplateCity(e.target.value)}
                    disabled={isRunning}
                    style={{ width: "100%" }}
                  >
                    {template.cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Max results */}
            <div style={{ flex: "0 1 120px", opacity: scraping ? 0.4 : 1, pointerEvents: scraping ? "none" : "auto", transition: "opacity 0.2s ease" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Max / area
              </div>
              <select
                data-cy="max-results-select"
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                disabled={isRunning}
                style={{ width: "100%" }}
              >
                <option value={20}>20</option>
                <option value={40}>40</option>
                <option value={60}>60</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Action buttons */}
            <div style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap" }}>
              {/* All areas toggle */}
              <button
                data-cy="all-areas-button"
                onClick={() => setAllCities((a) => !a)}
                disabled={isRunning}
                style={{
                  background: allCities ? "rgba(62,207,142,0.15)" : "transparent",
                  border: `1px solid ${allCities ? "var(--green)" : "var(--border)"}`,
                  color: allCities ? "var(--green)" : "var(--muted)",
                  borderRadius: 7,
                  padding: "9px 14px",
                  fontSize: 12,
                  cursor: isRunning ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  opacity: scraping ? 0.4 : 1,
                  pointerEvents: scraping ? "none" : "auto",
                }}
              >
                {allCities ? `✓ All ${activeCities.length} areas` : "All areas"}
              </button>

              {/* Scrape button - only ever starts a scrape, never cancels */}
              {DEMO_MODE ? (
                <DemoDisabled>
                  <button style={{
                    background: "var(--green)", color: "#0a0a0b", fontWeight: 600, fontSize: 13,
                    padding: "9px 20px", borderRadius: 7, display: "flex", alignItems: "center",
                    gap: 7, border: "none", whiteSpace: "nowrap",
                  }}>
                    {allCities ? `⬇ Scrape all ${activeCities.length} areas` : "⬇ Scrape leads"}
                  </button>
                </DemoDisabled>
              ) : (
                <button
                  data-cy="scrape-button"
                  onClick={handleScrape}
                  disabled={isRunning || !activeTerm?.trim()}
                  style={{
                    background: isRunning ? "var(--surface2)" : "var(--green)",
                    color: isRunning ? "var(--muted)" : "#0a0a0b",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "9px 20px",
                    borderRadius: 7,
                    cursor: isRunning || !activeTerm?.trim() ? "not-allowed" : "pointer",
                    opacity: isRunning || !activeTerm?.trim() ? 0.55 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    border: "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  {scraping && !allTermsRunning ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 12 12" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
                        <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 8" />
                      </svg>
                      Scraping…
                    </>
                  ) : allCities
                    ? `⬇ Scrape all ${activeCities.length} areas`
                    : "⬇ Scrape leads"}
                </button>
              )}

              {/* Separate Cancel button - shown only while a single scrape is in progress */}
              {scraping && !allTermsRunning && (
                <button
                  data-cy="scrape-cancel-button"
                  onClick={handleCancel}
                  style={{
                    background: "var(--surface2)",
                    color: "var(--red)",
                    fontWeight: 600,
                    fontSize: 13,
                    padding: "9px 16px",
                    borderRadius: 7,
                    cursor: "pointer",
                    border: "1px solid var(--border)",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  Cancel
                </button>
              )}

              {/* Run all terms (template mode only) */}
              {!isCustom && (
                DEMO_MODE ? (
                  <DemoDisabled>
                    <button style={{
                      background: "rgba(167,139,250,0.15)", color: "#a78bfa", fontWeight: 600,
                      fontSize: 13, padding: "9px 16px", borderRadius: 7, display: "flex",
                      alignItems: "center", gap: 7,
                      border: "1px solid rgba(167,139,250,0.3)", whiteSpace: "nowrap",
                    }}>
                      ⚡ Run all {template.terms.length} terms
                    </button>
                  </DemoDisabled>
                ) : (
                  <button
                    data-cy="run-all-terms-button"
                    onClick={allTermsRunning ? handleCancel : () => {
                      if (isAU) {
                        setShowRunAllConfirm(true);
                      } else {
                        handleRunAllTerms();
                      }
                    }}
                    disabled={!allTermsRunning && scraping}
                    style={{
                      background: allTermsRunning ? "var(--surface2)" : "rgba(167,139,250,0.15)",
                      color: allTermsRunning ? "var(--red)" : "#a78bfa",
                      fontWeight: 600,
                      fontSize: 13,
                      padding: "9px 16px",
                      borderRadius: 7,
                      cursor: (!allTermsRunning && scraping) ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      border: `1px solid ${allTermsRunning ? "var(--border)" : "rgba(167,139,250,0.3)"}`,
                      whiteSpace: "nowrap",
                      transition: "all 0.15s",
                      opacity: !allTermsRunning && scraping ? 0.4 : 1,
                    }}
                  >
                    {allTermsRunning ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 12 12" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
                          <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 8" />
                        </svg>
                        Cancel
                      </>
                    ) : (
                      `⚡ Run all ${template.terms.length} terms`
                    )}
                  </button>
                )
              )}
            </div>
          </div>

          {/* ── Run all terms warning (AU) ── */}
          {showRunAllConfirm && !isRunning && (
            <div style={{
              background: "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.3)",
              borderRadius: 8,
              padding: "14px 16px",
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#a78bfa", marginBottom: 6 }}>
                ⚡ Run all {template?.terms.length} terms across {template?.cities.length} areas?
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
                This will run <strong style={{ color: "var(--text)" }}>{template?.terms.length} search terms</strong> across{" "}
                <strong style={{ color: "var(--text)" }}>{template?.cities.length} areas</strong> (~{runAllCallCount.toLocaleString()} searches).{" "}
                Estimated time: <strong style={{ color: "var(--amber)" }}>2–3 hours</strong>.{" "}
                Keep this tab open while it runs.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  data-cy="run-all-confirm-cancel"
                  onClick={() => setShowRunAllConfirm(false)}
                  style={{
                    background: "var(--surface2)", border: "1px solid var(--border)",
                    color: "var(--text)", borderRadius: 6, padding: "8px 16px",
                    fontSize: 13, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  data-cy="run-all-confirm-continue"
                  onClick={() => { setShowRunAllConfirm(false); handleRunAllTerms(); }}
                  style={{
                    background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.4)",
                    color: "#a78bfa", borderRadius: 6, padding: "8px 16px",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ── "Run all terms" progress ── */}
          {allTermsRunning && (termProgress || cityProgress) && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                <span>
                  {termProgress && (
                    <>
                      Term <strong style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>{termProgress.current}</strong> of{" "}
                      <strong style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}>{termProgress.total}</strong>
                      {" "}-{" "}
                      <em style={{ color: "var(--text)", fontStyle: "normal" }}>{termProgress.term}</em>
                    </>
                  )}
                  {cityProgress && (
                    <>
                      {" "}- Scraping{" "}
                      <strong style={{ color: "var(--text)" }}>{cityProgress.city}</strong>…
                      {" "}Area{" "}
                      <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>{cityProgress.current}</strong> of{" "}
                      <strong style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>{cityProgress.total}</strong>
                    </>
                  )}
                </span>
              </div>
              {termProgress && (
                <div style={{ height: 3, background: "var(--surface2)", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                  <div style={{
                    height: "100%", background: "#a78bfa", borderRadius: 99,
                    width: `${(termProgress.current / termProgress.total) * 100}%`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              )}
              {cityProgress && (
                <div style={{ height: 3, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", background: "var(--green)", borderRadius: 99,
                    width: `${(cityProgress.current / cityProgress.total) * 100}%`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              )}
              {runTotals && (
                <div style={{ marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: "var(--green)", fontFamily: "var(--font-mono)" }}>
                    +{runTotals.added} new leads
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    {runTotals.dupes} dupes skipped
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Single-term area progress bar ── */}
          {scraping && !allTermsRunning && cityProgress && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 5 }}>
                <span>
                  Scraping <strong style={{ color: "var(--text)" }}>{cityProgress.city}</strong>…
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  {cityProgress.current} / {cityProgress.total}
                </span>
              </div>
              <div style={{ height: 3, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: "var(--green)", borderRadius: 99,
                  width: `${(cityProgress.current / cityProgress.total) * 100}%`,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          )}

          {/* ── Help text ── */}
          {!isRunning && !runSummary && !showRunAllConfirm && (
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
              {isCustom
                ? "Run the same search term across multiple areas for full national coverage."
                : allCities
                ? `Will scrape "${activeTerm}" across all ${activeCities.length} ${countryName} areas. Duplicates removed automatically.`
                : `Select a term and area, or use All areas / Run all terms for full coverage.`}
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div data-cy="scrape-error" style={{
              background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.3)",
              borderRadius: 7, padding: "10px 14px", fontSize: 13, color: "var(--red)", marginTop: 8,
            }}>
              {error}
            </div>
          )}

          {/* ── Single scrape result ── */}
          {result && !runSummary && (
            <div data-cy="scrape-result" style={{
              background: "rgba(62,207,142,0.08)", border: "1px solid rgba(62,207,142,0.2)",
              borderRadius: 7, padding: "10px 14px", fontSize: 13, marginTop: 8,
              display: "flex", gap: 20, flexWrap: "wrap",
            }}>
              <span style={{ color: "var(--green)" }}>
                <strong style={{ fontFamily: "var(--font-mono)" }}>+{result.added}</strong> new leads added
              </span>
              <span style={{ color: "var(--muted)" }}>
                <strong style={{ fontFamily: "var(--font-mono)" }}>{result.duplicates}</strong> duplicates skipped
              </span>
              <span style={{ color: "var(--muted)" }}>
                <strong style={{ fontFamily: "var(--font-mono)" }}>{result.found}</strong> total found
              </span>
            </div>
          )}

          {/* ── Run all terms summary ── */}
          {runSummary && (
            <div style={{
              background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)",
              borderRadius: 7, padding: "14px 16px", marginTop: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#a78bfa", marginBottom: 8 }}>
                ⚡ Full run complete
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 10 }}>
                <span style={{ color: "var(--green)", fontSize: 13 }}>
                  <strong style={{ fontFamily: "var(--font-mono)" }}>+{runSummary.added}</strong> new leads
                </span>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>
                  <strong style={{ fontFamily: "var(--font-mono)" }}>{runSummary.dupes}</strong> duplicates skipped
                </span>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>
                  <strong style={{ fontFamily: "var(--font-mono)" }}>{runSummary.found}</strong> total found
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                💡 Tip: Export your CSV now before running enrichment - enrichment can take a while and you won&apos;t lose your data.
              </div>
            </div>
          )}

          {/* ── Preview table ── */}
          <PreviewTable
            newLeads={newLeadsPreview}
            onViewInTable={onViewInTable ? handleViewInTableClick : null}
          />

        </div>
      )}
    </div>
  );
}
