import { AU_AREA_GROUPS, AU_AREAS, getAreasForState, normaliseState } from "@/lib/au-areas";
import { buildAuMapUrl } from "@/lib/au-map-nav";
import { NZ_AREA_NAMES, cityToArea, getAreasForRegion, normaliseRegion } from "@/lib/nz-areas";
import { buildNzMapUrl } from "@/lib/nz-map-nav";

const AREA_STOP_WORDS = new Set([
  "area", "inner", "outer", "north", "south", "east", "west",
  "upper", "lower", "coast", "hills", "vale", "valley", "bay",
  "beach", "lake", "port", "central", "city", "rural",
]);

function getCandidateAreas(lead, country = "AU") {
  if (country === "NZ") return NZ_AREA_NAMES;
  const state = normaliseState(lead.state);
  const stateAreas = state ? getAreasForState(state) : [];
  return stateAreas.length > 0
    ? stateAreas
    : AU_AREA_GROUPS.flatMap((g) => g.areas);
}

function scoreAreaMatch(area, city, source) {
  const areaLower = area.toLowerCase();
  let score = 0;
  if (source && source.includes(areaLower)) score += 200;
  if (city.length >= 3 && areaLower.includes(city)) score += 80 + city.length;
  if (city.length >= 3) {
    const cityWords = city.split(/[\s\-\/]+/).filter((w) => w.length >= 3 && !AREA_STOP_WORDS.has(w));
    for (const word of cityWords) {
      if (areaLower.includes(word)) score += word.length * 2;
    }
    const areaWords = areaLower.split(/[\s\-\/]+/).filter((w) => w.length >= 4 && !AREA_STOP_WORDS.has(w));
    for (const word of areaWords) {
      if (city.includes(word)) score += word.length;
    }
  }
  return score;
}

function pickBestAreaMatch(candidates, city, source) {
  let best = null;
  let bestScore = 0;
  for (const area of candidates) {
    const score = scoreAreaMatch(area, city, source);
    if (score > bestScore) {
      bestScore = score;
      best = area;
    }
  }
  return bestScore >= 8 ? best : null;
}

export function getLeadArea(lead, country = "AU") {
  if (country === "NZ") {
    const fromCity = cityToArea(lead.city);
    if (fromCity) return fromCity;
  }

  const candidates = getCandidateAreas(lead, country);
  const source = (lead._source || "").toLowerCase();
  const city = (lead.city || "").toLowerCase();

  for (const area of candidates) {
    if (source.includes(area.toLowerCase())) return area;
  }

  if (city.length >= 3) {
    const exactCityMatches = candidates.filter((area) => area.toLowerCase().includes(city));
    if (exactCityMatches.length === 1) return exactCityMatches[0];
    if (exactCityMatches.length > 1) {
      const fromSource = exactCityMatches.find((area) => source.includes(area.toLowerCase()));
      if (fromSource) return fromSource;
      return exactCityMatches.sort((a, b) => a.length - b.length)[0];
    }
  }

  return pickBestAreaMatch(candidates, city, source);
}

export function getMapUrlForLead(lead, { stateOnly = false, country = "AU" } = {}) {
  if (country === "NZ") {
    const region = normaliseRegion(lead.state);
    const area = getLeadArea(lead, "NZ");
    if (area && !stateOnly) {
      return buildNzMapUrl({ area, intro: true, openPanel: true });
    }
    if (region) {
      if (stateOnly) {
        return buildNzMapUrl({ region, zoom: "region", intro: true, statePanel: true });
      }
      return buildNzMapUrl({
        region,
        zoom: "region",
        panelArea: getAreasForRegion(region)[0],
        intro: true,
        openPanel: true,
      });
    }
    return area ? buildNzMapUrl({ area, intro: true, openPanel: true }) : null;
  }

  const state = normaliseState(lead.state);
  const area = getLeadArea(lead, "AU");
  if (area && !stateOnly) {
    return buildAuMapUrl({ area, zoom: "area", intro: true, openPanel: true });
  }
  if (state) {
    if (stateOnly) {
      return buildAuMapUrl({ state, zoom: "state", intro: true, statePanel: true });
    }
    return buildAuMapUrl({
      state,
      zoom: "state",
      panelArea: getAreasForState(state)[0],
      intro: true,
      openPanel: true,
    });
  }
  if (area) {
    return buildAuMapUrl({ area, zoom: "area", intro: true, openPanel: true });
  }
  return null;
}
