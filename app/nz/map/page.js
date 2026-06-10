"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Papa from "papaparse";
import { processFiles } from "@/lib/processor";
import { NZ_AREA_GROUPS } from "@/lib/nz-areas";
import { parseNzMapUrl } from "@/lib/nz-map-nav";
import { getMapConfig, MAP_OCEAN_BG } from "@/lib/map-config";
import { CountrySelect } from "@/app/components/CountrySelect";

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
    </svg>
  );
}

function MapSpinner({ theme }) {
  const dark = theme !== "light";
  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      background: dark ? MAP_OCEAN_BG.dark : MAP_OCEAN_BG.light,
      color: dark ? "#bdbdc7" : "#6b7280",
      flexDirection: "column", gap: 12,
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "#3ecf8e", animation: "spin 1s linear infinite" }}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="28 16" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontFamily: "monospace", fontSize: 13 }}>Loading map...</div>
    </div>
  );
}

const CoverageMap = dynamic(
  () => import("@/app/components/CoverageMap"),
  { ssr: false, loading: () => <MapSpinner /> }
);

const LEGEND_ITEMS = [
  { key: "available", label: "Available", color: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  { key: "taken",     label: "Taken",     color: "#64748b", glow: null },
  { key: "noLeads",   label: "No leads",  color: null },
];

const mapConfig = getMapConfig("NZ");

export default function NewZealandMapPage() {
  const [leads, setLeads]                 = useState([]);
  const [slowIntro, setSlowIntro]         = useState(false);
  const [autoOpenPanel, setAutoOpenPanel] = useState(false);
  const [zoomMode, setZoomMode]           = useState("area");
  const [panelArea, setPanelArea]         = useState("");
  const [jumpArea, setJumpArea]           = useState("");
  const [jumpState, setJumpState]         = useState("");
  const [jumpToken, setJumpToken]         = useState(0);
  const [stats, setStats]                 = useState({ available: 0, taken: 0, noLeads: 0 });
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedArea, setSelectedArea]   = useState("");
  const [theme, setTheme]                 = useState("dark");
  const mapRef                            = useRef(null);

  useLayoutEffect(() => {
    const intent = parseNzMapUrl(window.location.search);
    if (!intent.area && !intent.region && !intent.panelArea) return;
    setSlowIntro(intent.intro);
    setAutoOpenPanel(intent.openPanel);
    setZoomMode(intent.zoom || "area");
    setPanelArea(intent.panelArea || intent.area || "");
    setJumpState(intent.region || "");
    setJumpArea(intent.zoom === "area" ? (intent.area || "") : "");
    if (intent.panelArea || intent.area) setSelectedArea(intent.panelArea || intent.area);
    if (intent.group) setSelectedGroup(intent.group);
    setJumpToken((t) => t + 1);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "dark";
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  };

  const onMapReady    = useCallback((map) => { mapRef.current = map; }, []);
  const onStatsChange = useCallback((s) => setStats(s), []);

  useEffect(() => {
    fetch("/leads_nz.csv")
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((text) => {
        Papa.parse(text, {
          header: true, skipEmptyLines: true,
          complete: ({ data }) => {
            const { leads: l } = processFiles([{ name: "leads_nz.csv", rows: data }]);
            setLeads(l);
          },
          error: () => {},
        });
      })
      .catch(() => {});
  }, []);

  const handleAreaClick = useCallback((areaName) => {
    window.location.href = `/nz?area=${encodeURIComponent(areaName)}`;
  }, []);

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
    setSelectedArea("");
  };

  const handleAreaChange = (e) => {
    const area = e.target.value;
    if (!area) return;
    setSelectedArea(area);
    setPanelArea(area);
    setJumpState("");
    setZoomMode("area");
    setSlowIntro(false);
    setAutoOpenPanel(true);
    setJumpArea(area);
    setJumpToken((t) => t + 1);
  };

  const handleReset = () => {
    const { overviewCenter, overviewZoom } = mapConfig;
    mapRef.current?.setView(overviewCenter, overviewZoom, { animate: true, duration: 0.8 });
    setSelectedGroup("");
    setSelectedArea("");
  };

  const citiesInGroup = selectedGroup
    ? (NZ_AREA_GROUPS.find((g) => g.label === selectedGroup)?.areas || [])
    : [];

  const dark = theme !== "light";
  const H = {
    bg:      dark ? "rgba(14,14,16,0.98)"    : "rgba(248,249,252,0.98)",
    border:  dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
    text:    dark ? "#efefef"                : "#17171c",
    muted:   dark ? "#9ca3af"               : "#6b7280",
    divider: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
    selBg:   dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    selBdr:  dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    selClr:  dark ? "#d1d5db"               : "#374151",
    btnBg:   dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    btnBdr:  dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    pageBg:  dark ? MAP_OCEAN_BG.dark       : MAP_OCEAN_BG.light,
    legendNo:dark ? "#1e293b"               : "#94a3b8",
  };

  const selectStyle = {
    background: H.selBg, border: `1px solid ${H.selBdr}`,
    color: H.selClr, borderRadius: 6, padding: "5px 10px",
    fontSize: 12, cursor: "pointer", outline: "none",
  };

  const btnStyle = {
    background: H.btnBg, border: `1px solid ${H.btnBdr}`,
    color: H.muted, borderRadius: 6, padding: "5px 10px",
    fontSize: 12, cursor: "pointer", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    lineHeight: 1,
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: H.pageBg, overflow: "hidden" }}>
      <header style={{
        height: 56, flexShrink: 0,
        display: "flex", alignItems: "center", gap: 10, padding: "0 16px",
        borderBottom: `1px solid ${H.border}`,
        background: H.bg, backdropFilter: "blur(8px)", zIndex: 10,
      }}>
        <a href="/nz" style={{ ...btnStyle, textDecoration: "none", width: 30, height: 30, padding: 0 }}
          title="Back to leads table">←</a>

        <div style={{ fontWeight: 600, fontSize: 14, color: H.text, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
          <CountrySelect country="NZ" fontSize={14} target="map" />
          Coverage Map
        </div>

        <div style={{ width: 1, height: 20, background: H.divider, flexShrink: 0 }} />

        <select value={selectedGroup} onChange={handleGroupChange} style={{ ...selectStyle, maxWidth: 180 }}>
          <option value="">{mapConfig.groupLabel}...</option>
          {NZ_AREA_GROUPS.map((g) => (
            <option key={g.label} value={g.label}>{g.label}</option>
          ))}
        </select>

        <select
          value={selectedArea}
          onChange={handleAreaChange}
          disabled={!selectedGroup}
          style={{ ...selectStyle, maxWidth: 230, opacity: selectedGroup ? 1 : 0.4, cursor: selectedGroup ? "pointer" : "not-allowed" }}
        >
          <option value="">Select {mapConfig.areaLabel}...</option>
          {citiesInGroup.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>

        <button onClick={handleReset} style={btnStyle}>Reset view</button>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
          {LEGEND_ITEMS.map(({ key, label, color, glow }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: color || H.legendNo,
                display: "inline-block", flexShrink: 0,
                boxShadow: glow ? `0 0 5px ${glow}` : "none",
                border: color ? "none" : `1px solid ${H.selBdr}`,
              }} />
              <span style={{ color: H.muted }}>{label}</span>
              <span style={{ fontFamily: "monospace", fontWeight: 600, color: H.text, fontSize: 11 }}>
                {stats[key]}
              </span>
            </div>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: H.divider, flexShrink: 0 }} />

        <button onClick={toggleTheme} title={dark ? "Switch to light mode" : "Switch to dark mode"} style={btnStyle}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <CoverageMap
          country="NZ"
          leads={leads}
          jumpArea={jumpArea}
          jumpState={jumpState}
          zoomMode={zoomMode}
          panelArea={panelArea}
          jumpToken={jumpToken}
          slowIntro={slowIntro}
          autoOpenPanel={autoOpenPanel}
          onAreaClick={handleAreaClick}
          onStatsChange={onStatsChange}
          onMapReady={onMapReady}
          mapHeight="100%"
          theme={theme}
        />
      </div>
    </div>
  );
}
