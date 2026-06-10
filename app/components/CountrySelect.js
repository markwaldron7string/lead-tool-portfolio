"use client";

import { useRouter } from "next/navigation";

export const COUNTRY_OPTIONS = [
  { code: "AU", name: "Australia", flag: "🇦🇺", leadsHref: "/au", mapHref: "/au/map" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", leadsHref: "/nz", mapHref: "/nz/map" },
];

export function CountrySelect({ country, fontSize = 14, target = "leads", lineHeight = 1 }) {
  const router = useRouter();
  const current = COUNTRY_OPTIONS.find((c) => c.code === country) || COUNTRY_OPTIONS[0];
  const arrowSize = Math.max(10, Math.round(fontSize * 0.55));
  const hrefKey = target === "map" ? "mapHref" : "leadsHref";

  return (
    <span
      className="country-select"
      style={{
        display: "inline-flex",
        alignItems: "center",
        position: "relative",
        verticalAlign: "baseline",
        width: "fit-content",
        maxWidth: "100%",
        border: "1px solid var(--border)",
        borderRadius: 7,
        background: "var(--surface2)",
        padding: "3px 8px",
        lineHeight,
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "var(--border2)";
        e.currentTarget.style.background = "var(--surface)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--surface2)";
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {current.name} {current.flag}
        <svg
          width={arrowSize}
          height={arrowSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
      <select
        data-cy="country-select"
        value={country}
        onChange={(e) => {
          const next = COUNTRY_OPTIONS.find((c) => c.code === e.target.value);
          if (next && next.code !== country) router.push(next[hrefKey]);
        }}
        aria-label="Select country"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          cursor: "pointer",
          border: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {COUNTRY_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>{opt.name} {opt.flag}</option>
        ))}
      </select>
    </span>
  );
}
