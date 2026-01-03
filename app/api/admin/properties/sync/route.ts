import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { fetchUplistingProperties, fetchUplistingProperty } from '@/lib/uplisting';

/**
 * API endpoint to sync all properties and photos from Uplisting API
 * 
 * POST /api/admin/properties/sync - Syncs all properties from Uplisting
 */
export async function POST() {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Supabase client not initialized. Check environment variables.' },
        { status: 500 }
      );
    }

    console.log('Starting property sync from Uplisting API...');

    // Check if UPLISTING_API_KEY is configured
    const apiKey = process.env.UPLISTING_API_KEY;
    if (!apiKey || apiKey === 'your_uplisting_api_key_here' || apiKey.trim() === '') {
      return NextResponse.json(
        { 
          error: 'UPLISTING_API_KEY is not configured',
          details: 'Please add your Uplisting API key to .env.local file. Get it from Settings > Connect > API Key in your Uplisting account.'
        },
        { status: 400 }
      );
    }

    // Fetch all properties from Uplisting API
    let uplistingProperties;
    try {
      uplistingProperties = await fetchUplistingProperties();
      console.log(`Fetched ${uplistingProperties.length} properties from Uplisting API`);
    } catch (error) {
      console.error('Error fetching properties from Uplisting API:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide helpful error messages
      let userFriendlyError = 'Failed to fetch properties from Uplisting API';
      if (errorMessage.includes('UPLISTING_API_KEY')) {
        userFriendlyError = errorMessage;
      } else if (errorMessage.includes('Invalid') || errorMessage.includes('API key') || errorMessage.includes('API access')) {
        // Use the detailed error message from the library which includes troubleshooting steps
        userFriendlyError = errorMessage;
      } else if (errorMessage.includes('Network error')) {
        userFriendlyError = 'Network error connecting to Uplisting API. Please check your internet connection.';
      } else {
        userFriendlyError = errorMessage;
      }
      
      return NextResponse.json(
        { 
          error: userFriendlyError,
          details: errorMessage
        },
        { status: 500 }
      );
    }

    if (!uplistingProperties || uplistingProperties.length === 0) {
      return NextResponse.json(
        { 
          message: 'No properties found in Uplisting',
          properties_synced: 0,
          photos_synced: 0
        },
        { status: 200 }
      );
    }

    let totalPropertiesSynced = 0;
    let totalPhotosSynced = 0;
    const syncResults = [];

    // Sync each property
    for (const uplistingProperty of uplistingProperties) {
      const propertyId = uplistingProperty.id;
      
      try {
        console.log(`Syncing property: ${propertyId}`);

        // Fetch full property details with photos
        const { property: fullProperty, photos } = await fetchUplistingProperty(propertyId);
        
        console.log(`  Found ${photos.length} photos for property ${propertyId}`);

        // Prepare property data for database
        const propertyData = {
          uplisting_id: propertyId,
          data: {
            id: fullProperty.id,
            type: fullProperty.type,
            attributes: fullProperty.attributes || {},
            relationships: fullProperty.relationships || {},
          },
          last_synced: new Date().toISOString(),
        };

        // Upsert property into cached_properties
        const { data: upsertedProperty, error: upsertError } = await supabaseServer
          .from('cached_properties')
          .upsert(
            propertyData,
            {
              onConflict: 'uplisting_id',
              ignoreDuplicates: false,
            }
          )
          .select()
          .single();

        if (upsertError) {
          console.error(`  Error upserting property ${propertyId}:`, upsertError);
          throw upsertError;
        }

        console.log(`  Successfully upserted property ${propertyId}`);

        // Delete existing photos for this property
        const { error: deleteError } = await supabaseServer
          .from('property_photos')
          .delete()
          .eq('property_id', propertyId);

        if (deleteError) {
          console.error(`  Error deleting old photos:`, deleteError);
          throw deleteError;
        }

        // Insert new photos
        let photosInserted = 0;
        if (photos.length > 0) {
          const photoRecords = photos.map((photo, index) => ({
            property_id: propertyId,
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

          photosInserted = photos.length;
          console.log(`  Successfully synced ${photosInserted} photos`);
        }

        totalPropertiesSynced++;
        totalPhotosSynced += photosInserted;
        
        syncResults.push({
          property_id: propertyId,
          property_name: fullProperty.attributes?.name || fullProperty.attributes?.nickname || 'Unnamed Property',
          photos_count: photosInserted,
          status: 'success',
        });

      } catch (error) {
        console.error(`Error syncing property ${propertyId}:`, error);
        syncResults.push({
          property_id: propertyId,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(`Property sync complete. Properties synced: ${totalPropertiesSynced}, Photos synced: ${totalPhotosSynced}`);

    return NextResponse.json({
      message: 'Property sync completed',
      properties_synced: totalPropertiesSynced,
      total_properties: uplistingProperties.length,
      photos_synced: totalPhotosSynced,
      results: syncResults,
    });

  } catch (error) {
    console.error('Error in property sync:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync properties',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

