/** Default map centre (Cape Town) when no coordinates are set. */
export const DEFAULT_MAP_CENTER: [number, number] = [-33.9249, 18.4241];
export const DEFAULT_MAP_ZOOM = 13;

/** Booking map zoom — slightly pulled back for neighborhood context. */
export const PROPERTY_BOOKING_MAP_ZOOM = 15.75;

/** Gentle oblique view; lower pitch keeps buildings from feeling chunky. */
export const PROPERTY_BOOKING_MAP_PITCH = 38;
export const PROPERTY_BOOKING_MAP_BEARING = -24;

/** Keeps the pin comfortably in frame when zoomed out. */
export const PROPERTY_BOOKING_MAP_PADDING = {
  top: 36,
  bottom: 36,
  left: 36,
  right: 36,
} as const;

/**
 * Free vector style with 3D building extrusions (OpenFreeMap).
 * Override with NEXT_PUBLIC_MAPLIBRE_STYLE_URL if needed.
 */
export const MAPLIBRE_BOOKING_STYLE_URL =
  process.env.NEXT_PUBLIC_MAPLIBRE_STYLE_URL ??
  'https://tiles.openfreemap.org/styles/liberty';

/** Free Carto Voyager tiles — detailed basemap for admin pin placement. */
export const MAP_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

/** Light Carto tiles — minimal palette aligned with the public site. */
export const MAP_BOOKING_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
