import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { fetchUplistingProperties } from '@/lib/uplisting';
import {
  syncSinglePropertyFromUplisting,
  validateUplistingApiKey,
} from '@/lib/sync-uplisting-property';

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

    const apiKeyError = validateUplistingApiKey();
    if (apiKeyError) {
      return NextResponse.json({ error: apiKeyError }, { status: 400 });
    }

    console.log('Starting property sync from Uplisting API...');

    let uplistingProperties;
    try {
      uplistingProperties = await fetchUplistingProperties();
      console.log(`Fetched ${uplistingProperties.length} properties from Uplisting API`);
    } catch (error) {
      console.error('Error fetching properties from Uplisting API:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      let userFriendlyError = 'Failed to fetch properties from Uplisting API';
      if (errorMessage.includes('UPLISTING_API_KEY')) {
        userFriendlyError = errorMessage;
      } else if (
        errorMessage.includes('Invalid') ||
        errorMessage.includes('API key') ||
        errorMessage.includes('API access')
      ) {
        userFriendlyError = errorMessage;
      } else if (errorMessage.includes('Network error')) {
        userFriendlyError =
          'Network error connecting to Uplisting API. Please check your internet connection.';
      } else {
        userFriendlyError = errorMessage;
      }

      return NextResponse.json(
        {
          error: userFriendlyError,
          details: errorMessage,
        },
        { status: 500 }
      );
    }

    if (!uplistingProperties || uplistingProperties.length === 0) {
      return NextResponse.json(
        {
          message: 'No properties found in Uplisting',
          properties_synced: 0,
          photos_synced: 0,
        },
        { status: 200 }
      );
    }

    let totalPropertiesSynced = 0;
    let totalPhotosSynced = 0;
    const syncResults = [];

    for (const uplistingProperty of uplistingProperties) {
      const propertyId = uplistingProperty.id;

      try {
        console.log(`Syncing property: ${propertyId}`);
        const result = await syncSinglePropertyFromUplisting(supabaseServer, propertyId);

        totalPropertiesSynced++;
        totalPhotosSynced += result.photos_count;
        syncResults.push(result);
        console.log(`  Successfully synced ${result.photos_count} photos`);
      } catch (error) {
        console.error(`Error syncing property ${propertyId}:`, error);
        syncResults.push({
          property_id: propertyId,
          property_name: 'Unknown',
          photos_count: 0,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(
      `Property sync complete. Properties synced: ${totalPropertiesSynced}, Photos synced: ${totalPhotosSynced}`
    );

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
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
