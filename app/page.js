"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
    </svg>
  );
}

function useTheme() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const stored = localStorage.getItem("theme") || "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);
  return [theme, toggleTheme];
}

export default function HomePage() {
  const [theme, toggleTheme] = useTheme();
  const [counts, setCounts] = useState({ au: null, nz: null });

  useEffect(() => {
    async function loadCounts() {
      const results = { au: null, nz: null };
      try {
        const r = await fetch("/leads_au.csv");
        if (r.ok) {
          const text = await r.text();
          const lines = text.trim().split("\n").filter(Boolean);
          results.au = Math.max(0, lines.length - 1);
        }
      } catch {}
      try {
        const r = await fetch("/leads_nz.csv");
        if (r.ok) {
          const text = await r.text();
          const lines = text.trim().split("\n").filter(Boolean);
          results.nz = Math.max(0, lines.length - 1);
        }
      } catch {}
      setCounts(results);
    }
    loadCounts();
  }, []);

  const countries = [
    { flag: "🇦🇺", name: "Australia", href: "/au", count: counts.au },
    { flag: "🇳🇿", name: "New Zealand", href: "/nz", count: counts.nz },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "18vh 24px 40px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        style={{
          position: "absolute", top: 16, right: 16,
          background: "var(--surface2)", border: "1px solid var(--border)",
          color: "var(--text)", borderRadius: 8, padding: "7px 11px",
          fontSize: 15, cursor: "pointer", lineHeight: 1, transition: "border-color 0.15s",
        }}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--green)",
            letterSpacing: "0.1em",
            marginBottom: 12,
          }}
        >
          LEAD SCRAPER
        </div>
        <h1
          data-cy="home-title"
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--text)",
          }}
        >
          Select Country
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {countries.map(({ flag, name, href, count }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div
              data-cy={`country-card-${href.replace("/", "")}`}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "40px 56px",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
                minWidth: 220,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "var(--green)";
                e.currentTarget.style.background = "var(--surface2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--surface)";
              }}
            >
              <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 16 }}>
                {flag}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 10,
                  color: "var(--text)",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: count > 0 ? "var(--green)" : "var(--muted)",
                }}
              >
                {count === null
                  ? "…"
                  : count > 0
                  ? `${count.toLocaleString()} leads`
                  : "No leads yet"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
