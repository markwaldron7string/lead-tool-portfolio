"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Papa from "papaparse";
import { processFiles } from "@/lib/processor";
import { NZ_AREA_GROUPS } from "@/lib/nz-areas";
import { parseNzMapUrl } from "@/lib/nz-map-nav";
import { getMapConfig, MAP_OCEAN_BG } from "@/lib/map-config";
import { MapPageHeader, getMapHeaderTokens } from "@/app/components/MapPageHeader";

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
  { ssr: false, loading: () => <MapSpinner theme="dark" /> }
);

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
  const [stats, setStats]                 = useState({ available: 0, taken: 0 });
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedArea, setSelectedArea]   = useState("");
  const [statusListFilter, setStatusListFilter] = useState(null);
  const [stateRegionFilter, setStateRegionFilter] = useState("");
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
    if (intent.statePanel && intent.region) setStateRegionFilter(intent.region);
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
  const onStatsChange = useCallback((s) => setStats({ available: s.available, taken: s.taken }), []);

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

  const handleLegendClick = (key) => {
    setStatusListFilter((prev) => (prev === key ? null : key));
  };

  const citiesInGroup = selectedGroup
    ? (NZ_AREA_GROUPS.find((g) => g.label === selectedGroup)?.areas || [])
    : [];

  const H = getMapHeaderTokens(theme !== "light");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: H.pageBg, overflow: "hidden" }}>
      <MapPageHeader
        country="NZ"
        backHref="/nz"
        theme={theme}
        onToggleTheme={toggleTheme}
        selectedGroup={selectedGroup}
        onGroupChange={handleGroupChange}
        groupOptions={NZ_AREA_GROUPS.map((g) => ({ label: g.label, value: g.label }))}
        groupPlaceholder={`${mapConfig.groupLabel}...`}
        selectedArea={selectedArea}
        onAreaChange={handleAreaChange}
        areaOptions={citiesInGroup.map((area) => ({ label: area, value: area }))}
        areaPlaceholder={`Select ${mapConfig.areaLabel}...`}
        areaDisabled={!selectedGroup}
        onReset={handleReset}
        stats={stats}
        statusListFilter={statusListFilter}
        onLegendClick={handleLegendClick}
      />

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
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
          statusListFilter={statusListFilter}
          onStatusListClose={() => setStatusListFilter(null)}
          stateRegionFilter={stateRegionFilter}
          onStatePanelClose={() => setStateRegionFilter("")}
        />
      </div>
    </div>
  );
}
