import type { Map as MapLibreMap } from 'maplibre-gl';
import { applyRightStayMapTheme } from '@/lib/maplibre-right-stay-theme';

/** Branded DOM marker matching existing Leaflet pin styles. */
export function createBookingMapMarkerElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'property-map-marker property-map-marker--booking';
  el.innerHTML =
    '<span class="property-map-marker-pin property-map-marker-pin--booking" aria-hidden="true"></span>';
  return el;
}

/** 3D terrain + Right Stay visual theme for booking maps. */
export function enhanceMapLibre3D(map: MapLibreMap): void {
  const apply = () => {
    applyRightStayMapTheme(map);

    // Flat ground reads cleaner next to simplified building volumes.
    if (map.getTerrain()) {
      map.setTerrain(null);
    }
  };

  if (map.isStyleLoaded()) {
    apply();
  } else {
    map.once('load', apply);
  }
}
