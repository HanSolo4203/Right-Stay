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

/** True when admin display label is only a postal code, not a city or neighbourhood. */
export function isPostcodeOnlyLocationLabel(label: string | null | undefined): boolean {
  if (!label?.trim()) return false;
  const value = label.trim();
  if (/^\d{4,5}(?:\s*,?\s*South Africa)?$/i.test(value)) return true;
  if (/^\d{4,5}\s*,?\s*[A-Za-z\s]+$/i.test(value) && !/\b(cape town|johannesburg|durban|pretoria|stellenbosch|hermanus|franschhoek|knysna|milnerton|century city|mouille point)\b/i.test(value)) {
    return true;
  }
  return false;
}

const CITY_FROM_ADDRESS_PATTERN =
  /\b(Cape Town|Johannesburg|Durban|Pretoria|Stellenbosch|Hermanus|Franschhoek|Knysna|Milnerton|Century City|Mouille Point)\b/i;

/** Extract a city name from a structured address string. */
export function extractCityFromAddress(address?: string | null): string | null {
  if (!address?.trim()) return null;
  const match = address.match(CITY_FROM_ADDRESS_PATTERN);
  return match?.[1] ?? null;
}

/** Best label for cards, search, and filters. */
export function resolvePropertyListingLocation(
  attributes?: Record<string, unknown> | null
): string {
  const fields = extractLocationFromAttributes(attributes);
  const display = fields.location_display?.trim();
  const address = fields.location_address?.trim();
  const name = typeof attributes?.name === 'string' ? attributes.name : '';
  const nickname = typeof attributes?.nickname === 'string' ? attributes.nickname : '';
  const description = typeof attributes?.description === 'string' ? attributes.description : '';

  if (display && !isPostcodeOnlyLocationLabel(display)) {
    return display;
  }

  const fromAddress = extractCityFromAddress(address);
  if (fromAddress) return fromAddress;

  const fromName = name.match(CITY_FROM_ADDRESS_PATTERN)?.[1]
    ?? nickname.match(CITY_FROM_ADDRESS_PATTERN)?.[1];
  if (fromName) return fromName;

  const inferred = inferLocationDisplayFromText(description, name || nickname);
  if (inferred !== 'Location to be confirmed') {
    return inferred;
  }

  return display || fromAddress || 'Cape Town';
}

/** Match search location against all known location fields on a property. */
export function propertyMatchesLocationFilter(
  attributes: Record<string, unknown> | undefined,
  locationFilter: string
): boolean {
  const filter = locationFilter.trim().toLowerCase();
  if (!filter) return true;

  const fields = extractLocationFromAttributes(attributes);
  const searchableText = [
    fields.location_display,
    fields.location_address,
    attributes?.name,
    attributes?.nickname,
    attributes?.description,
    resolvePropertyListingLocation(attributes),
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();

  return searchableText.includes(filter);
}
