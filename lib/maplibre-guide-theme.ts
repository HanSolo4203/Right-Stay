import type { Map as MapLibreMap } from 'maplibre-gl';

/**
 * Editorial guide palette — cream land, teal water, warm-gray roads.
 * Distinct from the booking map’s muted gray/green utility look.
 */
export const GUIDE_MAP = {
  background: '#efe4cf',
  land: '#f4ead6',
  park: '#cfe0bc',
  parkMuted: '#b4c9a0',
  parkWood: '#c3d6ae',
  water: '#6aada8',
  waterLine: '#4e938f',
  road: '#fbf6ec',
  roadCasing: '#d4c6b0',
  roadMajor: '#efe4d0',
  rail: '#cbbba4',
  building: '#e6d7c2',
  text: '#5c4e3d',
  textMuted: '#8a7b68',
  textHalo: '#f8f1e3',
  clusterSmall: '#c4b49a',
  clusterMedium: '#6f8f62',
  clusterLarge: '#337e2f',
  clusterStroke: '#f8f1e3',
  clusterText: '#f8f1e3',
} as const;

function layerExists(map: MapLibreMap, layerId: string): boolean {
  return Boolean(map.getLayer(layerId));
}

function setPaint(map: MapLibreMap, layerId: string, property: string, value: unknown): void {
  if (!layerExists(map, layerId)) return;
  try {
    map.setPaintProperty(layerId, property, value);
  } catch {
    // Layer may not support this paint property.
  }
}

function setLayout(map: MapLibreMap, layerId: string, property: string, value: unknown): void {
  if (!layerExists(map, layerId)) return;
  try {
    map.setLayoutProperty(layerId, property, value);
  } catch {
    // Layer may not support this layout property.
  }
}

/** Recolors the OpenFreeMap Liberty style into a warmer, guidebook-like map. */
export function applyGuideMapTheme(map: MapLibreMap): void {
  const apply = () => {
    setPaint(map, 'background', 'background-color', GUIDE_MAP.background);
    setPaint(map, 'natural_earth', 'raster-opacity', 0);

    const greenFills = [
      'park',
      'landcover_grass',
      'landcover_wood',
      'landuse_pitch',
      'landuse_track',
      'landuse_cemetery',
      'landuse_school',
      'landuse_hospital',
    ];
    for (const id of greenFills) {
      setPaint(map, id, 'fill-color', id === 'landcover_wood' ? GUIDE_MAP.parkWood : GUIDE_MAP.park);
      if (id === 'landcover_wood') {
        setPaint(map, id, 'fill-opacity', 0.55);
      } else if (id === 'park' || id === 'landcover_grass') {
        setPaint(map, id, 'fill-opacity', 0.72);
      }
    }
    setPaint(map, 'park_outline', 'line-color', GUIDE_MAP.parkMuted);
    setPaint(map, 'landuse_residential', 'fill-color', GUIDE_MAP.land);
    setPaint(map, 'landcover_sand', 'fill-color', '#edd9b8');

    setPaint(map, 'water', 'fill-color', GUIDE_MAP.water);
    setPaint(map, 'water', 'fill-opacity', 0.92);
    for (const layer of map.getStyle()?.layers ?? []) {
      const id = layer.id;
      if (!id?.startsWith('waterway')) continue;
      if (layer.type === 'line') {
        setPaint(map, id, 'line-color', GUIDE_MAP.waterLine);
      }
    }

    setPaint(map, 'building', 'fill-color', GUIDE_MAP.building);
    setPaint(map, 'building', 'fill-opacity', 0.62);

    if (layerExists(map, 'building-3d')) {
      setLayout(map, 'building-3d', 'visibility', 'visible');
      setPaint(map, 'building-3d', 'fill-extrusion-color', GUIDE_MAP.building);
      setPaint(map, 'building-3d', 'fill-extrusion-opacity', 0.4);
      setPaint(map, 'building-3d', 'fill-extrusion-vertical-gradient', false);
      setPaint(map, 'building-3d', 'fill-extrusion-height', [
        'min',
        ['*', ['coalesce', ['get', 'render_height'], 6], 0.45],
        28,
      ]);
      setPaint(map, 'building-3d', 'fill-extrusion-base', [
        'coalesce',
        ['get', 'render_min_height'],
        0,
      ]);
    }

    for (const layer of map.getStyle()?.layers ?? []) {
      const id = layer.id;
      if (!id) continue;

      if (layer.type === 'line') {
        const isRoad =
          id.startsWith('road_') ||
          id.startsWith('tunnel_') ||
          id.startsWith('bridge_');
        if (!isRoad) continue;

        if (id.includes('rail') || id.includes('transit')) {
          setPaint(map, id, 'line-color', GUIDE_MAP.rail);
          continue;
        }

        if (id.includes('casing') || id.includes('hatching')) {
          setPaint(map, id, 'line-color', GUIDE_MAP.roadCasing);
        } else if (
          id.includes('motorway') ||
          id.includes('trunk') ||
          id.includes('primary') ||
          id.includes('secondary') ||
          id.includes('tertiary')
        ) {
          setPaint(map, id, 'line-color', GUIDE_MAP.roadMajor);
        } else {
          setPaint(map, id, 'line-color', GUIDE_MAP.road);
        }
      }

      if (layer.type === 'symbol') {
        const isLabel =
          id.startsWith('label_') ||
          id.startsWith('highway') ||
          id.startsWith('water_') ||
          id === 'airport';
        if (isLabel) {
          const muted = id.includes('water') || id.includes('housenumber');
          setPaint(map, id, 'text-color', muted ? GUIDE_MAP.textMuted : GUIDE_MAP.text);
          setPaint(map, id, 'text-halo-color', GUIDE_MAP.textHalo);
        }
        if (id.startsWith('poi_')) {
          setLayout(map, id, 'visibility', 'none');
        }
      }
    }
  };

  if (map.isStyleLoaded()) {
    apply();
  } else {
    map.once('load', apply);
  }
}
