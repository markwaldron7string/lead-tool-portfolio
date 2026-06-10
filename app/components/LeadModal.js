"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  getScoreColor,
  getGoogleRatingColor,
  formatGoogleRating,
  getFieldColor,
  formatSocialLabel,
  formatWebsiteLabel,
} from "@/lib/lead-display";
import { getLeadArea, getMapUrlForLead } from "@/lib/lead-utils";
import { buildAuMapUrl } from "@/lib/au-map-nav";
import { buildNzMapUrl } from "@/lib/nz-map-nav";

function hasFieldValue(value) {
  if (value == null) return false;
  if (typeof value === "number") return !Number.isNaN(value);
  return String(value).trim() !== "";
}

function FieldRow({ label, value, color, isLink, linkType, mono, theme }) {
  const dark = theme !== "light";
  const M = {
    rowDiv: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    muted:  dark ? "#6b7280" : "#6a6a74",
    text:   dark ? "#efefef" : "#17171c",
  };
  const display = typeof value === "number" ? String(value) : String(value);

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "8px 0", borderBottom: `1px solid ${M.rowDiv}`, gap: 12,
    }}>
      <span style={{ fontSize: 12, color: M.muted, flexShrink: 0 }}>{label}</span>
      {isLink ? (
        <a
          href={display.startsWith("http") ? display : `https://${display}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12,
            color: color || "var(--blue)",
            textDecoration: "none",
            textAlign: "right",
            wordBreak: "break-all",
            fontFamily: mono ? "var(--font-mono)" : undefined,
          }}
        >
          {linkType === "website" ? formatWebsiteLabel(display) : formatSocialLabel(display)}
        </a>
      ) : (
        <span style={{
          fontSize: 12,
          color: color || M.text,
          textAlign: "right",
          wordBreak: "break-all",
          fontFamily: mono ? "var(--font-mono)" : undefined,
        }}>
          {display}
        </span>
      )}
    </div>
  );
}

export default function LeadModal({
  lead,
  takenLeads,
  onMarkLead,
  onClose,
  isAU = false,
  country: countryProp,
  theme = "dark",
  showMapButton = true,
}) {
  const dark = theme !== "light";
  const country = countryProp || (isAU ? "AU" : "");
  const hasMap = country === "AU" || country === "NZ";
  const isTaken = takenLeads.includes(lead.title);
  const score = Number(lead._score) || 0;
  const leadArea = hasMap ? getLeadArea(lead, country) : null;

  const M = {
    bg:        dark ? "#0f0f11"                    : "#ffffff",
    border:    dark ? "rgba(255,255,255,0.12)"     : "rgba(0,0,0,0.10)",
    divider:   dark ? "rgba(255,255,255,0.08)"     : "rgba(0,0,0,0.08)",
    text:      dark ? "#efefef"                    : "#17171c",
    muted:     dark ? "#6b7280"                    : "#6a6a74",
    catBg:     dark ? "rgba(255,255,255,0.07)"     : "rgba(0,0,0,0.06)",
    catText:   dark ? "#9ca3af"                    : "#6a6a74",
    shadow:    dark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 24px 60px rgba(0,0,0,0.15)",
    mapBorder: dark ? "rgba(255,255,255,0.15)"     : "rgba(0,0,0,0.15)",
    mapBorderHover: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
  };

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fields = [
    { label: "Score", key: "_score", value: score > 0 ? score : null, color: getScoreColor(score), mono: true },
    { label: "Business", key: "title", value: lead.title },
    { label: "Phone", key: "phone", value: lead.phone, mono: true },
    { label: "City", key: "city", value: lead.city, color: getFieldColor("city") },
    { label: "State", key: "state", value: lead.state, color: getFieldColor("state") },
    {
      label: "Rating",
      key: "totalScore",
      value: formatGoogleRating(lead.totalScore) || null,
      color: getGoogleRatingColor(lead.totalScore),
      mono: true,
    },
    { label: "Reviews", key: "reviewsCount", value: lead.reviewsCount, mono: true },
    { label: "Category", key: "_category", value: lead._category },
    { label: "Website", key: "website", value: lead.website, isLink: true, linkType: "website", color: getFieldColor("website") },
    {
      label: "Email",
      key: "emails",
      value: lead.emails?.split(",")[0]?.trim(),
      color: getFieldColor("emails"),
      mono: true,
    },
    { label: "Founder", key: "founder_name", value: lead.founder_name },
    {
      label: "LinkedIn Co.",
      key: "linkedin_company",
      value: lead.linkedin_company,
      isLink: true,
      color: getFieldColor("linkedin_company"),
    },
    {
      label: "LinkedIn Person",
      key: "linkedin_personal",
      value: lead.linkedin_personal,
      isLink: true,
      color: getFieldColor("linkedin_personal"),
    },
    {
      label: "Instagram",
      key: "instagram",
      value: lead.instagram,
      isLink: true,
      color: getFieldColor("instagram"),
    },
    { label: "ABN", key: "abn", value: lead.abn, mono: true },
    { label: "Entity type", key: "entity_type", value: lead.entity_type },
  ].filter((f) => hasFieldValue(f.value));

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: dark ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.40)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: M.bg,
          border: `1px solid ${M.border}`,
          borderRadius: 12,
          width: "100%", maxWidth: 500,
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
          fontFamily: "system-ui, sans-serif",
          boxShadow: M.shadow,
        }}
      >
        <div style={{ padding: "16px 18px 12px", borderBottom: `1px solid ${M.divider}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: M.text, lineHeight: 1.3, flex: 1 }}>
              {isTaken && <span style={{ color: "var(--green)", marginRight: 7, fontSize: 13 }}>✓</span>}
              {lead.title}
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: M.muted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0 }}
              onMouseOver={(e) => (e.currentTarget.style.color = M.text)}
              onMouseOut={(e) => (e.currentTarget.style.color = M.muted)}
            >
              ✕
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: getScoreColor(score) }}>
              {score}
            </span>
            {lead._category && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: M.catBg, color: M.catText }}>
                {lead._category}
              </span>
            )}
            {leadArea && (
              <span style={{ fontSize: 11, color: M.muted }}>{leadArea}</span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "4px 18px 8px" }}>
          {fields.map(({ label, value, color, isLink, linkType, mono }) => (
            <FieldRow
              key={label}
              label={label}
              value={value}
              color={color}
              isLink={isLink}
              linkType={linkType}
              mono={mono}
              theme={theme}
            />
          ))}
        </div>

        <div style={{ padding: "12px 18px 16px", borderTop: `1px solid ${M.divider}`, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => onMarkLead(lead.title, !isTaken)}
            style={{
              width: "100%", padding: 9,
              background: isTaken ? "rgba(75,85,99,0.15)" : "rgba(34,197,94,0.1)",
              border: `1px solid ${isTaken ? "rgba(75,85,99,0.35)" : "rgba(34,197,94,0.3)"}`,
              borderRadius: 7, cursor: "pointer",
              color: isTaken ? M.muted : "var(--green)",
              fontWeight: 600, fontSize: 13, transition: "all 0.15s",
            }}
            onMouseOver={(e) => { e.currentTarget.style.opacity = "0.8"; }}
            onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {isTaken ? "✓ Complete" : "Mark as complete"}
          </button>
          {hasMap && showMapButton && (
            <button
              onClick={() => {
                const fallback = country === "NZ" ? buildNzMapUrl() : buildAuMapUrl();
                window.location.href = getMapUrlForLead(lead, { country }) || fallback;
              }}
              style={{
                width: "100%", padding: 9,
                background: "transparent",
                border: `1px solid ${M.mapBorder}`,
                borderRadius: 7, cursor: "pointer",
                color: M.text, fontWeight: 500, fontSize: 13, transition: "border-color 0.15s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = M.mapBorderHover)}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = M.mapBorder)}
            >
              View on map →
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
