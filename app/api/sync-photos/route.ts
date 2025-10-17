import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { fetchUplistingProperty } from '@/lib/uplisting';

/**
 * API endpoint to sync property photos from Uplisting
 * 
 * GET /api/sync-photos - Syncs all properties
 * GET /api/sync-photos?property_id=xxx - Syncs specific property
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const specificPropertyId = searchParams.get('property_id');

    console.log('Starting photo sync...');

    // Get properties from database
    let query = supabaseServer
      .from('cached_properties')
      .select('uplisting_id, data');

    if (specificPropertyId) {
      query = query.eq('uplisting_id', specificPropertyId);
    }

    const { data: properties, error: propertiesError } = await query;

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return NextResponse.json(
        { error: 'Failed to fetch properties from database' },
        { status: 500 }
      );
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json(
        { message: 'No properties found', synced: 0 },
        { status: 200 }
      );
    }

    console.log(`Found ${properties.length} properties to sync`);

    let totalPhotosSynced = 0;
    const syncResults = [];

    // Sync photos for each property
    for (const property of properties) {
      try {
        console.log(`Syncing photos for property: ${property.uplisting_id}`);

        // Fetch property details with photos from Uplisting
        const { photos } = await fetchUplistingProperty(property.uplisting_id);

        console.log(`  Found ${photos.length} photos`);

        // Delete existing photos for this property
        const { error: deleteError } = await supabaseServer
          .from('property_photos')
          .delete()
          .eq('property_id', property.uplisting_id);

        if (deleteError) {
          console.error(`  Error deleting old photos:`, deleteError);
          throw deleteError;
        }

        // Insert new photos
        if (photos.length > 0) {
          const photoRecords = photos.map((photo, index) => ({
            property_id: property.uplisting_id,
            photo_id: photo.id,
            url: photo.attributes.url,
            caption: photo.attributes.caption || null,
            position: photo.attributes.position ?? index,
            is_primary: index === 0, // First photo is primary
            width: photo.attributes.width || null,
            height: photo.attributes.height || null,
          }));

          const { error: insertError } = await supabaseServer
            .from('property_photos')
            .insert(photoRecords);

          if (insertError) {
            console.error(`  Error inserting photos:`, insertError);
            throw insertError;
          }

          console.log(`  Successfully synced ${photos.length} photos`);
        }

        totalPhotosSynced += photos.length;
        syncResults.push({
          property_id: property.uplisting_id,
          photos_count: photos.length,
          status: 'success',
        });

      } catch (error) {
        console.error(`Error syncing property ${property.uplisting_id}:`, error);
        syncResults.push({
          property_id: property.uplisting_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`Photo sync complete. Total photos synced: ${totalPhotosSynced}`);

    return NextResponse.json({
      message: 'Photo sync completed',
      properties_processed: properties.length,
      total_photos_synced: totalPhotosSynced,
      results: syncResults,
    });

  } catch (error) {
    console.error('Error in photo sync:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync photos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

