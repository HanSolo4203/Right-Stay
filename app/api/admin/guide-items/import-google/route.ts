import { NextRequest, NextResponse } from 'next/server';
import { importGooglePlaceForItem } from '@/lib/import-google-place';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const guideItemId = typeof body.guideItemId === 'string' ? body.guideItemId.trim() : '';
    const placeId = typeof body.placeId === 'string' ? body.placeId.trim() : '';

    if (!guideItemId) {
      return NextResponse.json({ error: 'guideItemId is required' }, { status: 400 });
    }

    const result = await importGooglePlaceForItem(guideItemId, {
      placeId: placeId || null,
      overwriteCopy: body.overwriteCopy !== false,
    });

    return NextResponse.json({
      success: true,
      item: result.item,
      importedPhotos: result.importedPhotos,
      skippedPhotos: result.skippedPhotos,
      description: result.profile.description,
    });
  } catch (error) {
    console.error('Error importing Google place:', error);
    const message = error instanceof Error ? error.message : 'Failed to import Google place';
    const status =
      message === 'Guide item not found'
        ? 404
        : message === 'Could not find this place on Google.'
          ? 404
          : message.includes('already linked')
            ? 409
            : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
