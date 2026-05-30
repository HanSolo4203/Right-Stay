import type { Map as MapLibreMap } from 'maplibre-gl';

/** Palette aligned with the booking page (Tailwind gray + right-stay green). */
export const RIGHT_STAY_MAP = {
  background: '#f9fafb',
  land: '#f3f4f6',
  park: '#f0f7ef',
  parkMuted: '#d9ead7',
  water: '#d9ead7',
  waterLine: '#b8d6b5',
  road: '#ffffff',
  roadCasing: '#e5e7eb',
  roadMajor: '#f3f4f6',
  building: '#e5e7eb',
  building3d: '#d9ead7',
  building3dTop: '#b8d6b5',
  text: '#374151',
  textMuted: '#6b7280',
  textHalo: '#ffffff',
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

/** Recolors the OpenFreeMap Liberty style to match Right Stay booking UI. */
export function applyRightStayMapTheme(map: MapLibreMap): void {
  const apply = () => {
    setPaint(map, 'background', 'background-color', RIGHT_STAY_MAP.background);
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
      setPaint(map, id, 'fill-color', RIGHT_STAY_MAP.park);
      if (id === 'landcover_wood') {
        setPaint(map, id, 'fill-opacity', 0.35);
      }
    }
    setPaint(map, 'park_outline', 'line-color', RIGHT_STAY_MAP.parkMuted);
    setPaint(map, 'landuse_residential', 'fill-color', RIGHT_STAY_MAP.land);

    setPaint(map, 'water', 'fill-color', RIGHT_STAY_MAP.water);
    for (const layer of map.getStyle()?.layers ?? []) {
      const id = layer.id;
      if (!id?.startsWith('waterway')) continue;
      if (layer.type === 'line') {
        setPaint(map, id, 'line-color', RIGHT_STAY_MAP.waterLine);
      }
    }

    setPaint(map, 'building', 'fill-color', RIGHT_STAY_MAP.building);
    setPaint(map, 'building', 'fill-opacity', 0.55);

    // Softer 3D: shorter extrusions, flat color, low opacity (less blocky).
    if (layerExists(map, 'building-3d')) {
      setPaint(map, 'building-3d', 'fill-extrusion-color', RIGHT_STAY_MAP.building);
      setPaint(map, 'building-3d', 'fill-extrusion-opacity', 0.32);
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
          setPaint(map, id, 'line-color', RIGHT_STAY_MAP.roadCasing);
          continue;
        }

        if (id.includes('casing') || id.includes('hatching')) {
          setPaint(map, id, 'line-color', RIGHT_STAY_MAP.roadCasing);
        } else if (
          id.includes('motorway') ||
          id.includes('trunk') ||
          id.includes('primary') ||
          id.includes('secondary') ||
          id.includes('tertiary')
        ) {
          setPaint(map, id, 'line-color', RIGHT_STAY_MAP.roadMajor);
        } else {
          setPaint(map, id, 'line-color', RIGHT_STAY_MAP.road);
        }
      }

      if (layer.type === 'symbol') {
        const isLabel =
          id.startsWith('label_') ||
          id.startsWith('highway') ||
          id.startsWith('water_') ||
          id === 'airport';
        if (isLabel) {
          setPaint(map, id, 'text-color', RIGHT_STAY_MAP.text);
          setPaint(map, id, 'text-halo-color', RIGHT_STAY_MAP.textHalo);
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
