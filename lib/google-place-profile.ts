import { DEFAULT_MAP_CENTER } from '@/lib/map-config';
import type { GuidePriceLevel } from '@/types/guide';

const [CAPE_TOWN_LAT, CAPE_TOWN_LNG] = DEFAULT_MAP_CENTER;
const SEARCH_RADIUS_METERS = 50_000;
const PLACE_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'editorialSummary',
  'generativeSummary',
  'photos',
  'websiteUri',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'priceLevel',
  'googleMapsUri',
  'primaryTypeDisplayName',
  'rating',
  'userRatingCount',
].join(',');

export const MAX_GOOGLE_PLACE_PHOTOS = 8;
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

type GoogleText = { text?: string };

export type GooglePlacePhotoRef = {
  name: string;
  key: string;
  widthPx?: number;
  heightPx?: number;
  isOwner: boolean;
};

export type GooglePlaceProfile = {
  googlePlaceId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  shortDescription: string;
  description: string;
  websiteUrl: string | null;
  phone: string | null;
  priceLevel: GuidePriceLevel | null;
  photos: GooglePlacePhotoRef[];
};

type GooglePlacePayload = {
  id?: string;
  displayName?: GoogleText;
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  editorialSummary?: GoogleText;
  generativeSummary?: { overview?: GoogleText };
  photos?: Array<{
    name?: string;
    widthPx?: number;
    heightPx?: number;
    googleMapsUri?: string;
    authorAttributions?: Array<{ displayName?: string }>;
  }>;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  priceLevel?: string;
  primaryTypeDisplayName?: GoogleText;
};

function getGoogleMapsApiKey() {
  return (
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    ''
  );
}

function normalizePlaceId(placeId: string) {
  return placeId.replace(/^places\//, '').trim();
}

function looksLikePlaceId(value: string) {
  const id = normalizePlaceId(value);
  return /^(ChIJ[\w-]{10,}|[A-Za-z0-9_-]{20,})$/.test(id) && !/^https?:/i.test(value);
}

export function isGoogleMapsShareUrl(value: string) {
  try {
    const trimmed = value.trim();
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'share.google' || host === 'maps.app.goo.gl' || host === 'g.co') return true;
    if (host === 'goo.gl' && url.pathname.startsWith('/maps')) return true;
    if (host === 'maps.google.com' || host === 'google.com' || host === 'google.co.za') {
      return (
        url.pathname.startsWith('/maps') ||
        url.pathname.startsWith('/share.google') ||
        url.searchParams.has('kgmid') ||
        url.searchParams.has('cid') ||
        url.searchParams.has('placeid') ||
        url.searchParams.has('query_place_id')
      );
    }
    return false;
  } catch {
    return false;
  }
}

async function followRedirects(startUrl: string, maxHops = 8): Promise<string> {
  let current = startUrl;
  for (let hop = 0; hop < maxHops; hop += 1) {
    const response = await fetch(current, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    const location = response.headers.get('location');
    if (!location || ![301, 302, 303, 307, 308].includes(response.status)) {
      return response.url || current;
    }
    current = new URL(location, current).toString();
  }
  return current;
}

function extractPlaceHints(urlString: string): { placeId?: string; query?: string } {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return {};
  }

  const params = parsed.searchParams;
  const fromParams =
    params.get('query_place_id') ||
    params.get('place_id') ||
    params.get('placeid') ||
    params.get('placeId') ||
    '';
  const fromPlaceIdQuery = params.get('q')?.match(/^place_id:(.+)$/)?.[1] || '';
  const fromPath = urlString.match(/\b(ChIJ[\w-]{10,})\b/)?.[1] || '';
  const placeId = fromParams || fromPlaceIdQuery || fromPath || undefined;

  const rawQuery = params.get('q') || params.get('query') || '';
  const queryFromParam =
    rawQuery && !rawQuery.startsWith('place_id:') ? rawQuery.replace(/\+/g, ' ').trim() : '';
  const placePath = parsed.pathname.match(/\/maps\/place\/([^/]+)/);
  const queryFromPath = placePath
    ? decodeURIComponent(placePath[1].replace(/\+/g, ' ')).trim()
    : '';

  return {
    placeId,
    query: queryFromParam || queryFromPath || undefined,
  };
}

export async function resolveGooglePlaceFromMapsUrl(
  mapsUrl: string
): Promise<GooglePlaceProfile | null> {
  const trimmed = mapsUrl.trim();
  if (!trimmed) return null;

  if (looksLikePlaceId(trimmed)) {
    return fetchGooglePlaceProfile(trimmed);
  }

  if (!/^https?:\/\//i.test(trimmed) && !isGoogleMapsShareUrl(`https://${trimmed}`)) {
    return null;
  }

  const startUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (!isGoogleMapsShareUrl(startUrl) && !looksLikePlaceId(startUrl)) {
    const direct = extractPlaceHints(startUrl);
    if (direct.placeId) return fetchGooglePlaceProfile(direct.placeId);
    return null;
  }

  let resolved = startUrl;
  try {
    resolved = await followRedirects(startUrl);
  } catch (error) {
    console.warn('Failed to follow Google Maps share URL:', error);
  }

  const hints = {
    ...extractPlaceHints(startUrl),
    ...extractPlaceHints(resolved),
  };

  if (hints.placeId) {
    const profile = await fetchGooglePlaceProfile(hints.placeId);
    if (profile) return ensurePlacePhotos(profile);
  }

  if (hints.query) {
    const profile = await searchGooglePlaceProfile(hints.query);
    if (profile) return ensurePlacePhotos(profile);
  }

  return null;
}

async function ensurePlacePhotos(profile: GooglePlaceProfile): Promise<GooglePlaceProfile> {
  if (profile.photos.length > 0) return profile;
  const fallbackQuery = [profile.name, profile.address].filter(Boolean).join(' ');
  if (!fallbackQuery) return profile;
  try {
    const searched = await searchGooglePlaceProfile(fallbackQuery);
    if (searched?.photos.length) {
      return { ...profile, photos: searched.photos };
    }
  } catch (error) {
    console.warn('Google photo fallback search failed:', error);
  }
  return profile;
}

function clip(value: string, max: number) {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  const sliced = trimmed.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${(lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
}

function cleanWebsite(url: string) {
  try {
    const parsed = new URL(url);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((param) => {
      parsed.searchParams.delete(param);
    });
    const query = parsed.searchParams.toString();
    return `${parsed.origin}${parsed.pathname}${query ? `?${query}` : ''}${parsed.hash}`;
  } catch {
    return url;
  }
}

function mapGooglePriceLevel(level?: string): GuidePriceLevel | null {
  switch (level) {
    case 'PRICE_LEVEL_FREE':
      return 'free';
    case 'PRICE_LEVEL_INEXPENSIVE':
      return '$';
    case 'PRICE_LEVEL_MODERATE':
      return '$$';
    case 'PRICE_LEVEL_EXPENSIVE':
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return '$$$';
    default:
      return null;
  }
}

function photoKey(photo: NonNullable<GooglePlacePayload['photos']>[number], index: number) {
  const mapsId = photo.googleMapsUri?.match(/1s([^!/]+)/)?.[1];
  if (mapsId) return mapsId;
  if (photo.name) {
    const parts = photo.name.split('/');
    return parts[parts.length - 1]?.slice(0, 80) || `photo-${index}`;
  }
  return `photo-${index}`;
}

function mapPlace(data: GooglePlacePayload): GooglePlaceProfile | null {
  const googlePlaceId = data.id ? normalizePlaceId(data.id) : '';
  const lat = data.location?.latitude;
  const lng = data.location?.longitude;
  if (!googlePlaceId || typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  const name = data.displayName?.text?.trim() || '';
  const editorial =
    data.editorialSummary?.text?.trim() ||
    data.generativeSummary?.overview?.text?.trim() ||
    '';
  const fallback = data.primaryTypeDisplayName?.text?.trim() || '';
  const description = editorial || fallback;
  const photos = rankPhotos(data.photos || [], name);

  return {
    googlePlaceId,
    name,
    address: data.formattedAddress?.trim() || '',
    lat,
    lng,
    shortDescription: description ? clip(description, 160) : '',
    description,
    websiteUrl: data.websiteUri ? cleanWebsite(data.websiteUri) : null,
    phone: data.internationalPhoneNumber?.trim() || data.nationalPhoneNumber?.trim() || null,
    priceLevel: mapGooglePriceLevel(data.priceLevel),
    photos,
  };
}

function rankPhotos(
  photos: NonNullable<GooglePlacePayload['photos']>,
  placeName: string
): GooglePlacePhotoRef[] {
  const ownerNeedle = placeName.split(/[-(]/)[0]?.trim().toLowerCase() || '';
  const mapped: GooglePlacePhotoRef[] = [];

  photos.forEach((photo, index) => {
    if (!photo.name) return;
    const isOwner = Boolean(
      ownerNeedle &&
        photo.authorAttributions?.some((author) =>
          author.displayName?.toLowerCase().includes(ownerNeedle)
        )
    );
    mapped.push({
      name: photo.name,
      key: photoKey(photo, index),
      widthPx: photo.widthPx,
      heightPx: photo.heightPx,
      isOwner,
    });
  });

  mapped.sort((a, b) => Number(b.isOwner) - Number(a.isOwner));
  return mapped.slice(0, MAX_GOOGLE_PLACE_PHOTOS);
}

async function googleJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  const data = (await response.json()) as T & {
    error?: { message?: string };
    error_message?: string;
  };
  if (!response.ok) {
    throw new Error(data.error?.message || data.error_message || 'Google Places request failed.');
  }
  return data;
}

export async function fetchGooglePlaceProfile(placeId: string): Promise<GooglePlaceProfile | null> {
  const key = getGoogleMapsApiKey();
  if (!key) return null;
  const id = normalizePlaceId(placeId);
  if (!id) return null;

  const data = await googleJson<GooglePlacePayload>(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
    {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': PLACE_FIELD_MASK,
      },
    }
  );

  const mapped = mapPlace(data);
  return mapped ? ensurePlacePhotos(mapped) : null;
}

export async function searchGooglePlaceProfile(query: string): Promise<GooglePlaceProfile | null> {
  const key = getGoogleMapsApiKey();
  if (!key) return null;
  const textQuery = query.trim();
  if (!textQuery) return null;

  const data = await googleJson<{ places?: GooglePlacePayload[] }>(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': PLACE_FIELD_MASK.split(',').map((field) => `places.${field}`).join(','),
      },
      body: JSON.stringify({
        textQuery,
        languageCode: 'en',
        regionCode: 'ZA',
        maxResultCount: 1,
        locationBias: {
          circle: {
            center: { latitude: CAPE_TOWN_LAT, longitude: CAPE_TOWN_LNG },
            radius: SEARCH_RADIUS_METERS,
          },
        },
      }),
    }
  );

  const hit = data.places?.[0];
  return hit ? mapPlace(hit) : null;
}

export async function downloadGooglePlacePhoto(
  photoName: string
): Promise<{ buffer: Buffer; contentType: string; extension: string } | null> {
  const key = getGoogleMapsApiKey();
  if (!key || !photoName.startsWith('places/')) return null;

  const encodedName = photoName
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  const mediaUrl = new URL(`https://places.googleapis.com/v1/${encodedName}/media`);
  mediaUrl.searchParams.set('maxHeightPx', '1200');
  mediaUrl.searchParams.set('maxWidthPx', '1200');
  mediaUrl.searchParams.set('skipHttpRedirect', 'true');

  const mediaResponse = await fetch(mediaUrl.toString(), {
    cache: 'no-store',
    headers: { 'X-Goog-Api-Key': key },
  });

  const contentType = mediaResponse.headers.get('content-type') || '';
  let imageResponse = mediaResponse;

  if (contentType.includes('application/json')) {
    const media = (await mediaResponse.json()) as {
      photoUri?: string;
      error?: { message?: string };
    };
    if (!mediaResponse.ok) {
      throw new Error(media.error?.message || 'Google place photo request failed.');
    }
    if (!media.photoUri) return null;
    imageResponse = await fetch(media.photoUri, { cache: 'no-store' });
  }

  if (!imageResponse.ok) {
    throw new Error('Google place photo download failed.');
  }

  const imageType = imageResponse.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  if (!buffer.length) return null;

  const extension = imageType.includes('png')
    ? 'png'
    : imageType.includes('webp')
      ? 'webp'
      : 'jpg';

  return {
    buffer,
    contentType: imageType.startsWith('image/') ? imageType : 'image/jpeg',
    extension,
  };
}
