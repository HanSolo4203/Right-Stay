import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * Manual photo addition endpoint
 * POST /api/manual-add-photo
 * Body: { property_id, photos: [{ url, caption?, position? }] }
 */
export async function POST(request: Request) {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Supabase client not initialized. Check environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { property_id, photos } = body;

    if (!property_id || !photos || !Array.isArray(photos)) {
      return NextResponse.json(
        { error: 'Invalid request. Required: property_id and photos array' },
        { status: 400 }
      );
    }

    // Verify property exists
    const { data: property, error: propertyError } = await supabaseServer
      .from('cached_properties')
      .select('uplisting_id')
      .eq('uplisting_id', property_id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: `Property ${property_id} not found` },
        { status: 404 }
      );
    }

    // Delete existing photos for this property
    await supabaseServer
      .from('property_photos')
      .delete()
      .eq('property_id', property_id);

    // Insert new photos
    const photoRecords = photos.map((photo, index) => ({
      property_id,
      photo_id: `manual_${property_id}_${index}`,
      url: photo.url,
      caption: photo.caption || null,
      position: photo.position ?? index,
      is_primary: index === 0,
      width: photo.width || null,
      height: photo.height || null,
    }));

    const { data, error: insertError } = await supabaseServer
      .from('property_photos')
      .insert(photoRecords)
      .select();

    if (insertError) {
      console.error('Error inserting photos:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert photos', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Photos added successfully',
      property_id,
      photos_count: data.length,
      photos: data,
    });

  } catch (error) {
    console.error('Error in manual photo addition:', error);
    return NextResponse.json(
      { error: 'Failed to add photos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/manual-add-photo - Returns usage instructions
 */
export async function GET() {
  return NextResponse.json({
    message: 'Manual Photo Addition API',
    usage: {
      method: 'POST',
      endpoint: '/api/manual-add-photo',
      body: {
        property_id: 'string (Uplisting property ID)',
        photos: [
          {
            url: 'string (photo URL)',
            caption: 'string (optional)',
            position: 'number (optional, defaults to array index)',
            width: 'number (optional)',
            height: 'number (optional)',
          }
        ]
      },
      example: {
        property_id: '126709',
        photos: [
          {
            url: 'https://example.com/photo1.jpg',
            caption: 'Living room',
            position: 0
          },
          {
            url: 'https://example.com/photo2.jpg',
            caption: 'Bedroom',
            position: 1
          }
        ]
      }
    },
    curl_example: `curl -X POST http://localhost:3000/api/manual-add-photo \\
  -H "Content-Type: application/json" \\
  -d '{
    "property_id": "126709",
    "photos": [
      {"url": "https://example.com/photo1.jpg", "position": 0},
      {"url": "https://example.com/photo2.jpg", "position": 1}
    ]
  }'`
  });
}

