import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import {
  parsePriceLabsCSV,
  calculateBookingPricing,
  calculateBookingPricingFromMap,
  resolvePriceForDate,
} from '@/lib/pricing';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

/**
 * GET /api/get-pricing
 * Calculate pricing for a booking. Uses DB (property_pricing + property_daily_prices)
 * first when pricing is enabled; falls back to PriceLabs CSV or default.
 *
 * Query parameters:
 * - propertyId: The property ID (uplisting_id)
 * - checkInDate: Check-in date (YYYY-MM-DD)
 * - checkOutDate: Check-out date (YYYY-MM-DD)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');

    if (!propertyId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: propertyId, checkInDate, and checkOutDate are required' },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkInDate) || !dateRegex.test(checkOutDate)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (end <= start) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const defaultPrice = 1500;
    const cleaningFee = 500;

    // Try DB-backed pricing first
    if (supabase) {
      const { data: property, error: propError } = await supabase
        .from('cached_properties')
        .select('id')
        .eq('uplisting_id', propertyId)
        .single();

      if (!propError && property) {
        const { data: pricingRow } = await supabase
          .from('property_pricing')
          .select('*')
          .eq('property_id', property.id)
          .maybeSingle();

        if (
          pricingRow &&
          pricingRow.pricing_enabled &&
          pricingRow.base_price != null
        ) {
          const basePrice = Number(pricingRow.base_price);
          const minPrice =
            pricingRow.min_price != null ? Number(pricingRow.min_price) : null;
          const maxPrice =
            pricingRow.max_price != null ? Number(pricingRow.max_price) : null;

          const { data: dailyRows } = await supabase
            .from('property_daily_prices')
            .select('date, price')
            .eq('property_id', property.id)
            .gte('date', checkInDate)
            .lte('date', checkOutDate);

          const dailyOverrideMap: Record<string, number> = {};
          for (const row of dailyRows || []) {
            dailyOverrideMap[row.date] = Number(row.price);
          }

          const priceMap = new Map<string, number>();
          let d = new Date(start);
          const endCopy = new Date(end);
          while (d < endCopy) {
            const dateStr = d.toISOString().split('T')[0];
            const override = dailyOverrideMap[dateStr];
            const price = resolvePriceForDate(
              dateStr,
              override,
              basePrice,
              minPrice,
              maxPrice
            );
            priceMap.set(dateStr, price);
            d.setDate(d.getDate() + 1);
          }

          const pricing = calculateBookingPricingFromMap(
            checkInDate,
            checkOutDate,
            priceMap,
            basePrice
          );
          if (pricing) {
            return NextResponse.json({
              propertyId,
              checkInDate,
              checkOutDate,
              ...pricing,
              usingDefaultPricing: false,
            });
          }
        }
      }
    }

    // Fallback: PriceLabs CSV
    const csvPath = join(
      process.cwd(),
      'public',
      'pricing',
      'PriceLabs_uplisting_135133_2025-10-17.csv'
    );
    try {
      const csvText = await readFile(csvPath, 'utf-8');
      const priceMap = parsePriceLabsCSV(csvText);
      const pricing = calculateBookingPricing(checkInDate, checkOutDate, priceMap);
      if (pricing) {
        return NextResponse.json({
          propertyId,
          checkInDate,
          checkOutDate,
          ...pricing,
          usingDefaultPricing: false,
        });
      }
    } catch {
      // CSV not found, use default below
    }

    // Final fallback: default pricing
    const basePrice = defaultPrice * nights;
    const serviceFee = basePrice * 0.12;
    return NextResponse.json({
      propertyId,
      checkInDate,
      checkOutDate,
      numberOfNights: nights,
      basePrice,
      averagePricePerNight: defaultPrice,
      cleaningFee,
      serviceFee,
      total: basePrice + cleaningFee + serviceFee,
      message: 'Using default pricing',
      usingDefaultPricing: true,
    });
  } catch (error) {
    console.error('Error calculating pricing:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate pricing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
