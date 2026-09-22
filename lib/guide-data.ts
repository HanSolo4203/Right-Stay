import { cache } from 'react';
import { supabaseServer } from '@/lib/supabase-server';
import {
  extractLocationFromAttributes,
  hasValidMapCoordinates,
  resolvePropertyListingLocation,
} from '@/lib/property-location';
import type {
  GuideCategory,
  GuideItemPhoto,
  GuidePlace,
  GuidePropertyPin,
} from '@/types/guide';

const ITEM_SELECT =
  '*, category:guide_categories(id, name, slug, icon, color, is_active), photos:guide_item_photos(*)';

type GuideItemRow = Record<string, unknown> & {
  photos?: Array<Record<string, unknown>>;
  category?: Record<string, unknown> | null;
};

function mapPhotos(row: GuideItemRow): GuideItemPhoto[] {
  if (!Array.isArray(row.photos)) return [];
  return [...row.photos]
    .map((photo) => ({
      id: String(photo.id ?? ''),
      guide_item_id: String(photo.guide_item_id ?? ''),
      storage_path: String(photo.storage_path ?? ''),
      url: String(photo.url ?? ''),
      is_primary: Boolean(photo.is_primary),
      sort_order: Number(photo.sort_order ?? 0),
      created_at: String(photo.created_at ?? ''),
      updated_at: String(photo.updated_at ?? ''),
    }))
    .filter((photo) => photo.id && photo.url)
    .sort((a, b) => a.sort_order - b.sort_order);
}

function mapPlace(row: GuideItemRow): GuidePlace | null {
  const category = row.category;
  if (!category || category.is_active === false) return null;

  const latitude = Number(row.latitude);
  const longitude = Number(row.longitude);
  if (!hasValidMapCoordinates(latitude, longitude)) return null;

  const photos = mapPhotos(row);
  const primary = photos.find((photo) => photo.is_primary) || photos[0] || null;

  return {
    id: String(row.id),
    category_id: String(row.category_id),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    short_description: String(row.short_description ?? ''),
    description: String(row.description ?? ''),
    address: typeof row.address === 'string' && row.address.trim() ? row.address.trim() : null,
    latitude,
    longitude,
    price_level:
      row.price_level === 'free' ||
      row.price_level === '$' ||
      row.price_level === '$$' ||
      row.price_level === '$$$'
        ? row.price_level
        : null,
    website_url:
      typeof row.website_url === 'string' && row.website_url.trim()
        ? row.website_url.trim()
        : null,
    booking_url:
      typeof row.booking_url === 'string' && row.booking_url.trim()
        ? row.booking_url.trim()
        : null,
    phone: typeof row.phone === 'string' && row.phone.trim() ? row.phone.trim() : null,
    tags: Array.isArray(row.tags)
      ? row.tags.filter((tag): tag is string => typeof tag === 'string' && Boolean(tag.trim()))
      : [],
    is_featured: Boolean(row.is_featured),
    is_active: Boolean(row.is_active),
    sort_order: Number(row.sort_order ?? 0),
    google_place_id:
      typeof row.google_place_id === 'string' && row.google_place_id.trim()
        ? row.google_place_id.trim()
        : null,
    google_synced_at:
      typeof row.google_synced_at === 'string' && row.google_synced_at.trim()
        ? row.google_synced_at.trim()
        : null,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
    category: {
      id: String(category.id),
      name: String(category.name ?? ''),
      slug: String(category.slug ?? ''),
      icon: String(category.icon ?? 'Compass'),
      color: String(category.color ?? '#2f8f5b'),
    },
    photos,
    primary_photo_url: primary?.url ?? null,
  };
}

function mapCategory(row: Record<string, unknown>): GuideCategory {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    icon: String(row.icon ?? 'Compass'),
    color: String(row.color ?? '#2f8f5b'),
    sort_order: Number(row.sort_order ?? 0),
    is_active: Boolean(row.is_active),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export type PublicGuidePageData = {
  categories: GuideCategory[];
  places: GuidePlace[];
  properties: GuidePropertyPin[];
  loadError: string | null;
};

async function fetchPublicGuidePageData(): Promise<PublicGuidePageData> {
  const empty: PublicGuidePageData = {
    categories: [],
    places: [],
    properties: [],
    loadError: null,
  };
  if (!supabaseServer) return empty;

  try {
    const [categoriesResult, itemsResult, propertiesResult] = await Promise.all([
    supabaseServer
      .from('guide_categories')
      .select('id, name, slug, icon, color, sort_order, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabaseServer
      .from('guide_items')
      .select(ITEM_SELECT)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabaseServer
      .from('cached_properties')
      .select('id, uplisting_id, data')
      .eq('is_published', true),
  ]);

  if (categoriesResult.error) {
    console.error('Error fetching guide categories:', categoriesResult.error);
  }
  if (itemsResult.error) {
    console.error('Error fetching guide items:', itemsResult.error);
  }
  if (propertiesResult.error) {
    console.error('Error fetching published properties for guide map:', propertiesResult.error);
  }

  const categoriesFailed = Boolean(categoriesResult.error);
  const itemsFailed = Boolean(itemsResult.error);
  const loadError =
    categoriesFailed && itemsFailed
      ? 'We couldn’t load the Cape Town guide. Please try again.'
      : itemsFailed
        ? 'Places couldn’t be loaded. Please try again.'
        : categoriesFailed
          ? 'Categories couldn’t be loaded. Places may still be listed below.'
          : null;

  const categories = (categoriesResult.data || []).map(mapCategory);
  const activeCategoryIds = new Set(categories.map((category) => category.id));
  const places = (itemsResult.data || [])
    .map((row) => mapPlace(row as GuideItemRow))
    .filter((place): place is GuidePlace => Boolean(place && activeCategoryIds.has(place.category_id)));

  const properties: GuidePropertyPin[] = [];
  for (const property of propertiesResult.data || []) {
    const data = (property.data ?? {}) as { attributes?: Record<string, unknown> };
    const attributes = data.attributes ?? {};
    const location = extractLocationFromAttributes(attributes);
    if (!hasValidMapCoordinates(location.latitude, location.longitude)) continue;

    const name =
      (typeof attributes.name === 'string' && attributes.name.trim()) ||
      (typeof attributes.nickname === 'string' && attributes.nickname.trim()) ||
      resolvePropertyListingLocation(attributes);
    const slug =
      typeof attributes.property_slug === 'string' && attributes.property_slug.trim()
        ? attributes.property_slug.trim()
        : null;

    properties.push({
      id: String(property.uplisting_id || property.id),
      name,
      slug,
      latitude: location.latitude as number,
      longitude: location.longitude as number,
      label: resolvePropertyListingLocation(attributes),
    });
  }

  return { categories, places, properties, loadError };
  } catch (error) {
    console.error('Error loading public guide page data:', error);
    return {
      ...empty,
      loadError: 'We couldn’t load the Cape Town guide. Please try again.',
    };
  }
}

export const getPublicGuidePageData = cache(fetchPublicGuidePageData);

/** Match `?property=` against a published stay's Uplisting id or slug. */
export function findPublishedGuideProperty(
  properties: GuidePropertyPin[],
  query: string | string[] | undefined
): GuidePropertyPin | null {
  const raw = Array.isArray(query) ? query[0] : query;
  const value = raw?.trim();
  if (!value) return null;
  const needle = value.toLowerCase();
  return (
    properties.find(
      (property) =>
        property.id.toLowerCase() === needle ||
        (property.slug != null && property.slug.toLowerCase() === needle)
    ) ?? null
  );
}
