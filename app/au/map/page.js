"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import Papa from "papaparse";
import { processFiles } from "@/lib/processor";
import { AU_AREA_GROUPS } from "@/lib/au-areas";
import { parseAuMapUrl } from "@/lib/au-map-nav";
import { MAP_OCEAN_BG } from "@/lib/map-config";
import { MapPageHeader, getMapHeaderTokens } from "@/app/components/MapPageHeader";
import { useTheme } from "@/lib/use-theme";

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

const AustraliaMap = dynamic(
  () => import("../components/AustraliaMap"),
  { ssr: false, loading: () => <MapSpinner theme="dark" /> }
);

export default function AustraliaMapPage() {
  return (
    <Suspense fallback={<div style={{ height: "100vh", display: "flex" }}><MapSpinner theme="dark" /></div>}>
      <AustraliaMapContent />
    </Suspense>
  );
}

function AustraliaMapContent() {
  const searchParams = useSearchParams();
  const initialIntent = parseAuMapUrl(searchParams.toString());
  const hasInitialIntent = !!(initialIntent.area || initialIntent.state || initialIntent.panelArea);
  const [leads, setLeads]                 = useState([]);
  const [slowIntro, setSlowIntro]         = useState(hasInitialIntent ? initialIntent.intro : false);
  const [autoOpenPanel, setAutoOpenPanel] = useState(hasInitialIntent ? initialIntent.openPanel : false);
  const [zoomMode, setZoomMode]           = useState(hasInitialIntent ? initialIntent.zoom : "area");
  const [panelArea, setPanelArea]         = useState(hasInitialIntent ? initialIntent.panelArea || "" : "");
  const [jumpArea, setJumpArea]           = useState(hasInitialIntent && initialIntent.zoom === "area" ? initialIntent.area || "" : "");
  const [jumpState, setJumpState]         = useState(hasInitialIntent ? initialIntent.state || "" : "");
  const [jumpToken, setJumpToken]         = useState(hasInitialIntent ? 1 : 0);
  const [stats, setStats]                 = useState({ available: 0, taken: 0 });
  const [selectedGroup, setSelectedGroup] = useState(hasInitialIntent ? initialIntent.group || "" : "");
  const [selectedArea, setSelectedArea]   = useState(hasInitialIntent ? initialIntent.panelArea || initialIntent.area || "" : "");
  const [statusListFilter, setStatusListFilter] = useState(null);
  const [stateRegionFilter, setStateRegionFilter] = useState(
    hasInitialIntent && initialIntent.statePanel ? initialIntent.state || "" : "",
  );
  const [theme, toggleTheme]              = useTheme();
  const mapRef                            = useRef(null);

  const onMapReady    = useCallback((map) => { mapRef.current = map; }, []);
  const onStatsChange = useCallback((s) => setStats({ available: s.available, taken: s.taken }), []);

  useEffect(() => {
    fetch("/leads_au.csv")
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((text) => {
        Papa.parse(text, {
          header: true, skipEmptyLines: true,
          complete: ({ data }) => {
            const { leads: l } = processFiles([{ name: "leads_au.csv", rows: data }]);
            setLeads(l);
          },
          error: () => {},
        });
      })
      .catch(() => {});
  }, []);

  const handleAreaClick = useCallback((areaName) => {
    window.location.href = `/au?area=${encodeURIComponent(areaName)}`;
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
    mapRef.current?.setView([-26.2, 134], 4, { animate: true, duration: 0.8 });
    setSelectedGroup("");
    setSelectedArea("");
  };

  const handleLegendClick = (key) => {
    setStatusListFilter((prev) => (prev === key ? null : key));
  };

  const citiesInGroup = selectedGroup
    ? (AU_AREA_GROUPS.find((g) => g.label === selectedGroup)?.areas || [])
    : [];

  const H = getMapHeaderTokens(theme !== "light");

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: H.pageBg, overflow: "hidden" }}>
      <MapPageHeader
        country="AU"
        backHref="/au"
        theme={theme}
        onToggleTheme={toggleTheme}
        selectedGroup={selectedGroup}
        onGroupChange={handleGroupChange}
        groupOptions={AU_AREA_GROUPS.map((g) => ({ label: g.label, value: g.label }))}
        groupPlaceholder="State / Territory..."
        selectedArea={selectedArea}
        onAreaChange={handleAreaChange}
        areaOptions={citiesInGroup.map((area) => ({ label: area, value: area }))}
        areaPlaceholder="Select area..."
        areaDisabled={!selectedGroup}
        onReset={handleReset}
        stats={stats}
        statusListFilter={statusListFilter}
        onLegendClick={handleLegendClick}
      />

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <AustraliaMap
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
