import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import {
  DEFAULT_MINIMUM_STAY_NIGHTS,
  formatDateLocal,
  getNextAvailableNightlyPrice,
} from '@/lib/pricing';

export const dynamic = 'force-dynamic';

type PricingConfig = {
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

function buildPricingObject(row: any): PricingConfig | null {
  if (!row) return null;

  return {
    propertyId: row.property_id as string,
    minPrice: row.min_price !== null && row.min_price !== undefined ? Number(row.min_price) : null,
    basePrice:
      row.base_price !== null && row.base_price !== undefined ? Number(row.base_price) : null,
    maxPrice: row.max_price !== null && row.max_price !== undefined ? Number(row.max_price) : null,
    pricingEnabled: !!row.pricing_enabled,
    cleaningFee:
      row.cleaning_fee !== null && row.cleaning_fee !== undefined ? Number(row.cleaning_fee) : null,
    serviceFeePercent:
      row.service_fee_percent !== null && row.service_fee_percent !== undefined
        ? Number(row.service_fee_percent)
        : null,
    minimumStayNights:
      row.minimum_stay_nights != null
        ? Number(row.minimum_stay_nights)
        : DEFAULT_MINIMUM_STAY_NIGHTS,
  };
}

/** Shorter window for listing cards — avoids multi‑second bulk queries. */
const LISTING_PRICE_LOOKAHEAD_DAYS = 60;

async function attachStartingNightlyPrices<
  T extends { id: string; uplisting_id: string; pricing: PricingConfig | null },
>(properties: T[]): Promise<T[]> {
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
          }),
          startingNightlyPrice,
        },
      };
    });
  } catch (error) {
    console.warn('attachStartingNightlyPrices failed, returning properties without starting price:', error);
    return properties;
  }
}

export async function GET(request: Request) {
  try {
    // Check if Supabase is configured
    if (!supabaseServer) {
      console.warn('Supabase environment variables not configured');
      console.warn('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
      console.warn('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
      return NextResponse.json({ 
        error: 'Database not configured', 
        properties: [] 
      }, { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('id');

    // If requesting a single property
    if (propertyId) {
      console.log('API: Fetching single property:', propertyId);
      
      const { data: property, error: propertyError } = await supabaseServer
        .from('cached_properties')
        .select('*')
        .eq('uplisting_id', propertyId)
        .single();

      if (propertyError) {
        console.error('Supabase error fetching property:', propertyError);
        console.error('Error details:', JSON.stringify(propertyError, null, 2));
        return NextResponse.json({ 
          error: propertyError.message,
          details: propertyError 
        }, { status: 500 });
      }

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }

      // Fetch photos for this property
      const { data: photos, error: photosError } = await supabaseServer
        .from('property_photos')
        .select('*')
        .eq('property_id', propertyId)
        .order('position', { ascending: true });

      if (photosError) {
        console.warn('Error fetching photos:', photosError);
      }

      // Fetch pricing for this property (if any)
      const { data: pricingRow, error: pricingError } = await supabaseServer
        .from('property_pricing')
        .select('*')
        .eq('property_id', property.id)
        .maybeSingle();

      if (pricingError) {
        console.warn('Error fetching pricing:', pricingError);
      }

      const [propertyWithStartingPrice] = await attachStartingNightlyPrices([
        {
          ...property,
          photos: photos || [],
          pricing: buildPricingObject(pricingRow),
        },
      ]);

      return NextResponse.json({ property: propertyWithStartingPrice });
    }

    // Otherwise fetch all properties
    console.log('API: Fetching properties from Supabase...');
    
    const { data: properties, error: propertiesError } = await supabaseServer
      .from('cached_properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Supabase error fetching properties:', propertiesError);
      const isNetworkError =
        propertiesError.message?.includes('fetch failed') ||
        propertiesError.details?.includes('fetch failed');

      return NextResponse.json(
        {
          error: isNetworkError
            ? 'Unable to reach the database. Please try again.'
            : propertiesError.message || 'Failed to fetch properties',
          properties: [],
        },
        { status: isNetworkError ? 503 : 500 }
      );
    }

    console.log('API: Found', properties?.length || 0, 'properties');

    if (!properties || properties.length === 0) {
      return NextResponse.json({ properties: [] });
    }

    // Fetch photos for all properties
    const propertyIds = properties.map(p => p.uplisting_id);
    const { data: photos, error: photosError } = await supabaseServer
      .from('property_photos')
      .select('*')
      .in('property_id', propertyIds)
      .order('position', { ascending: true });

    if (photosError) {
      console.warn('Error fetching photos:', photosError);
      // Continue without photos if there's an error - return properties without photos
      return NextResponse.json({ 
        properties: properties.map(p => ({ ...p, photos: [], pricing: null }))
      });
    }

    // Group photos by property_id
    const photosByProperty = new Map<string, any[]>();
    if (photos) {
      for (const photo of photos) {
        if (!photosByProperty.has(photo.property_id)) {
          photosByProperty.set(photo.property_id, []);
        }
        photosByProperty.get(photo.property_id)!.push(photo);
      }
    }

    // Fetch pricing for all properties
    const cachedIds = properties.map(p => p.id);
    let pricingByPropertyId = new Map<string, any>();

    if (cachedIds.length > 0) {
      const { data: pricingRows, error: pricingError } = await supabaseServer
        .from('property_pricing')
        .select('*')
        .in('property_id', cachedIds);

      if (pricingError) {
        console.warn('Error fetching pricing for properties:', pricingError);
      } else if (pricingRows) {
        for (const row of pricingRows) {
          pricingByPropertyId.set(row.property_id, row);
        }
      }
    }

    const propertiesWithPhotosAndPricing = properties.map((property) => ({
      ...property,
      photos: photosByProperty.get(property.uplisting_id) || [],
      pricing: buildPricingObject(pricingByPropertyId.get(property.id)),
    }));

    const propertiesWithExtras = await attachStartingNightlyPrices(propertiesWithPhotosAndPricing);

    console.log('API: Attached photos and pricing to properties');
    return NextResponse.json({ properties: propertiesWithExtras });
  } catch (error) {
    console.error('Unexpected error fetching properties:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error stack:', errorStack);
    return NextResponse.json({ 
      error: 'Failed to fetch properties',
      message: errorMessage
    }, { status: 500 });
  }
}

