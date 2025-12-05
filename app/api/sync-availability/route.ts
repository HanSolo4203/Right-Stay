import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { parseIcalFeed } from '@/lib/ical-parser';

/**
 * POST /api/sync-availability
 * Sync availability for a specific property from its iCal feed
 */
export async function POST(request: Request) {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Supabase client not initialized. Check environment variables.' },
        { status: 500 }
      );
    }

    const { propertyId } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    console.log(`Syncing availability for property: ${propertyId}`);

    // Fetch property with iCal URL
    const { data: property, error: propertyError } = await supabaseServer
      .from('cached_properties')
      .select('uplisting_id, ical_url, data')
      .eq('uplisting_id', propertyId)
      .single();

    if (propertyError || !property) {
      console.error('Property fetch error:', propertyError);
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (!property.ical_url) {
      return NextResponse.json({ 
        error: 'No iCal URL configured for this property',
        propertyId 
      }, { status: 400 });
    }

    // Parse iCal feed
    console.log(`Parsing iCal feed: ${property.ical_url}`);
    const blockedDates = await parseIcalFeed(property.ical_url);

    // Clear existing availability for this property
    const { error: deleteError } = await supabaseServer
      .from('cached_availability')
      .delete()
      .eq('property_id', propertyId);

    if (deleteError) {
      console.error('Error deleting old availability:', deleteError);
    }

    // Insert new availability data
    if (blockedDates.length > 0) {
      const availabilityRecords = blockedDates.map(blocked => ({
        property_id: propertyId,
        date: blocked.date,
        available: false,
        blocked_reason: blocked.reason,
        last_synced: new Date().toISOString(),
      }));

      // Batch insert (Supabase handles up to 1000 records per insert)
      const { error: insertError } = await supabaseServer
        .from('cached_availability')
        .insert(availabilityRecords);

      if (insertError) {
        console.error('Error inserting availability:', insertError);
        return NextResponse.json({ 
          error: 'Failed to update availability',
          details: insertError.message 
        }, { status: 500 });
      }

      console.log(`Successfully synced ${blockedDates.length} blocked dates`);
    } else {
      console.log('No blocked dates found in iCal feed');
    }

    return NextResponse.json({
      success: true,
      propertyId,
      blockedDates: blockedDates.length,
      message: `Synced ${blockedDates.length} blocked dates for property ${propertyId}`,
      lastSynced: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing availability:', error);
    return NextResponse.json({ 
      error: 'Failed to sync availability',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/sync-availability
 * Sync availability for all properties with iCal URLs
 */
export async function GET() {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Supabase client not initialized. Check environment variables.' },
        { status: 500 }
      );
    }

    console.log('Starting sync for all properties with iCal URLs...');

    const { data: properties, error } = await supabaseServer
      .from('cached_properties')
      .select('uplisting_id, ical_url, data')
      .not('ical_url', 'is', null);

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json({ 
        message: 'No properties with iCal URLs found',
        results: [] 
      });
    }

    console.log(`Found ${properties.length} properties with iCal URLs`);

    const results = [];
    for (const property of properties) {
      try {
        console.log(`Processing property: ${property.uplisting_id}`);
        const blockedDates = await parseIcalFeed(property.ical_url);
        
        // Clear existing data
        await supabaseServer
          .from('cached_availability')
          .delete()
          .eq('property_id', property.uplisting_id);

        // Insert new data
        if (blockedDates.length > 0) {
          const availabilityRecords = blockedDates.map(blocked => ({
            property_id: property.uplisting_id,
            date: blocked.date,
            available: false,
            blocked_reason: blocked.reason,
            last_synced: new Date().toISOString(),
          }));

          await supabaseServer
            .from('cached_availability')
            .insert(availabilityRecords);
        }

        results.push({
          propertyId: property.uplisting_id,
          blockedDates: blockedDates.length,
          success: true,
          lastSynced: new Date().toISOString()
        });

        console.log(`✓ Synced ${blockedDates.length} dates for ${property.uplisting_id}`);
      } catch (err) {
        console.error(`✗ Failed to sync ${property.uplisting_id}:`, err);
        results.push({
          propertyId: property.uplisting_id,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Sync complete: ${successCount}/${results.length} successful`);

    return NextResponse.json({ 
      message: `Synced ${successCount} of ${results.length} properties`,
      results 
    });
  } catch (error) {
    console.error('Error syncing all properties:', error);
    return NextResponse.json({ 
      error: 'Failed to sync properties',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

