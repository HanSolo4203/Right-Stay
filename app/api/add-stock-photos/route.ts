import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { FALLBACK_PROPERTY_PHOTOS, getPropertySearchQuery } from '@/lib/unsplash';

/**
 * Add stock photos to properties
 * GET /api/add-stock-photos - Adds stock photos to all properties
 * GET /api/add-stock-photos?property_id=xxx - Adds to specific property
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const specificPropertyId = searchParams.get('property_id');
    const photosPerProperty = parseInt(searchParams.get('count') || '5', 10);

    console.log('Starting stock photo assignment...');

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
        { message: 'No properties found', assigned: 0 },
        { status: 200 }
      );
    }

    console.log(`Found ${properties.length} properties`);

    let totalPhotosAssigned = 0;
    const assignmentResults = [];
    let photoIndex = 0;

    // Assign stock photos to each property
    for (const property of properties) {
      try {
        console.log(`Assigning stock photos to property: ${property.uplisting_id}`);

        const data = property.data;
        const propertyName = data?.attributes?.name || data?.attributes?.nickname || 'Property';

        // Delete existing photos for this property
        const { error: deleteError } = await supabaseServer
          .from('property_photos')
          .delete()
          .eq('property_id', property.uplisting_id);

        if (deleteError) {
          console.error(`  Error deleting old photos:`, deleteError);
          throw deleteError;
        }

        // Assign photos from our curated list
        const photoRecords = [];
        for (let i = 0; i < photosPerProperty; i++) {
          const photoUrl = FALLBACK_PROPERTY_PHOTOS[photoIndex % FALLBACK_PROPERTY_PHOTOS.length];
          photoIndex++;

          photoRecords.push({
            property_id: property.uplisting_id,
            photo_id: `stock_${property.uplisting_id}_${i}`,
            url: photoUrl,
            caption: i === 0 
              ? `${propertyName} - Main View` 
              : `${propertyName} - Photo ${i + 1}`,
            position: i,
            is_primary: i === 0,
            width: 1200,
            height: 800,
          });
        }

        const { error: insertError } = await supabaseServer
          .from('property_photos')
          .insert(photoRecords);

        if (insertError) {
          console.error(`  Error inserting photos:`, insertError);
          throw insertError;
        }

        console.log(`  Successfully assigned ${photoRecords.length} stock photos`);
        totalPhotosAssigned += photoRecords.length;

        assignmentResults.push({
          property_id: property.uplisting_id,
          property_name: propertyName,
          photos_count: photoRecords.length,
          status: 'success',
        });

      } catch (error) {
        console.error(`Error processing property ${property.uplisting_id}:`, error);
        assignmentResults.push({
          property_id: property.uplisting_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`Stock photo assignment complete. Total photos assigned: ${totalPhotosAssigned}`);

    return NextResponse.json({
      message: 'Stock photos assigned successfully',
      properties_processed: properties.length,
      total_photos_assigned: totalPhotosAssigned,
      note: 'Using high-quality stock photos from Unsplash. These can be replaced with real photos later.',
      results: assignmentResults,
    });

  } catch (error) {
    console.error('Error in stock photo assignment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to assign stock photos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET usage info
 */
export async function POST() {
  return NextResponse.json({
    message: 'Use GET request to assign stock photos',
    usage: {
      all_properties: 'GET /api/add-stock-photos',
      single_property: 'GET /api/add-stock-photos?property_id=126709',
      custom_count: 'GET /api/add-stock-photos?count=8',
    },
    note: 'Stock photos are from Unsplash and are free to use. They will be marked as temporary and can be replaced with real Uplisting photos later.',
  });
}

