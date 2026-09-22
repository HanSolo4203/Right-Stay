import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/admin/guide-items/upload-photo
 * Upload an image file to the guide-photos bucket and create a guide_item_photos record
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const guideItemId = formData.get('guideItemId') as string | null;
    const isPrimary = formData.get('isPrimary') === 'true';

    if (!file || !guideItemId) {
      return NextResponse.json(
        { error: 'File and guideItemId are required' },
        { status: 400 }
      );
    }

    const hasImageMime = file.type.startsWith('image/');
    const hasImageExtension = /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name);
    if (!hasImageMime && !hasImageExtension) {
      return NextResponse.json(
        { error: 'Only image files can be uploaded' },
        { status: 400 }
      );
    }

    const { data: item, error: itemError } = await supabase
      .from('guide_items')
      .select('id')
      .eq('id', guideItemId)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: 'Guide item not found' }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${guideItemId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;
    const contentType =
      file.type && file.type.startsWith('image/')
        ? file.type
        : fileExt === 'png'
          ? 'image/png'
          : fileExt === 'webp'
            ? 'image/webp'
            : fileExt === 'gif'
              ? 'image/gif'
              : 'image/jpeg';

    console.log('Uploading guide photo to path:', filePath, 'Size:', buffer.length, 'Type:', file.type);

    const { error: uploadError } = await supabase.storage
      .from('guide-photos')
      .upload(filePath, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);

      if (
        uploadError.message?.includes('Bucket not found') ||
        uploadError.message?.includes('not found')
      ) {
        return NextResponse.json(
          {
            error: 'Storage bucket not found',
            details:
              'Please create a "guide-photos" bucket in Supabase Storage. See GUIDE_STORAGE_BUCKET.md for instructions.',
            uploadError: uploadError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to upload image', details: uploadError.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('guide-photos').getPublicUrl(filePath);

    console.log('Guide photo uploaded successfully. Public URL:', publicUrl);

    const { count } = await supabase
      .from('guide_item_photos')
      .select('id', { count: 'exact', head: true })
      .eq('guide_item_id', guideItemId);

    const makePrimary = isPrimary || (count ?? 0) === 0;

    if (makePrimary) {
      await supabase
        .from('guide_item_photos')
        .update({ is_primary: false })
        .eq('guide_item_id', guideItemId);
    }

    const { data: existingPhotos } = await supabase
      .from('guide_item_photos')
      .select('sort_order')
      .eq('guide_item_id', guideItemId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextSortOrder =
      existingPhotos && existingPhotos.length > 0
        ? (existingPhotos[0].sort_order || 0) + 1
        : 0;

    const { data: photoData, error: photoError } = await supabase
      .from('guide_item_photos')
      .insert({
        guide_item_id: guideItemId,
        storage_path: filePath,
        url: publicUrl,
        is_primary: makePrimary,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (photoError) {
      console.error('Database insert error:', photoError);
      await supabase.storage.from('guide-photos').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to save photo record', details: photoError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photo: photoData,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Error uploading guide photo:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload photo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
