export interface PropertyLocationFields {
  location_address?: string | null;
  location_display?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  if (!Number.isFinite(n)) return null;
  return n;
}

export function extractLocationFromAttributes(
  attributes?: Record<string, unknown> | null
): PropertyLocationFields {
  if (!attributes) return {};
  return {
    location_address:
      typeof attributes.location_address === 'string'
        ? attributes.location_address
        : null,
    location_display:
      typeof attributes.location_display === 'string'
        ? attributes.location_display
        : null,
    latitude: parseCoordinate(attributes.latitude),
    longitude: parseCoordinate(attributes.longitude),
  };
}

export function locationFieldsForAttributes(body: Record<string, unknown>) {
  return {
    location_address: String(body.location_address ?? '').trim() || null,
    location_display: String(body.location_display ?? '').trim() || null,
    latitude: parseCoordinate(body.latitude),
    longitude: parseCoordinate(body.longitude),
  };
}

/** Keep admin-entered map location when syncing property data from Uplisting. */
export function mergePreservedLocationAttributes(
  incoming: Record<string, unknown>,
  existing: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...incoming };
  const existingLocation = extractLocationFromAttributes(existing);
  const incomingLocation = extractLocationFromAttributes(incoming);

  const preserveCoords =
    hasValidMapCoordinates(
      existingLocation.latitude,
      existingLocation.longitude
    ) &&
    !hasValidMapCoordinates(
      incomingLocation.latitude,
      incomingLocation.longitude
    );

  if (preserveCoords) {
    merged.latitude = existingLocation.latitude;
    merged.longitude = existingLocation.longitude;
  }

  for (const key of ['location_address', 'location_display'] as const) {
    const existingValue = existing[key];
    const incomingValue = incoming[key];
    if (
      existingValue &&
      (incomingValue === undefined || incomingValue === null || incomingValue === '')
    ) {
      merged[key] = existingValue;
    }
  }

  return merged;
}

export function hasValidMapCoordinates(
  lat?: number | null,
  lng?: number | null
): boolean {
  if (lat == null || lng == null) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  // Null island is almost never a real property location.
  if (Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001) return false;
  return true;
}

/** Fallback label when location_display is not set in admin. */
export function inferLocationDisplayFromText(
  description?: string,
  name?: string
): string {
  const text = [description, name].filter(Boolean).join('\n');
  const patterns = [
    /(?:located in|situated in|in the heart of)\s+([^.\n]+)/i,
    /\b([A-Za-z][A-Za-z\s'-]+,\s*(?:South Africa|Kenya|Zimbabwe|Botswana|Namibia|Morocco|Egypt|Tanzania|Rwanda|Uganda))\b/i,
    /\b(Cape Town|Johannesburg|Durban|Pretoria|Stellenbosch|Hermanus|Franschhoek|Knysna)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return name ? 'South Africa' : 'Location to be confirmed';
}
