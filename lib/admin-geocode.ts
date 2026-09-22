import { DEFAULT_MAP_CENTER } from '@/lib/map-config';
import {
  fetchGooglePlaceProfile,
  searchGooglePlaceProfile,
  type GooglePlaceProfile,
} from '@/lib/google-place-profile';
import type { GuidePriceLevel } from '@/types/guide';

const [CAPE_TOWN_LAT, CAPE_TOWN_LNG] = DEFAULT_MAP_CENTER;
const SEARCH_RADIUS_METERS = 50_000;
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_HEADERS = {
  'User-Agent': 'RightStayAfrica/1.0 (property-admin-geocode)',
  Accept: 'application/json',
};

export type AddressSuggestion = {
  id: string;
  primary: string;
  secondary: string;
  lat?: number;
  lng?: number;
  address?: string;
};

export type ResolvedAddress = {
  lat: number;
  lng: number;
  displayName: string;
  name?: string;
  provider: 'google' | 'nominatim';
  googlePlaceId?: string;
  shortDescription?: string;
  description?: string;
  websiteUrl?: string | null;
  phone?: string | null;
  priceLevel?: GuidePriceLevel | null;
  photoCount?: number;
};

type GoogleText = { text?: string };

type GooglePlacePrediction = {
  placeId?: string;
  text?: GoogleText;
  structuredFormat?: {
    mainText?: GoogleText;
    secondaryText?: GoogleText;
  };
};

type GooglePlaceDetails = {
  formattedAddress?: string;
  displayName?: GoogleText;
  location?: { latitude?: number; longitude?: number };
};

type GoogleGeocodeResult = {
  formatted_address?: string;
  name?: string;
  geometry?: { location?: { lat: number; lng: number } };
};

type NominatimHit = {
  place_id?: number | string;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
};

function getGoogleMapsApiKey() {
  return (
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    ''
  );
}

function splitDisplayName(displayName: string) {
  const parts = displayName.split(',').map((part) => part.trim()).filter(Boolean);
  return {
    primary: parts[0] || displayName,
    secondary: parts.slice(1).join(', '),
  };
}

async function googleJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(url, { ...init, next: { revalidate: 0 } });
  const data = (await response.json()) as T & {
    status?: string;
    error_message?: string;
    error?: { message?: string; status?: string };
  };
  if (!response.ok) {
    throw new Error(data.error?.message || data.error_message || 'Google Maps request failed.');
  }
  return data;
}

function googleOk(status: string) {
  return status === 'OK' || status === 'ZERO_RESULTS';
}

export async function suggestAddresses(
  query: string,
  sessionToken?: string
): Promise<{ suggestions: AddressSuggestion[]; provider: 'google' | 'nominatim' }> {
  const key = getGoogleMapsApiKey();
  if (key) {
    try {
      const data = await googleJson<{ suggestions?: Array<{ placePrediction?: GooglePlacePrediction }> }>(
        'https://places.googleapis.com/v1/places:autocomplete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask':
              'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
          },
          body: JSON.stringify({
            input: query,
            languageCode: 'en',
            includedRegionCodes: ['za'],
            locationBias: {
              circle: {
                center: { latitude: CAPE_TOWN_LAT, longitude: CAPE_TOWN_LNG },
                radius: SEARCH_RADIUS_METERS,
              },
            },
            ...(sessionToken ? { sessionToken } : {}),
          }),
        }
      );

      const suggestions = (data.suggestions || [])
        .map((entry) => entry.placePrediction)
        .filter((prediction): prediction is GooglePlacePrediction => Boolean(prediction?.placeId))
        .map((prediction) => ({
          id: prediction.placeId as string,
          primary:
            prediction.structuredFormat?.mainText?.text ||
            prediction.text?.text ||
            'Unknown place',
          secondary:
            prediction.structuredFormat?.secondaryText?.text ||
            prediction.text?.text ||
            '',
        }));
      return { suggestions, provider: 'google' };
    } catch (error) {
      console.warn('Google Places autocomplete failed, falling back:', error);
    }
  }

  return {
    suggestions: await nominatimSuggest(query),
    provider: 'nominatim',
  };
}

function fromGoogleProfile(profile: GooglePlaceProfile): ResolvedAddress {
  return {
    lat: profile.lat,
    lng: profile.lng,
    displayName: profile.address || profile.name,
    name: profile.name,
    provider: 'google',
    googlePlaceId: profile.googlePlaceId,
    shortDescription: profile.shortDescription,
    description: profile.description,
    websiteUrl: profile.websiteUrl,
    phone: profile.phone,
    priceLevel: profile.priceLevel,
    photoCount: profile.photos.length,
  };
}

export async function resolvePlaceId(
  placeId: string,
  sessionToken?: string
): Promise<ResolvedAddress | null> {
  const profile = await fetchGooglePlaceProfile(placeId);
  if (profile) return fromGoogleProfile(profile);

  const key = getGoogleMapsApiKey();
  if (!key) return null;

  const data = await googleJson<GooglePlaceDetails>(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId.replace(/^places\//, ''))}`,
    {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
        ...(sessionToken ? { 'X-Goog-Session-Token': sessionToken } : {}),
      },
    }
  );

  const lat = data.location?.latitude;
  const lng = data.location?.longitude;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  return {
    lat,
    lng,
    displayName: data.formattedAddress || data.displayName?.text || '',
    name: data.displayName?.text,
    provider: 'google',
    googlePlaceId: placeId.replace(/^places\//, ''),
  };
}

export async function geocodeAddress(
  query: string,
  options: { includeProfile?: boolean } = {}
): Promise<ResolvedAddress | null> {
  if (options.includeProfile) {
    try {
      const profile = await searchGooglePlaceProfile(query);
      if (profile) return fromGoogleProfile(profile);
    } catch (error) {
      console.warn('Google place profile search failed, falling back:', error);
    }
  }

  const key = getGoogleMapsApiKey();
  if (key) {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
      url.searchParams.set('address', query);
      url.searchParams.set('key', key);
      url.searchParams.set('language', 'en');
      url.searchParams.set('region', 'za');
      url.searchParams.set(
        'bounds',
        `${CAPE_TOWN_LAT - 0.45},${CAPE_TOWN_LNG - 0.45}|${CAPE_TOWN_LAT + 0.45},${CAPE_TOWN_LNG + 0.45}`
      );

      const data = await googleJson<{ results?: GoogleGeocodeResult[]; status: string; error_message?: string }>(
        url.toString()
      );
      if (googleOk(data.status)) {
        const hit = data.results?.[0];
        if (hit?.geometry?.location) {
          return {
            lat: hit.geometry.location.lat,
            lng: hit.geometry.location.lng,
            displayName: hit.formatted_address || query,
            name: hit.name,
            provider: 'google',
          };
        }
        return null;
      }
      console.warn('Google geocode denied, falling back:', data.status, data.error_message);
    } catch (error) {
      console.warn('Google geocode failed, falling back:', error);
    }
  }

  const hits = await nominatimSearch(query, 1);
  const hit = hits[0];
  if (!hit) return null;
  return {
    lat: parseFloat(hit.lat),
    lng: parseFloat(hit.lon),
    displayName: hit.display_name,
    name: hit.name,
    provider: 'nominatim',
  };
}

async function nominatimSearch(query: string, limit: number): Promise<NominatimHit[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: String(limit),
    addressdetails: '1',
    countrycodes: 'za',
    viewbox: '18.20,-33.70,19.10,-34.40',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: NOMINATIM_HEADERS,
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error('Geocoding service unavailable. Try again shortly.');
  }

  return (await response.json()) as NominatimHit[];
}

async function nominatimSuggest(query: string): Promise<AddressSuggestion[]> {
  const hits = await nominatimSearch(query, 5);
  return hits.map((hit) => {
    const labels = splitDisplayName(hit.display_name);
    return {
      id: `osm:${hit.place_id ?? `${hit.lat},${hit.lon}`}`,
      primary: hit.name || labels.primary,
      secondary: labels.secondary || hit.display_name,
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      address: hit.display_name,
    };
  });
}
