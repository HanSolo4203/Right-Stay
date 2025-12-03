import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/admin/properties/photos?propertyId=xxx
 * Get all photos for a property
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('property_photos')
      .select('*')
      .eq('property_id', propertyId)
      .order('position', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ photos: data || [] });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/properties/photos?id=xxx
 * Delete a photo
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Get photo info to delete from storage
    const { data: photo, error: fetchError } = await supabase
      .from('property_photos')
      .select('url')
      .eq('id', photoId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from database
    const { error: deleteError } = await supabase
      .from('property_photos')
      .delete()
      .eq('id', photoId);

    if (deleteError) throw deleteError;

    // Try to delete from storage if it's a Supabase Storage URL
    if (photo?.url && photo.url.includes('/storage/v1/object/public/property-photos/')) {
      const urlParts = photo.url.split('/property-photos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('property-photos').remove([filePath]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/properties/photos?id=xxx
 * Update photo (set primary, position, caption)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');
    const body = await request.json();

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (body.is_primary !== undefined) {
      updateData.is_primary = body.is_primary;
      
      // If setting as primary, unset others
      if (body.is_primary) {
        const { data: photo } = await supabase
          .from('property_photos')
          .select('property_id')
          .eq('id', photoId)
          .single();

        if (photo) {
          await supabase
            .from('property_photos')
            .update({ is_primary: false })
            .eq('property_id', photo.property_id)
            .neq('id', photoId);
        }
      }
    }

    if (body.position !== undefined) {
      updateData.position = parseInt(body.position);
    }

    if (body.caption !== undefined) {
      updateData.caption = body.caption || null;
    }

    const { data, error } = await supabase
      .from('property_photos')
      .update(updateData)
      .eq('id', photoId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ photo: data });
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    );
  }
}


