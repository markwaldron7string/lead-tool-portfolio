"use client";

import { CountrySelect } from "@/app/components/CountrySelect";
import { MAP_OCEAN_BG } from "@/lib/map-config";
import { useMediaQuery } from "@/lib/use-media-query";

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

export function getMapHeaderTokens(dark) {
  return {
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
  };
}

function mapSelectStyle(H, dark) {
  const stroke = dark ? "%23d1d5db" : "%23374151";
  const chevron = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`
  );
  return {
    background: H.selBg,
    border: `1px solid ${H.selBdr}`,
    color: H.selClr,
    borderRadius: 6,
    padding: "5px 28px 5px 10px",
    fontSize: 12,
    cursor: "pointer",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,${chevron}")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    backgroundSize: "12px",
    minWidth: 0,
    flexShrink: 0,
  };
}

const LEGEND_ITEMS = [
  { key: "available", label: "Available", color: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  { key: "taken",     label: "Taken",     color: "#64748b", glow: null },
];

function HeaderDivider({ H }) {
  return <div style={{ width: 1, height: 20, background: H.divider, flexShrink: 0 }} />;
}

function LegendButtons({ stats, statusListFilter, onLegendClick, H, stacked }) {
  return (
    <div style={{
      display: "flex",
      gap: stacked ? 10 : 14,
      alignItems: "center",
      flexShrink: 0,
      flexWrap: stacked ? "wrap" : "nowrap",
      width: stacked ? "100%" : undefined,
    }}>
      {LEGEND_ITEMS.map(({ key, label, color, glow }) => {
        const active = statusListFilter === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onLegendClick(key)}
            title={`View ${label.toLowerCase()} leads`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              background: active ? `${color}18` : "transparent",
              border: `1px solid ${active ? `${color}55` : "transparent"}`,
              borderRadius: 6,
              padding: "4px 8px",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              display: "inline-block",
              flexShrink: 0,
              boxShadow: glow ? `0 0 5px ${glow}` : "none",
            }} />
            <span style={{ color: H.muted }}>{label}</span>
            <span style={{ fontFamily: "monospace", fontWeight: 600, color: H.text, fontSize: 11 }}>
              {stats[key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function MapPageHeader({
  country,
  backHref,
  theme,
  onToggleTheme,
  selectedGroup,
  onGroupChange,
  groupOptions,
  groupPlaceholder,
  selectedArea,
  onAreaChange,
  areaOptions,
  areaPlaceholder,
  areaDisabled,
  onReset,
  stats,
  statusListFilter,
  onLegendClick,
}) {
  const stacked = useMediaQuery("(max-width: 1023px)");
  const dark = theme !== "light";
  const H = getMapHeaderTokens(dark);
  const selectStyle = mapSelectStyle(H, dark);

  const btnStyle = {
    background: H.btnBg,
    border: `1px solid ${H.btnBdr}`,
    color: H.muted,
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 12,
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  };

  const themeBtn = (
    <button
      type="button"
      onClick={onToggleTheme}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={btnStyle}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );

  const backBtn = (
    <a
      href={backHref}
      style={{ ...btnStyle, textDecoration: "none", width: 30, height: 30, padding: 0 }}
      title="Back to leads table"
    >
      ←
    </a>
  );

  const titleBlock = (
    <div style={{
      fontWeight: 600,
      fontSize: 14,
      color: H.text,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      gap: 6,
      minWidth: 0,
    }}>
      <CountrySelect country={country} fontSize={14} target="map" />
      Coverage Map
    </div>
  );

  const filterControls = (
    <>
      <select
        value={selectedGroup}
        onChange={onGroupChange}
        style={{ ...selectStyle, maxWidth: stacked ? undefined : 180, flex: stacked ? "1 1 140px" : undefined }}
      >
        <option value="">{groupPlaceholder}</option>
        {groupOptions.map(({ label, value }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select
        value={selectedArea}
        onChange={onAreaChange}
        disabled={areaDisabled}
        style={{
          ...selectStyle,
          maxWidth: stacked ? undefined : 230,
          flex: stacked ? "1 1 180px" : undefined,
          opacity: areaDisabled ? 0.4 : 1,
          cursor: areaDisabled ? "not-allowed" : "pointer",
        }}
      >
        <option value="">{areaPlaceholder}</option>
        {areaOptions.map(({ label, value }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <button type="button" onClick={onReset} style={btnStyle}>Reset view</button>
    </>
  );

  if (stacked) {
    return (
      <header style={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "8px 12px",
        borderBottom: `1px solid ${H.border}`,
        background: H.bg,
        backdropFilter: "blur(8px)",
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          {backBtn}
          {titleBlock}
          <div style={{ flex: 1 }} />
          {themeBtn}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {filterControls}
        </div>

        <LegendButtons
          stats={stats}
          statusListFilter={statusListFilter}
          onLegendClick={onLegendClick}
          H={H}
          stacked
        />
      </header>
    );
  }

  return (
    <header style={{
      height: 56,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 16px",
      flexWrap: "nowrap",
      borderBottom: `1px solid ${H.border}`,
      background: H.bg,
      backdropFilter: "blur(8px)",
      zIndex: 10,
      overflow: "hidden",
    }}>
      {backBtn}
      {titleBlock}
      <HeaderDivider H={H} />
      {filterControls}
      <div style={{ flex: 1, minWidth: 8 }} />
      <LegendButtons
        stats={stats}
        statusListFilter={statusListFilter}
        onLegendClick={onLegendClick}
        H={H}
        stacked={false}
      />
      <HeaderDivider H={H} />
      {themeBtn}
    </header>
  );
}
