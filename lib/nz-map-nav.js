import {
  NZ_AREA_GROUPS,
  NZ_AREA_NAMES,
  NZ_AREAS,
  getAreasForRegion,
  normaliseRegion,
} from "@/lib/nz-areas";

export function buildNzMapUrl({
  area,
  region,
  zoom = "area",
  intro = true,
  openPanel = false,
  panelArea,
  statePanel = false,
} = {}) {
  const params = new URLSearchParams();
  const validArea = area && NZ_AREA_NAMES.includes(area) ? area : null;
  const normalizedRegion = normaliseRegion(region);
  const validRegion = normalizedRegion && getAreasForRegion(normalizedRegion).length > 0
    ? normalizedRegion
    : null;
  const resolvedPanelArea = panelArea && NZ_AREA_NAMES.includes(panelArea)
    ? panelArea
    : validArea || (validRegion ? getAreasForRegion(validRegion)[0] : null);

  if (zoom === "region" && validRegion) {
    params.set("region", validRegion);
    params.set("zoom", "region");
    if (resolvedPanelArea && !statePanel) params.set("panelArea", resolvedPanelArea);
  } else if (validArea) {
    params.set("area", validArea);
    if (resolvedPanelArea) params.set("panelArea", resolvedPanelArea);
  } else if (validRegion) {
    params.set("region", validRegion);
    params.set("zoom", "region");
    if (resolvedPanelArea) params.set("panelArea", resolvedPanelArea);
  }

  if (openPanel && resolvedPanelArea) params.set("panel", "1");
  if (statePanel && zoom === "region" && validRegion) params.set("statePanel", "1");
  if (intro && (params.has("area") || params.has("region"))) params.set("intro", "1");

  const qs = params.toString();
  return qs ? `/nz/map?${qs}` : "/nz/map";
}

export function parseNzMapUrl(search = "") {
  const params = new URLSearchParams(search);
  const area = params.get("area");
  const region = params.get("region");
  const panelAreaParam = params.get("panelArea");
  const validArea = area && NZ_AREA_NAMES.includes(area) ? area : null;
  const normalizedRegion = normaliseRegion(region);
  const validRegion = normalizedRegion && getAreasForRegion(normalizedRegion).length > 0
    ? normalizedRegion
    : null;
  const zoom = params.get("zoom") === "region" && validRegion ? "region" : "area";
  const panelArea = (panelAreaParam && NZ_AREA_NAMES.includes(panelAreaParam) ? panelAreaParam : null)
    || validArea
    || (validRegion ? getAreasForRegion(validRegion)[0] : null);
  const group = panelArea
    ? NZ_AREA_GROUPS.find((g) => g.areas.includes(panelArea))?.label || null
    : validRegion
      ? NZ_AREA_GROUPS.find((g) => g.areas.some((a) => NZ_AREAS[a]?.region === validRegion))?.label || null
      : null;

  const statePanel = params.get("statePanel") === "1";
  return {
    area: zoom === "area" ? validArea : null,
    region: validRegion,
    panelArea: statePanel ? null : panelArea,
    zoom,
    group,
    intro: params.get("intro") === "1" || !!(validArea || validRegion),
    openPanel: params.get("panel") === "1",
    statePanel,
  };
}
