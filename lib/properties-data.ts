import { unstable_cache } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import {
  DEFAULT_MINIMUM_STAY_NIGHTS,
  formatDateLocal,
  getNextAvailableNightlyPrice,
} from '@/lib/pricing';

export type PropertyPricing = {
  propertyId: string;
  minPrice: number | null;
  basePrice: number | null;
  maxPrice: number | null;
  pricingEnabled: boolean;
  cleaningFee: number | null;
  serviceFeePercent: number | null;
  minimumStayNights: number;
  startingNightlyPrice?: number;
};

export type CachedPropertyRecord = {
  id: string;
  uplisting_id: string;
  data: Record<string, unknown>;
  last_synced: string;
  created_at: string;
  updated_at: string;
  photos?: Array<{
    id: string;
    property_id: string;
    photo_id: string;
    url: string;
    caption: string | null;
    position: number;
    is_primary: boolean;
    width: number | null;
    height: number | null;
  }>;
  pricing: PropertyPricing | null;
};

const LISTING_PRICE_LOOKAHEAD_DAYS = 60;
const PROPERTIES_CACHE_SECONDS = 120;
const LOCATIONS_CACHE_SECONDS = 300;

function buildPricingObject(row: Record<string, unknown> | null): PropertyPricing | null {
  if (!row) return null;

  return {
    propertyId: row.property_id as string,
    minPrice: row.min_price != null ? Number(row.min_price) : null,
    basePrice: row.base_price != null ? Number(row.base_price) : null,
    maxPrice: row.max_price != null ? Number(row.max_price) : null,
    pricingEnabled: !!row.pricing_enabled,
    cleaningFee: row.cleaning_fee != null ? Number(row.cleaning_fee) : null,
    serviceFeePercent:
      row.service_fee_percent != null ? Number(row.service_fee_percent) : null,
    minimumStayNights:
      row.minimum_stay_nights != null
        ? Number(row.minimum_stay_nights)
        : DEFAULT_MINIMUM_STAY_NIGHTS,
  };
}

async function attachStartingNightlyPrices(
  properties: CachedPropertyRecord[]
): Promise<CachedPropertyRecord[]> {
  if (!supabaseServer || properties.length === 0) return properties;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + LISTING_PRICE_LOOKAHEAD_DAYS);
    const startDate = formatDateLocal(today);
    const endDate = formatDateLocal(end);
    const cachedIds = properties.map((p) => p.id);

    const { data: dailyRows, error: dailyError } = await supabaseServer
      .from('property_daily_prices')
      .select('property_id, date, price')
      .in('property_id', cachedIds)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (dailyError) {
      console.warn('Error fetching daily prices for listings:', dailyError);
      return properties;
    }

    const firstDailyPriceByProperty = new Map<string, number>();
    for (const row of dailyRows || []) {
      if (!firstDailyPriceByProperty.has(row.property_id)) {
        firstDailyPriceByProperty.set(row.property_id, Number(row.price));
      }
    }

    return properties.map((property) => {
      const pricing = property.pricing;
      const firstDaily = firstDailyPriceByProperty.get(property.id);
      const startingNightlyPrice =
        firstDaily ??
        getNextAvailableNightlyPrice({
          dailyPrices: {},
          pricing,
          maxDaysAhead: LISTING_PRICE_LOOKAHEAD_DAYS,
        });

      return {
        ...property,
        pricing: {
          ...(pricing || {
            propertyId: property.id,
            minPrice: null,
            basePrice: null,
            maxPrice: null,
            pricingEnabled: false,
            cleaningFee: null,
            serviceFeePercent: null,
            minimumStayNights: DEFAULT_MINIMUM_STAY_NIGHTS,
          }),
          startingNightlyPrice,
        },
      };
    });
  } catch (error) {
    console.warn('attachStartingNightlyPrices failed:', error);
    return properties;
  }
}

async function fetchPropertiesUncached(): Promise<CachedPropertyRecord[]> {
  if (!supabaseServer) return [];

  const { data: properties, error: propertiesError } = await supabaseServer
    .from('cached_properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (propertiesError || !properties?.length) {
    if (propertiesError) {
      console.error('Supabase error fetching properties:', propertiesError);
    }
    return [];
  }

  const propertyIds = properties.map((p) => p.uplisting_id);
  const { data: photos, error: photosError } = await supabaseServer
    .from('property_photos')
    .select('*')
    .in('property_id', propertyIds)
    .order('position', { ascending: true });

  const photosByProperty = new Map<string, typeof photos>();
  if (!photosError && photos) {
    for (const photo of photos) {
      const list = photosByProperty.get(photo.property_id) || [];
      list.push(photo);
      photosByProperty.set(photo.property_id, list);
    }
  }

  const cachedIds = properties.map((p) => p.id);
  const pricingByPropertyId = new Map<string, Record<string, unknown>>();

  if (cachedIds.length > 0) {
    const { data: pricingRows, error: pricingError } = await supabaseServer
      .from('property_pricing')
      .select('*')
      .in('property_id', cachedIds);

    if (!pricingError && pricingRows) {
      for (const row of pricingRows) {
        pricingByPropertyId.set(row.property_id, row);
      }
    }
  }

  const withPhotos = properties.map((property) => ({
    ...property,
    photos: photosByProperty.get(property.uplisting_id) || [],
    pricing: buildPricingObject(pricingByPropertyId.get(property.id) ?? null),
  })) as CachedPropertyRecord[];

  return attachStartingNightlyPrices(withPhotos);
}

export const getCachedProperties = unstable_cache(
  fetchPropertiesUncached,
  ['cached-properties-list'],
  { revalidate: PROPERTIES_CACHE_SECONDS, tags: ['properties'] }
);

async function fetchPropertyLocationsUncached(): Promise<string[]> {
  if (!supabaseServer) return [];

  const { data: properties, error } = await supabaseServer
    .from('cached_properties')
    .select('data');

  if (error || !properties?.length) return [];

  const locationSet = new Set<string>();
  const locationPatterns = [
    /Cape Town/gi,
    /Kruger/gi,
    /Stellenbosch/gi,
    /Johannesburg/gi,
    /Durban/gi,
    /Pretoria/gi,
  ];

  for (const property of properties) {
    const data = property.data as { attributes?: { description?: string; name?: string; nickname?: string } };
    const attributes = data?.attributes || {};
    const description = attributes.description || '';
    const name = attributes.name || attributes.nickname || '';

    let foundLocation: string | null = null;
    for (const pattern of locationPatterns) {
      const match = description.match(pattern) || name.match(pattern);
      if (match) {
        foundLocation = match[0];
        break;
      }
    }

    locationSet.add(foundLocation || 'Cape Town');
  }

  return Array.from(locationSet).sort();
}

export const getCachedPropertyLocations = unstable_cache(
  fetchPropertyLocationsUncached,
  ['property-locations'],
  { revalidate: LOCATIONS_CACHE_SECONDS, tags: ['property-locations'] }
);

export async function getCachedPropertyByUplistingId(
  uplistingId: string
): Promise<CachedPropertyRecord | null> {
  const properties = await getCachedProperties();
  return properties.find((p) => p.uplisting_id === uplistingId) ?? null;
}

/** Single query for many properties — replaces N parallel /api/check-availability calls. */
export async function checkAvailabilityBatch(
  propertyIds: string[],
  startDate: string,
  endDate: string
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};
  if (!supabaseServer || propertyIds.length === 0) return result;

  for (const id of propertyIds) {
    result[id] = true;
  }

  const { data: blockedRows, error } = await supabaseServer
    .from('cached_availability')
    .select('property_id')
    .in('property_id', propertyIds)
    .eq('available', false)
    .gte('date', startDate)
    .lt('date', endDate);

  if (error) {
    console.error('Batch availability error:', error);
    return result;
  }

  const blockedIds = new Set((blockedRows || []).map((r) => r.property_id));
  for (const id of propertyIds) {
    result[id] = !blockedIds.has(id);
  }

  return result;
}
