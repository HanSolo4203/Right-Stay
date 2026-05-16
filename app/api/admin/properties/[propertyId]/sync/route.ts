import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import {
  syncSinglePropertyFromUplisting,
  validateUplistingApiKey,
} from '@/lib/sync-uplisting-property';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/properties/[propertyId]/sync
 * Sync one property and its photos from Uplisting (replaces existing photos).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ propertyId: string }> }
) {
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

    const { propertyId } = await params;
    if (!propertyId?.trim()) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const { data: existing, error: lookupError } = await supabaseServer
      .from('cached_properties')
      .select('uplisting_id')
      .eq('uplisting_id', propertyId)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json(
        { error: 'Failed to look up property', details: lookupError.message },
        { status: 500 }
      );
    }

    if (!existing) {
      return NextResponse.json(
        { error: `Property ${propertyId} not found in database` },
        { status: 404 }
      );
    }

    const result = await syncSinglePropertyFromUplisting(supabaseServer, propertyId);

    return NextResponse.json({
      message: 'Property synced from Uplisting',
      property_id: result.property_id,
      property_name: result.property_name,
      photos_synced: result.photos_count,
      photos_in_uplisting_api: result.photos_in_uplisting_api,
    });
  } catch (error) {
    console.error('Error syncing single property from Uplisting:', error);
    const details = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to sync property from Uplisting',
        details,
      },
      { status: 500 }
    );
  }
}
