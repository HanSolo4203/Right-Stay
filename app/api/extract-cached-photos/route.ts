import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * Extract photo data from cached_properties if it exists in the included section
 * This is an alternative to fetching from Uplisting API
 */
export async function GET() {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Supabase client not initialized. Check environment variables.' },
        { status: 500 }
      );
    }

    console.log('Starting photo extraction from cached data...');

    // Get all properties
    const { data: properties, error: propertiesError } = await supabaseServer
      .from('cached_properties')
      .select('uplisting_id, data');

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return NextResponse.json(
        { error: 'Failed to fetch properties from database' },
        { status: 500 }
      );
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json(
        { message: 'No properties found', extracted: 0 },
        { status: 200 }
      );
    }

    console.log(`Found ${properties.length} properties`);

    let totalPhotosExtracted = 0;
    const extractResults = [];

    for (const property of properties) {
      try {
        console.log(`Processing property: ${property.uplisting_id}`);

        const data = property.data;
        
        // Check if included section exists with photo data
        const included = data.included || [];
        const photoRelationships = data.relationships?.photos?.data || [];
        
        if (photoRelationships.length === 0) {
          console.log(`  No photo relationships found`);
          extractResults.push({
            property_id: property.uplisting_id,
            status: 'no_photos',
            message: 'No photo relationships in data',
          });
          continue;
        }

        // Look for photos in included section
        const photoObjects = included.filter((item: any) => item.type === 'photos');
        
        if (photoObjects.length === 0) {
          console.log(`  ${photoRelationships.length} photo IDs found but no photo details in included section`);
          extractResults.push({
            property_id: property.uplisting_id,
            status: 'missing_details',
            photo_ids_count: photoRelationships.length,
            message: 'Photo IDs exist but URLs not cached. Need to fetch from Uplisting API.',
          });
          continue;
        }

        console.log(`  Found ${photoObjects.length} photos in included data`);

        // Delete existing photos for this property
        await supabaseServer
          .from('property_photos')
          .delete()
          .eq('property_id', property.uplisting_id);

        // Insert photos
        const photoRecords = photoObjects.map((photo: any, index: number) => ({
          property_id: property.uplisting_id,
          photo_id: photo.id,
          url: photo.attributes?.url || photo.attributes?.large_url || '',
          caption: photo.attributes?.caption || null,
          position: photo.attributes?.position ?? index,
          is_primary: index === 0,
          width: photo.attributes?.width || null,
          height: photo.attributes?.height || null,
        }));

        const { error: insertError } = await supabaseServer
          .from('property_photos')
          .insert(photoRecords);

        if (insertError) {
          console.error(`  Error inserting photos:`, insertError);
          throw insertError;
        }

        console.log(`  Successfully extracted ${photoRecords.length} photos`);
        totalPhotosExtracted += photoRecords.length;

        extractResults.push({
          property_id: property.uplisting_id,
          photos_count: photoRecords.length,
          status: 'success',
        });

      } catch (error) {
        console.error(`Error processing property ${property.uplisting_id}:`, error);
        extractResults.push({
          property_id: property.uplisting_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`Photo extraction complete. Total photos extracted: ${totalPhotosExtracted}`);

    return NextResponse.json({
      message: 'Photo extraction completed',
      properties_processed: properties.length,
      total_photos_extracted: totalPhotosExtracted,
      results: extractResults,
    });

  } catch (error) {
    console.error('Error in photo extraction:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extract photos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

