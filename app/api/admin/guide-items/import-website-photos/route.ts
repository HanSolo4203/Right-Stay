import { NextRequest, NextResponse } from 'next/server';
import { importWebsitePhotosForItem } from '@/lib/import-website-photos';
import { PageImageError } from '@/lib/scrape-page-images';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const guideItemId = typeof body.guideItemId === 'string' ? body.guideItemId.trim() : '';
    const pageUrl = typeof body.pageUrl === 'string' ? body.pageUrl.trim() : '';

    if (!guideItemId) {
      return NextResponse.json({ error: 'guideItemId is required' }, { status: 400 });
    }
    if (!pageUrl) {
      return NextResponse.json({ error: 'Add a Website URL first.' }, { status: 400 });
    }

    const result = await importWebsitePhotosForItem(guideItemId, pageUrl);
    return NextResponse.json({
      success: true,
      importedPhotos: result.importedPhotos,
      skippedPhotos: result.skippedPhotos,
    });
  } catch (error) {
    console.error('Error importing website photos:', error);
    const message = error instanceof Error ? error.message : 'Failed to import photos';
    const status =
      message === 'Guide item not found' ? 404 : error instanceof PageImageError ? 422 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
