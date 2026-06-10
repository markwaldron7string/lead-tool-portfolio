"use client";

import { useEffect } from "react";

// Portfolio deployment is always a public demo.
export const DEMO_MODE = true;

const FEATURE_COPY = {
  scrape: {
    title: "Scraping disabled on this demo site",
    body: "Google Places scraping is turned off in the portfolio version. Sample leads are pre-loaded so you can explore filters, maps, scoring, and coverage without live API calls.",
  },
  enrich: {
    title: "Enrichment disabled on this demo site",
    body: "AI enrichment and business registry lookup are turned off in the portfolio version. Names, emails, and contact details in the table are fictional sample data.",
  },
  research: {
    title: "Research disabled on this demo site",
    body: "AI cold-call research is turned off in the portfolio version. Use the sample data to explore the dashboard layout and lead workflow.",
  },
};

export function DemoNoticeCard({ feature = "scrape", onClose }) {
  const copy = FEATURE_COPY[feature] || FEATURE_COPY.scrape;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0,0,0,0.48)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-notice-title"
        data-cy="demo-notice"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "24px 28px",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{
          fontSize: 11,
          color: "var(--green)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}>
          PORTFOLIO DEMO
        </div>
        <h3 id="demo-notice-title" style={{ fontSize: 17, fontWeight: 600, marginBottom: 10, color: "var(--text)" }}>
          {copy.title}
        </h3>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.55, marginBottom: 20 }}>
          {copy.body}
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "var(--surface2)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            borderRadius: 8,
            padding: "8px 18px",
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
