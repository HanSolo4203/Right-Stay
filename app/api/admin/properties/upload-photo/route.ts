import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/admin/properties/upload-photo
 * Upload an image file to Supabase Storage and create a property_photos record
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;
    const caption = formData.get('caption') as string | null;
    const isPrimary = formData.get('isPrimary') === 'true';

    if (!file || !propertyId) {
      return NextResponse.json(
        { error: 'File and propertyId are required' },
        { status: 400 }
      );
    }

    // Verify property exists
    const { data: property, error: propertyError } = await supabase
      .from('cached_properties')
      .select('uplisting_id')
      .eq('uplisting_id', propertyId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `property-photos/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-photos')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      
      // Check if bucket doesn't exist
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Storage bucket not found',
            details: 'Please create a "property-photos" bucket in Supabase Storage. See IMAGE_UPLOAD_SETUP.md for instructions.',
            uploadError: uploadError.message
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to upload image', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-photos')
      .getPublicUrl(filePath);

    // If this is primary, unset other primary photos
    if (isPrimary) {
      await supabase
        .from('property_photos')
        .update({ is_primary: false })
        .eq('property_id', propertyId);
    }

    // Get the highest position for this property
    const { data: existingPhotos } = await supabase
      .from('property_photos')
      .select('position')
      .eq('property_id', propertyId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingPhotos && existingPhotos.length > 0
      ? (existingPhotos[0].position || 0) + 1
      : 0;

    // Create photo record
    const { data: photoData, error: photoError } = await supabase
      .from('property_photos')
      .insert({
        property_id: propertyId,
        photo_id: `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        url: publicUrl,
        caption: caption || null,
        position: nextPosition,
        is_primary: isPrimary,
        width: null,
        height: null
      })
      .select()
      .single();

    if (photoError) {
      console.error('Database insert error:', photoError);
      // Try to delete uploaded file if database insert fails
      await supabase.storage.from('property-photos').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to save photo record', details: photoError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      photo: photoData,
      url: publicUrl
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

