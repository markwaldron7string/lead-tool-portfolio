"use client";

import { useEffect, useLayoutEffect, useState, useMemo, useRef, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { getMapConfig, MAP_OCEAN_BG } from "@/lib/map-config";
import LeadModal from "@/app/components/LeadModal";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Theme tokens ──────────────────────────────────────────────────────────────

function tk(theme) {
  const d = theme !== "light";
  return {
    COLORS: {
      available: "#22c55e",
      taken:     d ? "#5b6573"  : "#64748b",
      noLeads:   d ? "#475569"  : "#94a3b8",
      outside:   d ? "#1e293b"  : "#d4d8de",
    },
    FILL_OPACITY: {
      available: d ? 0.65 : 0.55,
      taken:     d ? 0.55 : 0.40,
      noLeads:   d ? 0.0  : 0.12,
      outside:   d ? 0.0  : 0.22,
    },
    BORDER_COLOR: {
      available: d ? "rgba(34,197,94,0.90)"   : "rgba(34,197,94,0.4)",
      taken:     d ? "rgba(148,163,184,0.75)" : "rgba(100,116,139,0.4)",
      noLeads:   d ? "rgba(100,116,139,0.35)" : "rgba(148,163,184,0.4)",
      outside:   d ? "rgba(203,213,225,0.30)" : "rgba(0,0,0,0.04)",
    },
    tileUrl:     d
      ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    labelTileUrl: d
      ? "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
      : null,
    leafletBg:   d ? MAP_OCEAN_BG.dark                : MAP_OCEAN_BG.light,
    zoomBg:      d ? "rgba(14,14,16,0.92) !important": "rgba(248,249,252,0.92) !important",
    zoomColor:   d ? "#efefef !important"             : "#374151 !important",
    zoomBorder:  d ? "rgba(255,255,255,0.15) !important": "rgba(0,0,0,0.15) !important",
    attrBg:      d ? "rgba(14,14,16,0.7) !important" : "rgba(248,249,252,0.8) !important",
    attrColor:   d ? "#6b7280 !important"             : "#9ca3af !important",
    panel:       d ? "#0f0f11"                        : "#ffffff",
    panelBorder: d ? "rgba(255,255,255,0.10)"         : "rgba(0,0,0,0.10)",
    panelSub:    d ? "rgba(255,255,255,0.08)"         : "rgba(0,0,0,0.08)",
    rowBorder:   d ? "rgba(255,255,255,0.05)"         : "rgba(0,0,0,0.06)",
    text:        d ? "#efefef"                        : "#17171c",
    muted:       "#6b7280",
    dimmer:      d ? "rgba(0,0,0,0.48)"               : "rgba(0,0,0,0.28)",
    dimmedFill:  d ? 0.22 : 0.35,
    dimmedBorder:d ? 0.35 : 0.45,
    overviewFill: d ? "#22c55e" : "#8ecfaa",
    overviewFillOpacity: d ? 0.42 : 0.38,
    overviewBorder: d ? "rgba(34,197,94,0.30)" : "rgba(34,197,94,0.22)",
    tipBg:       d ? "rgba(14,14,16,0.96)"            : "rgba(248,249,252,0.97)",
    tipBorder:   d ? "rgba(255,255,255,0.15)"         : "rgba(0,0,0,0.12)",
    tipText:     d ? "#efefef"                        : "#17171c",
    btnBase:     d ? "rgba(255,255,255,0.05)"         : "rgba(0,0,0,0.04)",
    btnBorder:   d ? "rgba(255,255,255,0.12)"         : "rgba(0,0,0,0.12)",
    inputColor:  d ? "#d1d5db"                        : "#374151",
  };
}

const CAT_COLORS = {
  "Investment BA":    { bg: "rgba(76,156,241,0.15)",  color: "#8fc8ff" },
  "SMSF":             { bg: "rgba(167,139,250,0.15)", color: "#c9b8ff" },
  "Owner-occupier":   { bg: "rgba(62,207,142,0.15)",  color: "#6ee6b4" },
  "Off-the-plan":     { bg: "rgba(232,160,69,0.15)",  color: "#f5c47a" },
  "Project sales":    { bg: "rgba(224,82,82,0.15)",   color: "#f39898" },
  "Property advisor": { bg: "rgba(236,72,153,0.15)",  color: "#f8a0c8" },
  "Uncategorised":    { bg: "rgba(255,255,255,0.08)", color: "#a8a8ba" },
  "EXCLUDED":         { bg: "rgba(224,82,82,0.1)",    color: "#e86060" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "area", "inner", "outer", "north", "south", "east", "west",
  "upper", "lower", "coast", "hills", "vale", "valley", "bay",
  "beach", "lake", "port", "central", "city", "rural",
]);

function areaMatchesLead(areaName, lead) {
  const area   = areaName.toLowerCase();
  const source = (lead._source || "").toLowerCase();
  const city   = (lead.city || "").toLowerCase();
  if (source.includes(area)) return true;
  if (city.length >= 3 && area.includes(city)) return true;
  const areaWords = area.split(/\s+/).filter((w) => w.length >= 4 && !STOP_WORDS.has(w));
  if (city.length >= 3 && areaWords.some((w) => city.includes(w))) return true;
  return false;
}

function getZoom(areaName, areas) {
  const area = areas[areaName];
  if (!area) return 10;
  if (area.bounds) {
    const span = Math.max(
      area.bounds.north - area.bounds.south,
      area.bounds.east - area.bounds.west,
    );
    if (span > 0.9) return 9;
    if (span > 0.55) return 10;
    return 11;
  }
  if (area.radius > 30000) return 9;
  return /Sydney|Melbourne|Brisbane|Perth|Adelaide|Auckland|Wellington|Christchurch/.test(areaName) ? 11 : 10;
}

function getOverviewSettings(config) {
  const [[south, west], [north, east]] = config.overviewBounds;
  const bounds = L.latLngBounds([south, west], [north, east]);
  const pad = config.maxBoundsPad;
  const maxBounds = pad
    ? L.latLngBounds(
      [south - pad.lat, west - (pad.lngWest ?? pad.lng ?? 2)],
      [north + pad.lat, east + (pad.lngEast ?? pad.lng ?? 2)],
    )
    : bounds.pad(2);
  return {
    center: config.overviewCenter,
    zoom: config.overviewZoom,
    bounds,
    maxBounds,
  };
}

function nudgeOverviewFillRight(map, config) {
  if (!config.overviewAlignRight) return;
  const [[south], [north]] = config.overviewBounds;
  const centerLat = (south + north) / 2;
  const size = map.getSize();
  if (!size?.x) return;

  // Keep tile coverage inside 180° — avoid the grey strip past the dateline
  for (let i = 0; i < 6; i++) {
    const topRight = map.containerPointToLatLng([size.x - 1, 0]);
    if (topRight.lng <= 179.95) break;
    const c = map.getCenter();
    map.setView([c.lat, c.lng - 0.6], map.getZoom(), { animate: false });
  }

  // Extend Pacific tiles to the right edge of the viewport
  const pacificEdge = map.latLngToContainerPoint([centerLat, 179.9]);
  const gap = size.x - pacificEdge.x - 2;
  if (gap > 4) {
    map.panBy([-gap, 0], { animate: false });
  }
}

function showMapOverview(map, config, { alignRight } = {}) {
  const { center, zoom } = getOverviewSettings(config);
  map.invalidateSize({ animate: false });
  map.setView(center, zoom, { animate: false });
  const shouldAlign = alignRight ?? Boolean(config.overviewAlignRight);
  if (shouldAlign) {
    requestAnimationFrame(() => nudgeOverviewFillRight(map, config));
  }
}

const PANEL_WIDTH = 320;
const FLASH_TOGGLE_MS = 200;
const INTRO_PAUSE_MS = 600;
const SLOW_ZOOM_DURATION = 1.6;
const FAST_ZOOM_DURATION = 1.0;

function flashLayers(layers, times = 1, onDone) {
  let count = 0;
  const id = setInterval(() => {
    const on = count % 2 === 0;
    layers.forEach((l) => l.setStyle({
      weight: on ? 3 : (l.options.weight || 0.8),
      color:  on ? "#ffffff" : (l.options.color || "rgba(34,197,94,0.4)"),
    }));
    if (++count >= times * 2) {
      clearInterval(id);
      onDone?.();
    }
  }, FLASH_TOGGLE_MS);
}

// ── Map sub-components ────────────────────────────────────────────────────────

function MapHoverFixer({ hoveredLayerRef, onReset }) {
  const map = useMap();
  const stableReset = useCallback(() => {
    if (hoveredLayerRef.current) {
      hoveredLayerRef.current.reset();
      hoveredLayerRef.current = null;
    }
    onReset?.();
  }, [hoveredLayerRef, onReset]);
  useEffect(() => {
    map.on("dragstart", stableReset);
    const container = map.getContainer();
    container.addEventListener("mouseleave", stableReset);
    return () => {
      map.off("dragstart", stableReset);
      container.removeEventListener("mouseleave", stableReset);
    };
  }, [map, stableReset]);
  return null;
}

function MapRefExposer({ onMapReady }) {
  const map = useMap();
  useEffect(() => {
    onMapReady?.(map);
    return () => onMapReady?.(null);
  }, [map, onMapReady]);
  return null;
}

function finishJump(targets, onAfterFlash, onJumpComplete) {
  const done = () => {
    onAfterFlash?.();
    onJumpComplete?.();
  };
  if (targets?.length) {
    setTimeout(() => flashLayers(targets, 1, done), 80);
    return;
  }
  done();
}

const MAP_PADDING = 80;

function getLayersForCodes(codes, layersByCodeRef) {
  if (!codes?.length || !layersByCodeRef?.current) return [];
  return codes
    .map((c) => layersByCodeRef.current.get(areaCodeKey(c)))
    .filter(Boolean);
}

function getFeaturesForCodes(codes, geojson, codeProp) {
  if (!codes?.length || !geojson?.features) return [];
  const wanted = new Set(codes.map(areaCodeKey));
  return geojson.features.filter((f) => {
    if (!f.geometry) return false;
    return wanted.has(areaCodeKey(f.properties?.[codeProp]));
  });
}

function getBoundsForCodes(codes, geojson, codeProp) {
  const features = getFeaturesForCodes(codes, geojson, codeProp);
  if (!features.length) return null;
  return L.geoJSON({ type: "FeatureCollection", features }).getBounds();
}

const PANEL_PAD = {
  paddingTopLeft: L.point(MAP_PADDING, MAP_PADDING),
  paddingBottomRight: L.point(MAP_PADDING + PANEL_WIDTH, MAP_PADDING),
};

function flyToPanelAwareBounds(map, bounds, { duration, maxZoom = 14 } = {}) {
  if (!bounds?.isValid()) return Promise.resolve();

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      map.off("moveend", finish);
      resolve();
    };

    map.once("moveend", finish);
    map.flyToBounds(bounds, {
      ...PANEL_PAD,
      maxZoom,
      duration,
      easeLinearity: 0.22,
    });
    setTimeout(finish, duration * 1000 + 500);
  });
}

function resolveAreaBounds(targetArea, codes, geojson, mapConfig) {
  let bounds = getBoundsForCodes(codes, geojson, mapConfig.codeProp)
    || areaFallbackBounds(targetArea, mapConfig.areas);
  if (!bounds?.isValid()) return null;

  if (!mapConfig.preferGeojsonBounds && bounds) {
    const span = Math.max(
      bounds.getNorth() - bounds.getSouth(),
      bounds.getEast() - bounds.getWest(),
    );
    if (span > 0.45 && mapConfig.areas[targetArea]) {
      bounds = areaFallbackBounds(targetArea, mapConfig.areas) || bounds;
    }
  }
  return bounds;
}

async function waitForAreaLayers(codes, layersByCodeRef, timeoutMs = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const targets = getLayersForCodes(codes, layersByCodeRef);
    if (targets.length > 0) return targets;
    await delay(50);
  }
  return getLayersForCodes(codes, layersByCodeRef);
}

function areaFallbackBounds(areaName, areas) {
  const area = areas[areaName];
  if (!area) return null;
  if (area.bounds) {
    const { south, north, west, east } = area.bounds;
    return L.latLngBounds([south, west], [north, east]);
  }
  const pad = (area.radius || 30000) / 111000;
  return L.latLngBounds(
    [area.lat - pad, area.lng - pad],
    [area.lat + pad, area.lng + pad],
  );
}

function areaCodeKey(code) {
  return String(code ?? "");
}

function whenMapReady(map, fn) {
  map.invalidateSize({ animate: false });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
      fn();
    });
  });
}

function whenMapReadyAsync(map) {
  return new Promise((resolve) => whenMapReady(map, resolve));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function MapNavigator({
  targetArea,
  jumpToken = 0,
  areaMapping,
  layersByCodeRef,
  geojson,
  mapConfig,
  slowIntro,
  introPlayedRef,
  onPhaseChangeRef,
  onJumpCompleteRef,
  onAfterFlashRef,
}) {
  const map = useMap();
  const completedRef = useRef("");
  const runKey = targetArea ? `${targetArea}:${jumpToken}` : "";

  useEffect(() => {
    if (!targetArea || !areaMapping || !geojson || !mapConfig) return;
    if (completedRef.current === runKey) return;

    let cancelled = false;

    (async () => {
      await whenMapReadyAsync(map);
      if (cancelled || completedRef.current === runKey) return;

      const useSlowIntro = slowIntro && introPlayedRef && !introPlayedRef.current;
      if (useSlowIntro) introPlayedRef.current = true;

      onPhaseChangeRef.current?.("overview");
      showMapOverview(map, mapConfig, { alignRight: false });
      if (useSlowIntro) await delay(INTRO_PAUSE_MS);
      if (cancelled || completedRef.current === runKey) return;

      const codes = areaMapping[targetArea] || [];
      const bounds = resolveAreaBounds(targetArea, codes, geojson, mapConfig);

      onPhaseChangeRef.current?.("zooming", targetArea);
      const duration = useSlowIntro ? SLOW_ZOOM_DURATION : FAST_ZOOM_DURATION;
      if (bounds) {
        await flyToPanelAwareBounds(map, bounds, { duration, maxZoom: 12 });
      }
      if (cancelled || completedRef.current === runKey) return;

      const targets = await waitForAreaLayers(codes, layersByCodeRef);
      completedRef.current = runKey;
      onPhaseChangeRef.current?.("focused", targetArea);
      finishJump(targets, () => onAfterFlashRef.current?.(), () => onJumpCompleteRef.current?.());
    })().catch(() => {});

    return () => { cancelled = true; };
  }, [runKey, targetArea, jumpToken, areaMapping, geojson, mapConfig, map, slowIntro, introPlayedRef, layersByCodeRef, onPhaseChangeRef, onJumpCompleteRef, onAfterFlashRef]);

  return null;
}

function MapOverviewLoader({ onPhaseChange, mapConfig }) {
  const map = useMap();
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current || !mapConfig) return;
    whenMapReady(map, () => {
      showMapOverview(map, mapConfig);
      onPhaseChange?.("overview");
      loadedRef.current = true;
    });
  }, [map, mapConfig, onPhaseChange]);
  return null;
}

// ── UI sub-components ─────────────────────────────────────────────────────────

function HoverTooltip({ info, pos, TK }) {
  if (!info || !pos) return null;
  const isTaken   = info.status === "taken";
  const isNoLeads = info.status === "noLeads";
  const isOutside = info.status === "outside";
  const statusColor = isTaken ? TK.COLORS.taken : (isNoLeads || isOutside) ? "#374151" : TK.COLORS.available;
  const statusLabel = isTaken ? "TAKEN" : isNoLeads ? "NO LEADS" : isOutside ? "-" : "AVAILABLE";
  return (
    <div style={{
      position: "fixed", left: pos.x + 14, top: pos.y - 10, zIndex: 9999,
      background: TK.tipBg, border: `1px solid ${TK.tipBorder}`,
      borderRadius: 8, padding: "10px 14px",
      fontFamily: "system-ui, sans-serif", fontSize: 12, color: TK.tipText,
      pointerEvents: "none", minWidth: 180, maxWidth: 260,
      backdropFilter: "blur(6px)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    }}>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, lineHeight: 1.3 }}>
        {isTaken && <span style={{ marginRight: 5 }}>✓</span>}
        {info.areaName}
      </div>
      {!isOutside && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, flexShrink: 0, display: "inline-block" }} />
          <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: statusColor, letterSpacing: "0.06em" }}>{statusLabel}</span>
          {!isTaken && <span style={{ color: TK.muted, marginLeft: "auto" }}>{info.count} lead{info.count !== 1 ? "s" : ""}</span>}
        </div>
      )}
      {isTaken   && <div style={{ marginTop: 5, fontSize: 11, color: TK.muted }}>Secured</div>}
      {isNoLeads && <div style={{ marginTop: 5, fontSize: 11, color: TK.muted }}>No leads yet</div>}
    </div>
  );
}

function findLeadAreaName(lead, areaMapping) {
  if (!areaMapping) return null;
  for (const areaName of Object.keys(areaMapping)) {
    if (areaMatchesLead(areaName, lead)) return areaName;
  }
  return null;
}

function isLeadMarkedTaken(lead, takenLeads, takenAreas, areaMapping, areaLeadMap) {
  if (takenLeads.includes(lead.title)) return true;
  const area = findLeadAreaName(lead, areaMapping);
  if (!area) return false;
  if (takenAreas.includes(area)) return true;
  const { titles = [], totalCount = 0 } = areaLeadMap[area] || {};
  return totalCount > 0 && titles.every((t) => takenLeads.includes(t));
}

function LeadListRow({ lead, takenLeads, onMarkLead, onLeadClick, TK, areaName, dimmed = false }) {
  const isLeadTaken = takenLeads.includes(lead.title);
  const score = Number(lead._score) || 0;
  const scoreColor = score >= 75 ? "#22c55e" : score >= 40 ? "#e8a045" : TK.muted;
  const cat = lead._category || "Uncategorised";
  const catStyle = CAT_COLORS[cat] || CAT_COLORS["Uncategorised"];

  return (
    <div style={{
      padding: "10px 14px", borderBottom: `1px solid ${TK.rowBorder}`,
      opacity: dimmed ? 0.45 : 1, transition: "opacity 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
        <LeadToggle title={lead.title} takenLeads={takenLeads} onMarkLead={onMarkLead} TK={TK} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
            <button
              type="button"
              onClick={() => onLeadClick?.(lead)}
              style={{
                background: "none", border: "none", padding: 0, textAlign: "left",
                fontWeight: 600, fontSize: 12, lineHeight: 1.3, cursor: "pointer",
                textDecorationLine: isLeadTaken ? "line-through" : "underline",
                textDecorationStyle: "solid",
                textDecorationColor: "transparent",
                color: isLeadTaken ? TK.muted : TK.text,
                transition: "text-decoration-color 0.15s",
              }}
              onMouseOver={(e) => { if (!isLeadTaken) e.currentTarget.style.textDecorationColor = TK.muted; }}
              onMouseOut={(e) => { e.currentTarget.style.textDecorationColor = "transparent"; }}
            >
              {lead.title}
            </button>
            <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: scoreColor, flexShrink: 0 }}>
              {score}
            </span>
          </div>
          {areaName && (
            <div style={{ fontSize: 10, color: TK.muted, marginTop: 2, opacity: 0.85 }}>{areaName}</div>
          )}
          <div style={{ fontSize: 11, color: TK.muted, marginTop: 2 }}>
            {lead.phone || <span style={{ opacity: 0.5 }}>No phone</span>}
          </div>
          <div style={{ fontSize: 11, marginTop: 2, marginBottom: 4 }}>
            {lead.emails
              ? <span style={{ color: "var(--email-color)" }}>{String(lead.emails).split(",")[0].trim()}</span>
              : <span style={{ color: TK.muted, opacity: 0.5 }}>-</span>}
          </div>
          <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 99, ...catStyle }}>
            {cat}
          </span>
        </div>
      </div>
    </div>
  );
}

function LeadToggle({ title, takenLeads, onMarkLead, TK }) {
  const isTaken = takenLeads.includes(title);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onMarkLead(title, !isTaken); }}
      title={isTaken ? "Mark as available" : "Mark as complete"}
      style={{
        flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
        border: `1.5px solid ${isTaken ? "#22c55e" : TK.panelBorder}`,
        background: isTaken ? "rgba(34,197,94,0.15)" : "transparent",
        color: isTaken ? "#22c55e" : TK.muted,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, lineHeight: 1, transition: "all 0.15s",
      }}
    >
      {isTaken ? "✓" : "○"}
    </button>
  );
}

function SlidePanel({ info, closing, leads, takenLeads, onClose, onMark, onMarkLead, onViewLeads, onLeadClick, TK }) {
  const isTaken   = info?.status === "taken";
  const isNoLeads = info?.status === "noLeads";
  const statusLabel = isTaken ? "TAKEN" : isNoLeads ? "NO LEADS" : "AVAILABLE";
  const statusColor = isTaken ? TK.COLORS.taken : isNoLeads ? TK.muted : "#22c55e";

  const areaLeads = useMemo(() => {
    if (!info || !leads) return [];
    return leads
      .filter((l) => l._category !== "EXCLUDED" && areaMatchesLead(info.areaName, l))
      .sort((a, b) => (Number(b._score) || 0) - (Number(a._score) || 0));
  }, [info, leads]);

  const availableLeadCount = useMemo(
    () => areaLeads.filter((l) => !takenLeads.includes(l.title)).length,
    [areaLeads, takenLeads]
  );

  if (!info) return null;

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0,
      width: "min(320px, 100%)",
      background: TK.panel,
      borderLeft: `1px solid ${TK.panelBorder}`,
      zIndex: 1000,
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, sans-serif",
      animation: closing ? "slideOut 0.26s ease forwards" : "slideIn 0.25s ease",
      overflow: "hidden",
      cursor: "default",
    }}>
      <style>{`
        @keyframes slideIn  { from { transform: translateX(100%); } to   { transform: translateX(0);    } }
        @keyframes slideOut { from { transform: translateX(0);    } to   { transform: translateX(100%); } }
      `}</style>

      {/* Header */}
      <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${TK.panelSub}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TK.text, lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
            {info.areaName}
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: TK.muted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0 }}>
            ✕
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-block", fontFamily: "monospace", fontSize: 10, fontWeight: 700,
            color: statusColor, letterSpacing: "0.08em",
            background: `${statusColor}1a`, borderRadius: 4, padding: "2px 7px",
          }}>{statusLabel}</span>
          {!isTaken && (
            <span style={{ fontSize: 12, color: TK.muted }}>
              {availableLeadCount} lead{availableLeadCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Lead cards */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {areaLeads.length === 0 ? (
          <div style={{ padding: "28px 16px", textAlign: "center", color: TK.muted, fontSize: 13, lineHeight: 1.7 }}>
            No leads for this area yet.
            <br />
            <span style={{ fontSize: 12, color: TK.muted, opacity: 0.7 }}>
              Try scraping with<br />
              <em>&ldquo;{info.areaName} buyers agent&rdquo;</em>
            </span>
          </div>
        ) : (
          areaLeads.map((lead, i) => (
            <LeadListRow
              key={i}
              lead={lead}
              takenLeads={takenLeads}
              onMarkLead={onMarkLead}
              onLeadClick={onLeadClick}
              TK={TK}
              dimmed={isTaken || takenLeads.includes(lead.title)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${TK.panelSub}`, flexShrink: 0, display: "flex", flexDirection: "column", gap: 7 }}>
        {isTaken ? (
          <button onClick={() => onMark(info.areaName, false)}
            style={{ background: `${TK.COLORS.taken}28`, color: TK.muted, fontWeight: 600, fontSize: 13, padding: "9px", borderRadius: 7, border: `1px solid ${TK.COLORS.taken}55`, cursor: "pointer", width: "100%" }}>
            Remove complete
          </button>
        ) : (
          <button onClick={() => onMark(info.areaName, true)}
            style={{ background: "#22c55e", color: "#000", fontWeight: 700, fontSize: 13, padding: "9px", borderRadius: 7, border: "none", cursor: "pointer", width: "100%" }}>
            Mark area complete ✓
          </button>
        )}
        <button onClick={() => onViewLeads(info.areaName)}
          style={{ background: "transparent", color: TK.text, fontWeight: 500, fontSize: 13, padding: "9px", borderRadius: 7, border: `1px solid ${TK.panelBorder}`, cursor: "pointer", width: "100%" }}>
          View all in table →
        </button>
      </div>
    </div>
  );
}

function StateRegionPanel({ stateRegionFilter, closing, leads, takenLeads, onClose, onMarkLead, onLeadClick, onViewTable, TK }) {
  const stateLeads = useMemo(() => {
    if (!stateRegionFilter || !leads) return [];
    return leads
      .filter((l) => l._category !== "EXCLUDED" && l.state === stateRegionFilter)
      .sort((a, b) => (Number(b._score) || 0) - (Number(a._score) || 0));
  }, [stateRegionFilter, leads]);

  if (!stateRegionFilter) return null;

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0,
      width: "min(320px, 100%)",
      background: TK.panel,
      borderLeft: `1px solid ${TK.panelBorder}`,
      zIndex: 1000,
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, sans-serif",
      animation: closing ? "slideOut 0.26s ease forwards" : "slideIn 0.25s ease",
      overflow: "hidden",
      cursor: "default",
    }}>
      <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${TK.panelSub}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TK.text, lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
            {stateRegionFilter}
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", color: TK.muted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0 }}>
            ✕
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-block", fontFamily: "monospace", fontSize: 10, fontWeight: 700,
            color: "#22c55e", letterSpacing: "0.08em",
            background: "rgba(34,197,94,0.12)", borderRadius: 4, padding: "2px 7px",
          }}>ALL LEADS</span>
          <span style={{ fontSize: 12, color: TK.muted }}>
            {stateLeads.length} lead{stateLeads.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {stateLeads.length === 0 ? (
          <div style={{ padding: "28px 16px", textAlign: "center", color: TK.muted, fontSize: 13, lineHeight: 1.7 }}>
            No leads in {stateRegionFilter} yet.
          </div>
        ) : (
          stateLeads.map((lead, i) => (
            <LeadListRow
              key={i}
              lead={lead}
              takenLeads={takenLeads}
              onMarkLead={onMarkLead}
              onLeadClick={onLeadClick}
              TK={TK}
              areaName={lead.city}
              dimmed={takenLeads.includes(lead.title)}
            />
          ))
        )}
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${TK.panelSub}`, flexShrink: 0 }}>
        <button
          type="button"
          onClick={onViewTable}
          style={{
            background: "transparent", color: TK.text, fontWeight: 500, fontSize: 13,
            padding: "9px", borderRadius: 7, border: `1px solid ${TK.panelBorder}`,
            cursor: "pointer", width: "100%",
          }}
        >
          View all in table →
        </button>
      </div>
    </div>
  );
}

function MapStateNavigator({ stateRegionFilter, areaMapping, mapConfig, geojson, onPhaseChangeRef }) {
  const map = useMap();
  const completedRef = useRef("");

  useEffect(() => {
    if (!stateRegionFilter || !areaMapping || !geojson || !mapConfig) return;
    if (completedRef.current === stateRegionFilter) return;

    let cancelled = false;

    (async () => {
      await whenMapReadyAsync(map);
      if (cancelled) return;

      onPhaseChangeRef.current?.("state_zooming");

      const groupKey = mapConfig.countryCode === "NZ" ? "region" : "state";
      const allCodes = [];
      for (const [areaName, codes] of Object.entries(areaMapping)) {
        const areaData = mapConfig.areas[areaName];
        if (areaData?.[groupKey] === stateRegionFilter) {
          allCodes.push(...codes);
        }
      }

      const bounds = getBoundsForCodes(allCodes, geojson, mapConfig.codeProp);
      if (bounds?.isValid()) {
        await flyToPanelAwareBounds(map, bounds, { duration: FAST_ZOOM_DURATION, maxZoom: 9 });
      }
      if (cancelled) return;

      completedRef.current = stateRegionFilter;
      onPhaseChangeRef.current?.("state_focused");
    })().catch(() => {});

    return () => { cancelled = true; };
  }, [stateRegionFilter, areaMapping, geojson, mapConfig, map, onPhaseChangeRef]);

  return null;
}

function AggregateLeadsPanel({
  filter,
  closing,
  leads,
  takenLeads,
  takenAreas,
  areaMapping,
  areaLeadMap,
  onClose,
  onMarkLead,
  onLeadClick,
  onViewTable,
  TK,
}) {
  const filteredLeads = useMemo(() => {
    const active = leads.filter((l) => l._category !== "EXCLUDED");
    return active
      .filter((lead) => {
        const taken = isLeadMarkedTaken(lead, takenLeads, takenAreas, areaMapping, areaLeadMap);
        return filter === "available" ? !taken : taken;
      })
      .sort((a, b) => (Number(b._score) || 0) - (Number(a._score) || 0));
  }, [leads, filter, takenLeads, takenAreas, areaMapping, areaLeadMap]);

  const title = filter === "available" ? "Available leads" : "Taken leads";
  const statusColor = filter === "available" ? "#22c55e" : TK.COLORS.taken;

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0,
      width: "min(320px, 100%)",
      background: TK.panel,
      borderLeft: `1px solid ${TK.panelBorder}`,
      zIndex: 1000,
      display: "flex", flexDirection: "column",
      fontFamily: "system-ui, sans-serif",
      animation: closing ? "slideOut 0.26s ease forwards" : "slideIn 0.25s ease",
      overflow: "hidden",
      cursor: "default",
    }}>
      <div style={{ padding: "14px 14px 10px", borderBottom: `1px solid ${TK.panelSub}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TK.text, lineHeight: 1.3, flex: 1, paddingRight: 8 }}>
            {title}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: TK.muted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-block", fontFamily: "monospace", fontSize: 10, fontWeight: 700,
            color: statusColor, letterSpacing: "0.08em",
            background: `${statusColor}1a`, borderRadius: 4, padding: "2px 7px",
          }}>
            {filter === "available" ? "AVAILABLE" : "TAKEN"}
          </span>
          <span style={{ fontSize: 12, color: TK.muted }}>
            {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredLeads.length === 0 ? (
          <div style={{ padding: "28px 16px", textAlign: "center", color: TK.muted, fontSize: 13, lineHeight: 1.7 }}>
            No {filter === "available" ? "available" : "taken"} leads yet.
          </div>
        ) : (
          filteredLeads.map((lead, i) => (
            <LeadListRow
              key={i}
              lead={lead}
              takenLeads={takenLeads}
              onMarkLead={onMarkLead}
              onLeadClick={onLeadClick}
              TK={TK}
              areaName={findLeadAreaName(lead, areaMapping)}
              dimmed={isLeadMarkedTaken(lead, takenLeads, takenAreas, areaMapping, areaLeadMap)}
            />
          ))
        )}
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${TK.panelSub}`, flexShrink: 0 }}>
        <button
          type="button"
          onClick={onViewTable}
          style={{
            background: "transparent", color: TK.text, fontWeight: 500, fontSize: 13,
            padding: "9px", borderRadius: 7, border: `1px solid ${TK.panelBorder}`,
            cursor: "pointer", width: "100%",
          }}
        >
          View all in table →
        </button>
      </div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 1002,
      background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)",
      borderRadius: 8, padding: "10px 18px",
      fontFamily: "system-ui, sans-serif", fontSize: 13, color: "#22c55e",
      whiteSpace: "nowrap", pointerEvents: "none",
      animation: "toastIn 0.2s ease",
    }}>
      <style>{`@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(6px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      {message}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CoverageMap({
  country = "AU",
  leads,
  onAreaClick,
  jumpArea,
  jumpState = "",
  zoomMode = "area",
  panelArea = "",
  jumpToken = 0,
  slowIntro = false,
  autoOpenPanel = false,
  onStatsChange,
  onMapReady,
  mapHeight,
  theme = "dark",
  statusListFilter = null,
  onStatusListClose,
  stateRegionFilter = "",
  onStatePanelClose,
}) {
  const mapConfig = useMemo(() => getMapConfig(country), [country]);
  const overview = useMemo(() => getOverviewSettings(mapConfig), [mapConfig]);
  const [geojson, setGeojson]           = useState(null);
  const [areaMapping, setAreaMapping]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [takenAreas, setTakenAreas]     = useState([]);
  const [takenLeads, setTakenLeads]     = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [tooltipInfo, setTooltipInfo]   = useState(null);
  const [tooltipPos, setTooltipPos]     = useState(null);
  const [toast, setToast]               = useState(null);
  const [panelClosing, setPanelClosing]  = useState(false);
  const [aggregateClosing, setAggregateClosing] = useState(false);
  const [stateRegionClosing, setStateRegionClosing] = useState(false);
  const [modalLead, setModalLead]        = useState(null);
  const geoJsonRef                      = useRef(null);
  const layersByCodeRef                 = useRef(new Map());
  const [viewPhase, setViewPhase]       = useState("overview");
  const introPlayedRef                  = useRef(false);
  const mapInstanceRef                  = useRef(null);
  const hoveredLayerRef                 = useRef(null);
  const sa4InfoMapRef                   = useRef({});
  const styleForLayerRef                = useRef(() => ({}));
  const selectedCodesRef                = useRef(null);
  const selectedAreaRef                 = useRef(null);
  const highlightAreaRef                = useRef(null);
  const viewPhaseRef                    = useRef("overview");
  const expectedLayerCountRef           = useRef(0);
  const pendingLeadMarksRef             = useRef(new Map());
  const targetArea = panelArea || jumpArea || "";
  const areaForPanel = panelArea || jumpArea;
  const panelOpenedForRef                     = useRef("");
  const zoomAndOpenPanelRef                   = useRef(null);
  const targetAreaRef                         = useRef(targetArea);
  targetAreaRef.current = targetArea;
  const stableOnMapReady                      = useCallback((map) => {
    mapInstanceRef.current = map;
    onMapReady?.(map);
  }, [onMapReady]);
  const closePanel                      = useCallback(() => {
    setPanelClosing(true);
    setTimeout(() => {
      setPanelClosing(false);
      setSelectedArea(null);
      highlightAreaRef.current = null;
      if (stateRegionFilter) {
        viewPhaseRef.current = "state_focused";
        setViewPhase("state_focused");
      } else {
        viewPhaseRef.current = targetArea ? "zoomed" : "overview";
        setViewPhase(targetArea ? "zoomed" : "overview");
      }
    }, 260);
  }, [targetArea, stateRegionFilter]);
  const closeAggregatePanel = useCallback(() => {
    if (!statusListFilter) return;
    setAggregateClosing(true);
    setTimeout(() => {
      setAggregateClosing(false);
      onStatusListClose?.();
    }, 260);
  }, [statusListFilter, onStatusListClose]);

  const closeStatePanel = useCallback(() => {
    setStateRegionClosing(true);
    setTimeout(() => {
      setStateRegionClosing(false);
      onStatePanelClose?.();
      if (mapInstanceRef.current && !targetArea) {
        showMapOverview(mapInstanceRef.current, mapConfig);
      }
      viewPhaseRef.current = "overview";
      setViewPhase("overview");
    }, 260);
  }, [onStatePanelClose, mapConfig, targetArea]);
  const resetHover                      = useCallback(() => {
    setTooltipInfo(null);
    setTooltipPos(null);
  }, []);

  // Theme tokens (memoised so sub-components don't re-render on unrelated state changes)
  const TK = useMemo(() => tk(theme), [theme]);

  const stateAreaCodes = useMemo(() => {
    if (!stateRegionFilter || !areaMapping || !mapConfig?.areas) return null;
    const groupKey = mapConfig.countryCode === "NZ" ? "region" : "state";
    const codes = new Set();
    for (const [areaName, areaCodes] of Object.entries(areaMapping)) {
      const areaData = mapConfig.areas[areaName];
      if (areaData?.[groupKey] === stateRegionFilter) {
        areaCodes.forEach((c) => codes.add(areaCodeKey(c)));
      }
    }
    return codes;
  }, [stateRegionFilter, areaMapping, mapConfig]);

  const stateAreaCodesRef = useRef(null);

  // ── Fetch data ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    function fetchExclusivity() {
      fetch("/api/exclusivity")
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (!data || cancelled) return;
          setTakenAreas(data.taken || []);
          let serverLeads = data.takenLeads || [];
          for (const [title, taken] of pendingLeadMarksRef.current) {
            if (taken && !serverLeads.includes(title)) serverLeads = [...serverLeads, title];
            else if (!taken) serverLeads = serverLeads.filter((t) => t !== title);
          }
          setTakenLeads(serverLeads);
        })
        .catch(() => {});
    }

    Promise.all([
      fetch(mapConfig.geojsonUrl).then((r) => r.json()),
      fetch(mapConfig.mappingUrl).then((r) => r.json()),
    ]).then(([gj, mapping]) => {
      if (cancelled) return;
      setGeojson(gj);
      setAreaMapping(mapping);
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });

    fetchExclusivity();
    const poll = setInterval(fetchExclusivity, 30000);
    return () => { cancelled = true; clearInterval(poll); };
  }, [mapConfig.geojsonUrl, mapConfig.mappingUrl]);

  // ── Area lead map ────────────────────────────────────────────────────────
  const areaLeadMap = useMemo(() => {
    if (!areaMapping) return {};
    const map = {};
    for (const areaName of Object.keys(areaMapping)) {
      const matching = leads.filter((l) => l._category !== "EXCLUDED" && areaMatchesLead(areaName, l));
      const available = matching.filter((l) => !takenLeads.includes(l.title));
      const best = available.reduce((max, l) => {
        const s = Number(l._score) || 0;
        return s > (Number(max?._score) || 0) ? l : max;
      }, null);
      map[areaName] = {
        count: available.length,
        totalCount: matching.length,
        best,
        titles: matching.map((l) => l.title),
      };
    }
    return map;
  }, [areaMapping, leads, takenLeads]);

  // ── SA4 info map ─────────────────────────────────────────────────────────
  const sa4InfoMap = useMemo(() => {
    if (!areaMapping) return {};
    const priority = { taken: 3, available: 2, noLeads: 1 };
    const map = {};
    for (const [areaName, codes] of Object.entries(areaMapping)) {
      const { count = 0, totalCount = 0, best, titles = [] } = areaLeadMap[areaName] || {};
      const allLeadsTaken = totalCount > 0 && titles.every((t) => takenLeads.includes(t));
      const status = takenAreas.includes(areaName) || allLeadsTaken ? "taken"
        : count > 0 ? "available"
        : "noLeads";
      const displayCount = status === "taken" ? 0 : count;
      for (const code of codes) {
        const key = areaCodeKey(code);
        if (!map[key] || (priority[status] || 0) > (priority[map[key].status] || 0)) {
          map[key] = { status, areaName, count: displayCount, best };
        }
      }
    }
    return map;
  }, [areaMapping, areaLeadMap, takenAreas, takenLeads]);

  // ── Legend stats → parent ────────────────────────────────────────────────
  const legendStats = useMemo(() => {
    let available = 0, taken = 0, noLeads = 0;
    for (const areaName of Object.keys(areaMapping || {})) {
      const { count = 0, totalCount = 0, titles = [] } = areaLeadMap[areaName] || {};
      const allLeadsTaken = totalCount > 0 && titles.every((t) => takenLeads.includes(t));
      if (takenAreas.includes(areaName) || allLeadsTaken) taken++;
      else if (count > 0) available++;
      else noLeads++;
    }
    return { available, taken, noLeads };
  }, [areaMapping, areaLeadMap, takenAreas, takenLeads]);

  useEffect(() => { onStatsChange?.(legendStats); }, [legendStats, onStatsChange]);

  useEffect(() => { sa4InfoMapRef.current = sa4InfoMap; }, [sa4InfoMap]);
  useEffect(() => { selectedAreaRef.current = selectedArea; }, [selectedArea]);
  useEffect(() => {
    stateAreaCodesRef.current = stateAreaCodes;
    if (stateAreaCodes?.size) requestAnimationFrame(() => applyRegionStylesRef.current?.());
  }, [stateAreaCodes]);

  useEffect(() => {
    if (!statusListFilter) return;
    setPanelClosing(false);
    setSelectedArea(null);
    highlightAreaRef.current = null;
  }, [statusListFilter]);

  // Keep open panel in sync when leads are marked complete/available
  useEffect(() => {
    if (!selectedArea?.areaName || !areaMapping) return;
    const codes = areaMapping[selectedArea.areaName];
    if (!codes?.length) return;
    const info = codes.map((c) => sa4InfoMap[areaCodeKey(c)]).find((i) => i?.areaName === selectedArea.areaName);
    if (!info) return;
    if (info.count !== selectedArea.count || info.status !== selectedArea.status) {
      setSelectedArea({ ...info });
    }
  }, [sa4InfoMap, areaMapping, selectedArea?.areaName, selectedArea?.count, selectedArea?.status]);

  useEffect(() => {
    panelOpenedForRef.current = "";
  }, [targetArea, jumpToken]);

  const onPhaseChange = useCallback((phase, areaName) => {
    viewPhaseRef.current = phase;
    setViewPhase(phase);
    if (areaName) highlightAreaRef.current = areaName;
  }, []);

  const openPanelForArea = useCallback((areaName) => {
    if (!areaName || !areaMapping) return;
    const codes = areaMapping[areaName];
    if (!codes?.length) return;
    const info = codes.map((c) => sa4InfoMap[areaCodeKey(c)]).find((i) => i?.areaName === areaName)
      ?? { areaName, status: "noLeads", count: 0, best: null };
    panelOpenedForRef.current = targetAreaRef.current;
    setPanelClosing(false);
    onStatusListClose?.();
    setSelectedArea({ ...info });
  }, [areaMapping, sa4InfoMap, onStatusListClose]);

  const zoomAndOpenPanel = useCallback((areaName, info) => {
    const map = mapInstanceRef.current;
    if (!map || !areaName || !areaMapping) return;
    const codes = areaMapping[areaName];
    if (!codes?.length) return;

    const displayInfo = info ?? { areaName, status: "noLeads", count: 0, best: null };

    highlightAreaRef.current = areaName;
    viewPhaseRef.current = "zooming";
    setViewPhase("zooming");

    // For AU, zoom to the full state so the area sits in context rather than
    // filling the entire viewport. For NZ, zoom directly to the city area.
    const groupKey = mapConfig.countryCode === "NZ" ? "region" : "state";
    const parentGroup = mapConfig.areas?.[areaName]?.[groupKey];
    let zoomBounds = null;
    let zoomMaxZoom = 14;

    if (parentGroup) {
      const groupCodes = [];
      for (const [name, areaCodes] of Object.entries(areaMapping)) {
        if (mapConfig.areas?.[name]?.[groupKey] === parentGroup) {
          groupCodes.push(...areaCodes);
        }
      }
      zoomBounds = getBoundsForCodes(groupCodes, geojson, mapConfig.codeProp);
      zoomMaxZoom = mapConfig.countryCode === "NZ" ? 10 : 9;
    }

    if (!zoomBounds?.isValid()) {
      zoomBounds = resolveAreaBounds(areaName, codes, geojson, mapConfig);
    }

    const openPanel = () => {
      viewPhaseRef.current = "focused";
      setViewPhase("focused");
      setPanelClosing(false);
      onStatusListClose?.();
      setSelectedArea({ ...displayInfo });
    };

    if (zoomBounds?.isValid()) {
      flyToPanelAwareBounds(map, zoomBounds, { duration: FAST_ZOOM_DURATION, maxZoom: zoomMaxZoom }).then(openPanel);
    } else {
      openPanel();
    }
  }, [areaMapping, geojson, mapConfig, onStatusListClose]);
  zoomAndOpenPanelRef.current = zoomAndOpenPanel;

  const onJumpComplete = useCallback(() => {
    if (autoOpenPanel && areaForPanel) openPanelForArea(areaForPanel);
  }, [autoOpenPanel, areaForPanel, openPanelForArea]);

  const expectedLayerCount = useMemo(
    () => geojson?.features?.filter((f) => f.geometry).length ?? 0,
    [geojson],
  );
  expectedLayerCountRef.current = expectedLayerCount;

  const highlightAreaName = selectedArea?.areaName
    || (viewPhase === "focused" || viewPhase === "zooming" ? (highlightAreaRef.current || targetArea) : null)
    || null;

  useEffect(() => { highlightAreaRef.current = highlightAreaName; }, [highlightAreaName]);
  useEffect(() => { viewPhaseRef.current = viewPhase; }, [viewPhase]);

  const selectedCodes = useMemo(() => {
    if (!highlightAreaName || !areaMapping) return null;
    const codes = areaMapping[highlightAreaName];
    return codes?.length ? new Set(codes.map(areaCodeKey)) : null;
  }, [highlightAreaName, areaMapping]);
  selectedCodesRef.current = selectedCodes;

  const styleForLayer = useCallback((code, info, { hover = false } = {}) => {
    const key = areaCodeKey(code);
    const phase = viewPhaseRef.current;

    if (phase === "overview" || phase === "zooming" || phase === "state_overview" || phase === "state_zooming") {
      if (!info || info.status === "noLeads") {
        return {
          fillColor: TK.COLORS.outside,
          fillOpacity: 0,
          color: TK.BORDER_COLOR.outside,
          weight: 0.5,
          opacity: 1,
        };
      }
      return {
        fillColor: TK.overviewFill,
        fillOpacity: hover ? TK.overviewFillOpacity + 0.12 : TK.overviewFillOpacity,
        color: TK.overviewBorder,
        weight: hover ? 1.2 : 0.6,
        opacity: 1,
      };
    }

    if (phase === "state_focused" && stateAreaCodesRef.current?.size > 0) {
      const inState = stateAreaCodesRef.current.has(key);
      if (inState) {
        if (!info) {
          return {
            fillColor: TK.COLORS.outside,
            fillOpacity: 0,
            color: TK.BORDER_COLOR.outside,
            weight: 0.5,
            opacity: 0.5,
          };
        }
        const baseOpacity = TK.FILL_OPACITY[info.status];
        return {
          fillColor: TK.COLORS[info.status],
          fillOpacity: hover ? Math.min(0.95, baseOpacity + 0.20) : baseOpacity,
          color: hover ? "#ffffff" : TK.BORDER_COLOR[info.status],
          weight: hover ? 2 : 0.8,
          opacity: 1,
        };
      }
      if (info) {
        return {
          fillColor: TK.COLORS[info.status],
          fillOpacity: TK.FILL_OPACITY[info.status] * TK.dimmedFill,
          color: TK.BORDER_COLOR[info.status],
          weight: 0.6,
          opacity: TK.dimmedBorder,
        };
      }
      return {
        fillColor: TK.COLORS.outside,
        fillOpacity: 0,
        color: TK.BORDER_COLOR.outside,
        weight: 0.4,
        opacity: TK.dimmedBorder * 0.6,
      };
    }

    const codes = selectedCodesRef.current;
    const isSelected = codes?.has(key);
    const isSpotlight = phase === "focused" && Boolean(codes?.size) && Boolean(highlightAreaRef.current);
    if (isSpotlight) {
      if (isSelected) {
        const status = info?.status || "available";
        return {
          fillColor: TK.COLORS[status],
          fillOpacity: hover ? 0.98 : Math.min(0.92, TK.FILL_OPACITY[status] + 0.22),
          color: "#ffffff",
          weight: hover ? 3 : 2.5,
          opacity: 1,
        };
      }
      if (info) {
        return {
          fillColor: TK.COLORS[info.status],
          fillOpacity: TK.FILL_OPACITY[info.status] * TK.dimmedFill,
          color: TK.BORDER_COLOR[info.status],
          weight: 0.6,
          opacity: TK.dimmedBorder,
        };
      }
      return {
        fillColor: TK.COLORS.outside,
        fillOpacity: 0,
        color: TK.BORDER_COLOR.outside,
        weight: 0.4,
        opacity: TK.dimmedBorder * 0.6,
      };
    }
    if (!info) {
      return {
        fillColor: TK.COLORS.outside,
        fillOpacity: TK.FILL_OPACITY.outside,
        color: TK.BORDER_COLOR.outside,
        weight: hover ? 1.2 : 0.5,
        opacity: 1,
      };
    }
    const baseOpacity = TK.FILL_OPACITY[info.status];
    return {
      fillColor: TK.COLORS[info.status],
      fillOpacity: hover ? Math.min(0.95, baseOpacity + 0.20) : baseOpacity,
      color: hover ? "#ffffff" : TK.BORDER_COLOR[info.status],
      weight: hover ? 2 : 0.8,
      opacity: 1,
    };
  }, [TK]);

  useEffect(() => { styleForLayerRef.current = styleForLayer; }, [styleForLayer]);

  // Keep hover tooltip counts in sync when leads are marked complete
  useEffect(() => {
    if (!tooltipInfo?.sa4Code) return;
    const info = sa4InfoMap[areaCodeKey(tooltipInfo.sa4Code)];
    if (!info) return;
    if (info.count !== tooltipInfo.count || info.status !== tooltipInfo.status) {
      setTooltipInfo({ ...info, sa4Code: tooltipInfo.sa4Code });
    }
  }, [sa4InfoMap, tooltipInfo?.sa4Code, tooltipInfo?.count, tooltipInfo?.status]);

  const applyRegionStylesRef = useRef(() => {});

  const applyRegionStyles = useCallback(() => {
    if (!layersByCodeRef.current.size) return;
    for (const [key, layer] of layersByCodeRef.current) {
      const info = sa4InfoMap[key];
      layer.setStyle(styleForLayer(key, info));
      if (selectedCodes?.has(key)) layer.bringToFront();
    }
  }, [sa4InfoMap, styleForLayer, selectedCodes]);

  applyRegionStylesRef.current = applyRegionStyles;

  useEffect(() => {
    applyRegionStyles();
  }, [applyRegionStyles]);

  useEffect(() => {
    applyRegionStyles();
  }, [viewPhase, highlightAreaName, applyRegionStyles]);

  useEffect(() => {
    if (!selectedArea) return;
    if (viewPhaseRef.current === "zooming" || viewPhaseRef.current === "overview") return;
    const retry = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize({ animate: false });
      applyRegionStylesRef.current();
    }, 300);
    return () => clearTimeout(retry);
  }, [selectedArea]);

  const geoJsonKey = theme;

  useLayoutEffect(() => {
    layersByCodeRef.current.clear();
  }, [geoJsonKey]);

  const onAfterFlash = useCallback(() => applyRegionStylesRef.current(), []);

  const onPhaseChangeRef = useRef(onPhaseChange);
  const onJumpCompleteRef = useRef(onJumpComplete);
  const onAfterFlashRef = useRef(onAfterFlash);
  onPhaseChangeRef.current = onPhaseChange;
  onJumpCompleteRef.current = onJumpComplete;
  onAfterFlashRef.current = onAfterFlash;

  // ── Hover / click handlers (use refs so counts stay live after mark complete) ─
  const onEachFeature = useCallback((feature, layer) => {
    const code = feature.properties?.[mapConfig.codeProp];
    const key = areaCodeKey(code);
    const featureName = feature.properties?.[mapConfig.nameProp] || code;
    layersByCodeRef.current.set(key, layer);
    const getInfo = () => sa4InfoMapRef.current[key];
    const applyStyle = (opts) => layer.setStyle(styleForLayerRef.current(key, getInfo(), opts));
    applyStyle();
    if (layersByCodeRef.current.size >= expectedLayerCountRef.current) {
      queueMicrotask(() => applyRegionStylesRef.current());
    }

    layer.on({
      mouseover(e) {
        const phase = viewPhaseRef.current;
        if ((phase !== "overview" && phase !== "state_focused") || selectedAreaRef.current) return;
        if (phase === "overview" && highlightAreaRef.current) return;
        const info = getInfo();
        hoveredLayerRef.current = { reset: () => applyStyle() };
        setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
        setTooltipInfo(info
          ? { ...info, sa4Code: key }
          : { areaName: featureName, status: "outside", count: 0, best: null, sa4Code: key });
        applyStyle({ hover: true });
        layer.bringToFront();
      },
      mousemove(e) {
        const phase = viewPhaseRef.current;
        if ((phase !== "overview" && phase !== "state_focused") || selectedAreaRef.current) return;
        if (phase === "overview" && highlightAreaRef.current) return;
        setTooltipPos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
      },
      mouseout() {
        const phase = viewPhaseRef.current;
        if ((phase !== "overview" && phase !== "state_focused") || selectedAreaRef.current) return;
        if (phase === "overview" && highlightAreaRef.current) return;
        hoveredLayerRef.current = null;
        setTooltipInfo(null);
        setTooltipPos(null);
        applyStyle();
      },
      click() {
        const info = getInfo();
        if (!info) return;
        zoomAndOpenPanelRef.current?.(info.areaName, info);
      },
    });
  }, [mapConfig.codeProp, mapConfig.nameProp, onStatusListClose]);

  // ── Mark area ────────────────────────────────────────────────────────────
  const handleMark = useCallback(async (areaName, markTaken) => {
    setTakenAreas((prev) =>
      markTaken ? (prev.includes(areaName) ? prev : [...prev, areaName]) : prev.filter((a) => a !== areaName)
    );
    setSelectedArea((prev) =>
      prev?.areaName === areaName
        ? { ...prev, status: markTaken ? "taken" : (prev.count > 0 ? "available" : "noLeads"), count: markTaken ? 0 : prev.count }
        : prev
    );
    setToast(markTaken ? `✓ ${areaName} marked complete` : `${areaName} marked available`);
    setTimeout(() => setToast(null), 3000);

    const codes = areaMapping?.[areaName];
    const targets = getLayersForCodes(codes, layersByCodeRef);
    if (targets.length) flashLayers(targets, 3);

    try {
      await fetch("/api/exclusivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area: areaName, taken: markTaken }),
      });
    } catch {}
  }, [areaMapping]);

  // ── Mark individual lead ─────────────────────────────────────────────────
  const handleMarkLead = useCallback(async (title, markTaken) => {
    pendingLeadMarksRef.current.set(title, markTaken);
    setTakenLeads((prev) =>
      markTaken ? (prev.includes(title) ? prev : [...prev, title]) : prev.filter((t) => t !== title)
    );
    try {
      await fetch("/api/exclusivity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: title, taken: markTaken }),
      });
    } catch {} finally {
      pendingLeadMarksRef.current.delete(title);
    }
  }, []);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        height: mapHeight || "calc(100vh - 300px)", minHeight: 500,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: TK.leafletBg, borderRadius: 10, color: TK.muted,
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

  return (
    <div style={{ position: "relative", height: mapHeight || "calc(100vh - 300px)", overflow: "hidden", background: TK.leafletBg }}>
      <style>{`
        .leaflet-container { background: ${TK.leafletBg}; }
        .leaflet-control-zoom a { background: ${TK.zoomBg}; color: ${TK.zoomColor}; border-color: ${TK.zoomBorder}; }
        .leaflet-control-zoom a:hover { opacity: 0.8; }
        .leaflet-control-attribution { background: ${TK.attrBg}; color: ${TK.attrColor}; font-size: 10px !important; }
        .leaflet-control-attribution a { color: ${TK.muted} !important; }
        .map-label-tiles img { filter: brightness(1.4) contrast(1.12); }
      `}</style>

      <MapContainer
        style={{ height: "100%", width: "100%" }}
        center={overview.center}
        zoom={overview.zoom}
        minZoom={3}
        maxZoom={14}
        maxBounds={overview.maxBounds}
        maxBoundsViscosity={0.85}
        scrollWheelZoom={true}
      >
        <TileLayer
          key={`${theme}-base`}
          url={TK.tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={19}
          noWrap
        />
        {TK.labelTileUrl && (
          <TileLayer
            key={`${theme}-labels`}
            url={TK.labelTileUrl}
            subdomains="abcd"
            maxZoom={19}
            className="map-label-tiles"
            noWrap
          />
        )}
        {!targetArea && <MapOverviewLoader onPhaseChange={onPhaseChange} mapConfig={mapConfig} />}
        <MapHoverFixer hoveredLayerRef={hoveredLayerRef} onReset={resetHover} />
        <MapRefExposer onMapReady={stableOnMapReady} />
        {geojson && (
          <GeoJSON
            ref={geoJsonRef}
            key={geoJsonKey}
            data={geojson}
            onEachFeature={onEachFeature}
            smoothFactor={0}
          />
        )}
        {areaMapping && geojson && targetArea && (
          <MapNavigator
            targetArea={targetArea}
            jumpToken={jumpToken}
            areaMapping={areaMapping}
            layersByCodeRef={layersByCodeRef}
            geojson={geojson}
            mapConfig={mapConfig}
            introPlayedRef={introPlayedRef}
            slowIntro={slowIntro}
            onPhaseChangeRef={onPhaseChangeRef}
            onJumpCompleteRef={onJumpCompleteRef}
            onAfterFlashRef={onAfterFlashRef}
          />
        )}
        {stateRegionFilter && areaMapping && geojson && !targetArea && (
          <MapStateNavigator
            stateRegionFilter={stateRegionFilter}
            areaMapping={areaMapping}
            mapConfig={mapConfig}
            geojson={geojson}
            onPhaseChangeRef={onPhaseChangeRef}
          />
        )}
      </MapContainer>

      {(selectedArea || statusListFilter) && (
        <div
          onClick={() => {
            if (panelClosing || aggregateClosing) return;
            if (selectedArea) closePanel();
            else closeAggregatePanel();
          }}
          style={{
            position: "absolute", top: 0, left: 0, right: PANEL_WIDTH, bottom: 0,
            background: TK.dimmer, zIndex: 999, cursor: (panelClosing || aggregateClosing) ? "default" : "pointer",
            opacity: (panelClosing || aggregateClosing) ? 0 : 1, transition: "opacity 0.3s ease",
            pointerEvents: (panelClosing || aggregateClosing) ? "none" : "auto",
          }}
        />
      )}

      <HoverTooltip info={tooltipInfo} pos={tooltipPos} TK={TK} />
      <SlidePanel
        info={selectedArea}
        closing={panelClosing}
        leads={leads}
        takenLeads={takenLeads}
        onClose={closePanel}
        onMark={handleMark}
        onMarkLead={handleMarkLead}
        onViewLeads={(areaName) => { setSelectedArea(null); onAreaClick?.(areaName); }}
        onLeadClick={setModalLead}
        TK={TK}
      />
      {stateRegionFilter && !selectedArea && !statusListFilter && (
        <StateRegionPanel
          stateRegionFilter={stateRegionFilter}
          closing={stateRegionClosing}
          leads={leads}
          takenLeads={takenLeads}
          onClose={closeStatePanel}
          onMarkLead={handleMarkLead}
          onLeadClick={setModalLead}
          onViewTable={() => {
            closeStatePanel();
            const countryPath = mapConfig.countryCode.toLowerCase();
            window.location.href = `/${countryPath}?state=${encodeURIComponent(stateRegionFilter)}`;
          }}
          TK={TK}
        />
      )}
      {statusListFilter && (
        <AggregateLeadsPanel
          filter={statusListFilter}
          closing={aggregateClosing}
          leads={leads}
          takenLeads={takenLeads}
          takenAreas={takenAreas}
          areaMapping={areaMapping}
          areaLeadMap={areaLeadMap}
          onClose={closeAggregatePanel}
          onMarkLead={handleMarkLead}
          onLeadClick={setModalLead}
          onViewTable={() => {
            closeAggregatePanel();
            window.location.href = `/${mapConfig.countryCode.toLowerCase()}`;
          }}
          TK={TK}
        />
      )}
      {modalLead && (
        <LeadModal
          lead={modalLead}
          takenLeads={takenLeads}
          onMarkLead={handleMarkLead}
          onClose={() => setModalLead(null)}
          country={mapConfig.countryCode}
          theme={theme}
          showMapButton={false}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
