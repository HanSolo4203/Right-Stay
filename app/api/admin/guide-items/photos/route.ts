import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/admin/guide-items/photos?guideItemId=xxx
 * Get all photos for a guide item
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guideItemId = searchParams.get('guideItemId');

    if (!guideItemId) {
      return NextResponse.json({ error: 'guideItemId is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('guide_item_photos')
      .select('*')
      .eq('guide_item_id', guideItemId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ photos: data || [] });
  } catch (error) {
    console.error('Error fetching guide item photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/guide-items/photos?id=xxx
 * Delete a photo from storage and the database
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    const { data: photo, error: fetchError } = await supabase
      .from('guide_item_photos')
      .select('storage_path, url')
      .eq('id', photoId)
      .single();

    if (fetchError) throw fetchError;

    const { error: deleteError } = await supabase
      .from('guide_item_photos')
      .delete()
      .eq('id', photoId);

    if (deleteError) throw deleteError;

    if (photo?.storage_path) {
      await supabase.storage.from('guide-photos').remove([photo.storage_path]);
    } else if (photo?.url?.includes('/storage/v1/object/public/guide-photos/')) {
      const urlParts = photo.url.split('/guide-photos/');
      if (urlParts.length > 1) {
        await supabase.storage.from('guide-photos').remove([urlParts[1]]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide item photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/guide-items/photos?id=xxx
 * Update photo (set primary, sort_order)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');
    const body = await request.json();

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.is_primary !== undefined) {
      updateData.is_primary = Boolean(body.is_primary);

      if (body.is_primary) {
        const { data: photo } = await supabase
          .from('guide_item_photos')
          .select('guide_item_id')
          .eq('id', photoId)
          .single();

        if (photo) {
          await supabase
            .from('guide_item_photos')
            .update({ is_primary: false })
            .eq('guide_item_id', photo.guide_item_id)
            .neq('id', photoId);
        }
      }
    }

    if (body.sort_order !== undefined) {
      const sortOrder = Number.parseInt(String(body.sort_order), 10);
      if (!Number.isFinite(sortOrder)) {
        return NextResponse.json({ error: 'Sort order must be a number' }, { status: 400 });
      }
      updateData.sort_order = sortOrder;
    }

    const { data, error } = await supabase
      .from('guide_item_photos')
      .update(updateData)
      .eq('id', photoId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ photo: data });
  } catch (error) {
    console.error('Error updating guide item photo:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}
