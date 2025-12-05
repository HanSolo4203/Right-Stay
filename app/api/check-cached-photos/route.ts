import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * Debug endpoint to check what photo data exists in cached_properties
 */
export async function GET() {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Supabase client not initialized. Check environment variables.' },
        { status: 500 }
      );
    }

    const { data: properties, error } = await supabaseServer
      .from('cached_properties')
      .select('uplisting_id, data')
      .limit(3);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Extract photo information from the cached data
    const photoInfo = properties?.map(prop => {
      const data = prop.data;
      return {
        uplisting_id: prop.uplisting_id,
        property_name: data?.attributes?.name || data?.attributes?.nickname,
        has_photo_relationship: !!data?.relationships?.photos,
        photo_count: data?.relationships?.photos?.data?.length || 0,
        photo_ids: data?.relationships?.photos?.data?.map((p: any) => p.id) || [],
        included_data_keys: data?.included ? Object.keys(data.included) : null,
        raw_data: data, // Include full data for inspection
      };
    });

    return NextResponse.json({ 
      message: 'Cached property photo analysis',
      properties: photoInfo 
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking cached photos:', error);
    return NextResponse.json(
      { error: 'Failed to check cached photos' },
      { status: 500 }
    );
  }
}

