import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/admin/pricing/calendar
 * Query params: propertyId (uplisting_id), year, optionally month
 * Returns: pricing config + daily prices for the date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!propertyId || !year) {
      return NextResponse.json(
        { error: 'propertyId and year are required' },
        { status: 400 }
      );
    }

    const yearNum = parseInt(year, 10);
    const monthNum = month ? parseInt(month, 10) : null;

    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    // Resolve uplisting_id -> cached_properties.id
    const { data: property, error: propError } = await supabase
      .from('cached_properties')
      .select('id')
      .eq('uplisting_id', propertyId)
      .single();

    if (propError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const cachedPropertyId = property.id;

    // Fetch property_pricing (min, base, max)
    const { data: pricingRow, error: pricingError } = await supabase
      .from('property_pricing')
      .select('*')
      .eq('property_id', cachedPropertyId)
      .maybeSingle();

    if (pricingError) {
      console.error('Error fetching property_pricing:', pricingError);
      return NextResponse.json(
        { error: 'Failed to fetch pricing config' },
        { status: 500 }
      );
    }

    const pricing = pricingRow
      ? {
          minPrice:
            pricingRow.min_price != null ? Number(pricingRow.min_price) : null,
          basePrice:
            pricingRow.base_price != null ? Number(pricingRow.base_price) : null,
          maxPrice:
            pricingRow.max_price != null ? Number(pricingRow.max_price) : null,
          pricingEnabled: !!pricingRow.pricing_enabled,
          updatedAt: pricingRow.updated_at as string,
        }
      : {
          minPrice: null,
          basePrice: null,
          maxPrice: null,
          pricingEnabled: false,
          updatedAt: null as string | null,
        };

    // Compute date range for daily prices
    const startDate = monthNum
      ? new Date(yearNum, monthNum - 1, 1)
      : new Date(yearNum, 0, 1);
    const endDate = monthNum
      ? new Date(yearNum, monthNum, 0)
      : new Date(yearNum, 11, 31);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Fetch property_daily_prices for date range
    const { data: dailyRows, error: dailyError } = await supabase
      .from('property_daily_prices')
      .select('date, price')
      .eq('property_id', cachedPropertyId)
      .gte('date', startStr)
      .lte('date', endStr);

    if (dailyError) {
      console.error('Error fetching property_daily_prices:', dailyError);
      return NextResponse.json(
        { error: 'Failed to fetch daily prices' },
        { status: 500 }
      );
    }

    const dailyPrices: Record<string, number> = {};
    for (const row of dailyRows || []) {
      dailyPrices[row.date] = Number(row.price);
    }

    return NextResponse.json({
      pricing,
      dailyPrices,
    });
  } catch (error) {
    console.error('Error in pricing calendar API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch calendar data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
