/** Default map centre (Cape Town) when no coordinates are set. */
export const DEFAULT_MAP_CENTER: [number, number] = [-33.9249, 18.4241];
export const DEFAULT_MAP_ZOOM = 13;

/** Closer neighborhood view when a guest is staying at a known property. */
export const GUIDE_PROPERTY_MAP_ZOOM = 15;

/** City-overview tilt — high enough to read as 3D without laying the map on its side. */
export const GUIDE_MAP_OVERVIEW_PITCH = 32;
/** Neighborhood tilt — close to the booking map, slightly gentler for many pins. */
export const GUIDE_MAP_PITCH = 36;
export const GUIDE_MAP_BEARING = -20;

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

/** OpenStreetMap raster tiles. No API key; fine for the admin pin picker and light public maps. */
export const MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

/** Same keyless basemap for the public Leaflet booking map. */
export const MAP_BOOKING_TILE_URL = MAP_TILE_URL;

export const MAP_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
