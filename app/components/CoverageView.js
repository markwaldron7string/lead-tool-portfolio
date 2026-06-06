"use client";

import { useMemo } from "react";
import { AU_AREA_GROUPS } from "@/lib/au-areas";

const TOTAL_AREAS = 101;

// ── Area → lead matching ──────────────────────────────────────────────────────
// Returns true if the lead was scraped for this area or its city/name suggests it.

function areaMatchesLead(areaName, lead) {
  const area = areaName.toLowerCase();
  const source = (lead._source || "").toLowerCase();
  const city = (lead.city || "").toLowerCase();

  // Most reliable: the area name is in the _source field (set during scrape)
  if (source.includes(area)) return true;

  // City-level matching: lead's city appears verbatim in the area name
  if (city.length >= 3 && area.includes(city)) return true;

  // Word-level matching: significant words from the area name appear in city
  const stopWords = new Set([
    "area", "inner", "outer", "north", "south", "east", "west",
    "upper", "lower", "coast", "hills", "vale", "valley", "bay",
    "beach", "lake", "port", "central", "city", "rural",
  ]);
  const areaWords = area
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));

  if (city.length >= 3 && areaWords.some((w) => city.includes(w))) return true;

  return false;
}

// ── Coverage computation ──────────────────────────────────────────────────────

function computeCoverage(leads) {
  return AU_AREA_GROUPS.map((group) => ({
    label: group.label,
    areas: group.areas.map((areaName) => {
      const matchingLeads = leads.filter((l) => areaMatchesLead(areaName, l));
      const best = matchingLeads.reduce((max, l) => {
        const s = Number(l._score) || 0;
        return s > (Number(max?._score) || 0) ? l : max;
      }, null);

      let status = "gap";
      if (best) {
        status = (Number(best._score) || 0) >= 40 ? "covered" : "weak";
      }
      return { areaName, best, status, count: matchingLeads.length };
    }),
  }));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusDot({ status }) {
  const colors = {
    covered: "var(--green)",
    weak: "var(--amber)",
    gap: "var(--border2)",
  };
  return (
    <span style={{
      display: "inline-block",
      width: 8, height: 8,
      borderRadius: "50%",
      background: colors[status] || colors.gap,
      flexShrink: 0,
      boxShadow: status === "covered" ? "0 0 5px rgba(62,207,142,0.5)" :
        status === "weak" ? "0 0 5px rgba(232,160,69,0.4)" : "none",
    }} />
  );
}

function AreaRow({ area, onClick }) {
  const { areaName, best, status } = area;

  const statusLabel = status === "covered" ? "COVERED" : status === "weak" ? "WEAK" : "GAP";
  const statusColor = status === "covered" ? "var(--green)" :
    status === "weak" ? "var(--amber)" : "var(--muted)";

  return (
    <div
      onClick={() => onClick(areaName)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 14px",
        cursor: "pointer",
        borderBottom: "1px solid var(--border)",
        transition: "background 0.12s",
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = "var(--surface2)"; }}
      onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <StatusDot status={status} />

      {/* Area name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: "var(--text)", fontWeight: status === "gap" ? 400 : 500 }}>
          {areaName}
        </span>
      </div>

      {/* Status badge */}
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
        color: statusColor, letterSpacing: "0.08em",
        minWidth: 64, textAlign: "right", flexShrink: 0,
      }}>
        {statusLabel}
      </span>

      {/* Best lead info */}
      <div style={{ minWidth: 200, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>
        {best ? (
          <span style={{ fontSize: 12, color: status === "gap" ? "var(--muted)" : "var(--text)" }}>
            {best.title}
            <span style={{
              marginLeft: 7, fontFamily: "var(--font-mono)", fontSize: 11,
              color: statusColor,
            }}>
              {Number(best._score) || 0}
            </span>
          </span>
        ) : (
          <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
            No leads — scrape needed
          </span>
        )}
      </div>
    </div>
  );
}

// ── CoverageView ──────────────────────────────────────────────────────────────

export default function CoverageView({ leads, onAreaClick }) {
  const coverage = useMemo(() => computeCoverage(leads), [leads]);

  const stats = useMemo(() => {
    let covered = 0, weak = 0, gaps = 0;
    coverage.forEach((g) => g.areas.forEach((a) => {
      if (a.status === "covered") covered++;
      else if (a.status === "weak") weak++;
      else gaps++;
    }));
    return { covered, weak, gaps };
  }, [coverage]);

  const pct = Math.round((stats.covered / TOTAL_AREAS) * 100);

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>

      {/* ── Summary header ── */}
      <div style={{
        background: "var(--surface2)",
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--text)" }}>
          Coverage across {TOTAL_AREAS} AU areas
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: "var(--green)",
            width: `${pct}%`,
            transition: "width 0.4s ease",
          }} />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "var(--text)" }}>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{stats.covered}</strong>
              <span style={{ color: "var(--muted)" }}> / {TOTAL_AREAS} covered</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)", flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              <strong style={{ fontFamily: "var(--font-mono)", color: "var(--amber)" }}>{stats.weak}</strong> weak
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border2)", flexShrink: 0, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              <strong style={{ fontFamily: "var(--font-mono)" }}>{stats.gaps}</strong> gaps remaining
            </span>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--green)", fontWeight: 700 }}>
            {pct}%
          </div>
        </div>
      </div>

      {/* ── Area list ── */}
      <div style={{ maxHeight: "calc(100vh - 420px)", overflowY: "auto", minHeight: 200 }}>

        {/* Column header */}
        <div style={{
          display: "flex", gap: 10, padding: "6px 14px",
          background: "var(--surface2)",
          borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, zIndex: 2,
        }}>
          <div style={{ width: 8, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Area</div>
          <div style={{ minWidth: 64, fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right" }}>Status</div>
          <div style={{ minWidth: 200, fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Best lead</div>
        </div>

        {coverage.map((group) => (
          <div key={group.label}>
            {/* State group header */}
            <div style={{
              padding: "9px 14px 5px",
              fontSize: 11, fontWeight: 700,
              color: "var(--muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "var(--surface)",
              borderBottom: "1px solid var(--border)",
              position: "sticky", top: 28, zIndex: 1,
            }}>
              {group.label}
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, marginLeft: 8, fontWeight: 400, color: "var(--border2)" }}>
                {group.areas.filter(a => a.status === "covered").length}/{group.areas.length}
              </span>
            </div>

            {group.areas.map((area) => (
              <AreaRow key={area.areaName} area={area} onClick={onAreaClick} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
