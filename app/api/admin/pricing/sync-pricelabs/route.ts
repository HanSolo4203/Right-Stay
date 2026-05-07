import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchListingPrices, type PriceLabsListingRequest } from '@/lib/pricelabs';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type MappingRow = {
  property_id: string;
  pricelabs_listing_id: string;
  pricelabs_pms: string;
  sync_enabled: boolean;
};

function makeExternalKey(id: string, pms: string): `${string}::${string}` {
  return `${id}::${pms}`;
}

function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const propertyId = body.propertyId as string | undefined;
    const horizonDays = Math.max(1, Math.min(Number(body.horizonDays) || 180, 365));
    const dateFrom = isoDate(0);
    const dateTo = isoDate(horizonDays);

    let mappingsQuery = supabase
      .from('property_pricelabs_mapping')
      .select('property_id, pricelabs_listing_id, pricelabs_pms, sync_enabled')
      .eq('sync_enabled', true);

    if (propertyId) {
      const { data: property } = await supabase
        .from('cached_properties')
        .select('id')
        .eq('uplisting_id', propertyId)
        .maybeSingle();
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }
      mappingsQuery = mappingsQuery.eq('property_id', property.id);
    }

    const { data: mappings, error: mappingsError } = await mappingsQuery;
    if (mappingsError) throw mappingsError;

    if (!mappings || mappings.length === 0) {
      return NextResponse.json({
        success: true,
        syncedProperties: 0,
        syncedDays: 0,
        message: 'No enabled PriceLabs mappings found',
      });
    }

    const requests: PriceLabsListingRequest[] = mappings.map((m: MappingRow) => ({
      id: m.pricelabs_listing_id,
      pms: m.pricelabs_pms,
      dateFrom,
      dateTo,
      reason: false,
    }));

    const listingResults = await fetchListingPrices(requests);
    const byExternalKey = new Map(
      listingResults.map((item) => [makeExternalKey(item.id, item.pms), item] as const)
    );

    let syncedProperties = 0;
    let syncedDays = 0;
    const errors: Array<{ propertyId: string; error: string }> = [];

    for (const mapping of mappings as MappingRow[]) {
      const externalKey = makeExternalKey(mapping.pricelabs_listing_id, mapping.pricelabs_pms);
      const listingData = byExternalKey.get(externalKey);

      if (!listingData || listingData.data.length === 0) {
        await supabase
          .from('property_pricelabs_mapping')
          .update({
            last_sync_status: 'no_data',
            last_sync_error: 'No pricing data returned by PriceLabs',
            last_synced_at: new Date().toISOString(),
          })
          .eq('property_id', mapping.property_id);
        errors.push({
          propertyId: mapping.property_id,
          error: `No pricing data for listing ${mapping.pricelabs_listing_id}/${mapping.pricelabs_pms}`,
        });
        continue;
      }

      try {
        const importRows = listingData.data
          .filter((row) => row.unbookable !== 1)
          .map((row) => ({
            property_id: mapping.property_id,
            date: row.date,
            price: row.price,
            is_custom: false,
          }));

        const dates = importRows.map((r) => r.date);
        if (dates.length > 0) {
          const minDate = dates.reduce((a, b) => (a < b ? a : b));
          const maxDate = dates.reduce((a, b) => (a > b ? a : b));

          await supabase
            .from('property_daily_prices')
            .delete()
            .eq('property_id', mapping.property_id)
            .eq('is_custom', false)
            .gte('date', minDate)
            .lte('date', maxDate);

          const { error: upsertError } = await supabase
            .from('property_daily_prices')
            .upsert(importRows, { onConflict: 'property_id,date' });
          if (upsertError) throw upsertError;

          const prices = importRows.map((r) => Number(r.price));
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          const basePrice = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);

          const { error: pricingUpsertError } = await supabase
            .from('property_pricing')
            .upsert(
              {
                property_id: mapping.property_id,
                min_price: minPrice,
                base_price: basePrice,
                max_price: maxPrice,
                pricing_enabled: true,
              },
              { onConflict: 'property_id' }
            );
          if (pricingUpsertError) throw pricingUpsertError;
        }

        await supabase
          .from('property_pricelabs_mapping')
          .update({
            last_sync_status: 'success',
            last_sync_error: null,
            last_synced_at: new Date().toISOString(),
          })
          .eq('property_id', mapping.property_id);

        syncedProperties += 1;
        syncedDays += listingData.data.length;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown sync error';
        await supabase
          .from('property_pricelabs_mapping')
          .update({
            last_sync_status: 'error',
            last_sync_error: message,
            last_synced_at: new Date().toISOString(),
          })
          .eq('property_id', mapping.property_id);
        errors.push({ propertyId: mapping.property_id, error: message });
      }
    }

    return NextResponse.json({
      success: true,
      syncedProperties,
      syncedDays,
      requestedMappings: mappings.length,
      dateFrom,
      dateTo,
      errors,
    });
  } catch (error) {
    console.error('Error syncing PriceLabs pricing:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync PriceLabs pricing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
