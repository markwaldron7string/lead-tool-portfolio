import {
  AU_AREA_GROUPS,
  AU_AREAS,
  AU_AREA_NAMES,
  getAreasForState,
  normaliseState,
} from "@/lib/au-areas";
import {
  NZ_AREA_GROUPS,
  NZ_AREAS,
  NZ_AREA_NAMES,
  getAreasForRegion,
  normaliseRegion,
} from "@/lib/nz-areas";

/** CARTO basemap ocean fill (light_all / dark_nolabels) for seamless map gutters. */
export const MAP_OCEAN_BG = {
  light: "#d4dadc",
  dark: "#262626",
};

export const MAP_CONFIG = {
  AU: {
    areas: AU_AREAS,
    areaGroups: AU_AREA_GROUPS,
    areaNames: AU_AREA_NAMES,
    getAreasForGroup: getAreasForState,
    normaliseGroup: normaliseState,
    groupLabel: "State / Territory",
    areaLabel: "area",
    geojsonUrl: "/au-sa4.geojson",
    mappingUrl: "/area-mapping.json",
    codeProp: "sa4_code_2021",
    nameProp: "sa4_name_2021",
    overviewCenter: [-26.2, 134.0],
    overviewZoom: 4,
    overviewBounds: [[-44, 113], [-10, 154]],
    leadsTablePath: "/au",
    mapTitle: "Australia Coverage Map",
    countryCode: "AU",
  },
  NZ: {
    areas: NZ_AREAS,
    areaGroups: NZ_AREA_GROUPS,
    areaNames: NZ_AREA_NAMES,
    getAreasForGroup: getAreasForRegion,
    normaliseGroup: normaliseRegion,
    groupLabel: "Region",
    areaLabel: "city",
    geojsonUrl: "/nz-areas.geojson",
    mappingUrl: "/nz-area-mapping.json",
    codeProp: "area_code",
    nameProp: "area_name",
    overviewCenter: [-41.0, 172.5],
    overviewZoom: 5,
    overviewBounds: [[-47.5, 166], [-34, 179]],
    preferGeojsonBounds: true,
    overviewAlignRight: true,
    maxBoundsPad: { lat: 2, lngWest: 3, lngEast: 0 },
    leadsTablePath: "/nz",
    mapTitle: "New Zealand Coverage Map",
    countryCode: "NZ",
  },
};

export function getMapConfig(country = "AU") {
  return MAP_CONFIG[country] || MAP_CONFIG.AU;
}
