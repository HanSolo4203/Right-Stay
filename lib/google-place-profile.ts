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

  return mapPlace(data);
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
  mediaUrl.searchParams.set('maxHeightPx', '1600');
  mediaUrl.searchParams.set('maxWidthPx', '1600');
  mediaUrl.searchParams.set('skipHttpRedirect', 'true');

  const media = await googleJson<{ photoUri?: string }>(mediaUrl.toString(), {
    headers: { 'X-Goog-Api-Key': key },
  });
  if (!media.photoUri) return null;

  const imageResponse = await fetch(media.photoUri, { cache: 'no-store' });
  if (!imageResponse.ok) {
    throw new Error('Google place photo download failed.');
  }

  const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  if (!buffer.length) return null;

  const extension = contentType.includes('png')
    ? 'png'
    : contentType.includes('webp')
      ? 'webp'
      : 'jpg';

  return { buffer, contentType: contentType.startsWith('image/') ? contentType : 'image/jpeg', extension };
}
