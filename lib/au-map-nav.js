import { AU_AREA_GROUPS, AU_AREA_NAMES, AU_AREAS, getAreasForState, normaliseState } from "@/lib/au-areas";

export function buildAuMapUrl({
  area,
  state,
  zoom = "area",
  intro = true,
  openPanel = false,
  panelArea,
} = {}) {
  const params = new URLSearchParams();
  const validArea = area && AU_AREA_NAMES.includes(area) ? area : null;
  const normalizedState = normaliseState(state);
  const validState = normalizedState && getAreasForState(normalizedState).length > 0 ? normalizedState : null;
  const resolvedPanelArea = panelArea && AU_AREA_NAMES.includes(panelArea)
    ? panelArea
    : validArea || (validState ? getAreasForState(validState)[0] : null);

  if (zoom === "state" && validState) {
    params.set("state", validState);
    params.set("zoom", "state");
    if (resolvedPanelArea) params.set("panelArea", resolvedPanelArea);
  } else if (validArea) {
    params.set("area", validArea);
    if (resolvedPanelArea) params.set("panelArea", resolvedPanelArea);
  } else if (validState) {
    params.set("state", validState);
    params.set("zoom", "state");
    if (resolvedPanelArea) params.set("panelArea", resolvedPanelArea);
  }

  if (openPanel && resolvedPanelArea) params.set("panel", "1");
  if (intro && (params.has("area") || params.has("state"))) params.set("intro", "1");

  const qs = params.toString();
  return qs ? `/au/map?${qs}` : "/au/map";
}

export function parseAuMapUrl(search = "") {
  const params = new URLSearchParams(search);
  const area = params.get("area");
  const state = params.get("state");
  const panelAreaParam = params.get("panelArea");
  const validArea = area && AU_AREA_NAMES.includes(area) ? area : null;
  const normalizedState = normaliseState(state);
  const validState = normalizedState && getAreasForState(normalizedState).length > 0 ? normalizedState : null;
  const zoom = params.get("zoom") === "state" && validState ? "state" : "area";
  const panelArea = (panelAreaParam && AU_AREA_NAMES.includes(panelAreaParam) ? panelAreaParam : null)
    || validArea
    || (validState ? getAreasForState(validState)[0] : null);
  const group = panelArea
    ? AU_AREA_GROUPS.find((g) => g.areas.includes(panelArea))?.label || null
    : validState
      ? AU_AREA_GROUPS.find((g) => g.areas.some((a) => AU_AREAS[a]?.state === validState))?.label || null
      : null;

  return {
    area: zoom === "area" ? validArea : null,
    state: validState,
    panelArea,
    zoom,
    group,
    intro: params.get("intro") === "1" || !!(validArea || validState),
    openPanel: params.get("panel") === "1",
  };
}
