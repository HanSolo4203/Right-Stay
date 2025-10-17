import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('id');

    // If requesting a single property
    if (propertyId) {
      console.log('API: Fetching single property:', propertyId);
      
      const { data: property, error: propertyError } = await supabaseServer
        .from('cached_properties')
        .select('*')
        .eq('uplisting_id', propertyId)
        .single();

      if (propertyError) {
        console.error('Supabase error:', propertyError);
        return NextResponse.json({ error: propertyError.message }, { status: 500 });
      }

      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }

      // Fetch photos for this property
      const { data: photos, error: photosError } = await supabaseServer
        .from('property_photos')
        .select('*')
        .eq('property_id', propertyId)
        .order('position', { ascending: true });

      if (photosError) {
        console.warn('Error fetching photos:', photosError);
      }

      const propertyWithPhotos = {
        ...property,
        photos: photos || [],
      };

      return NextResponse.json({ property: propertyWithPhotos });
    }

    // Otherwise fetch all properties
    console.log('API: Fetching properties from Supabase...');
    
    const { data: properties, error: propertiesError } = await supabaseServer
      .from('cached_properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Supabase error:', propertiesError);
      return NextResponse.json({ error: propertiesError.message }, { status: 500 });
    }

    console.log('API: Found', properties?.length || 0, 'properties');

    if (!properties || properties.length === 0) {
      return NextResponse.json({ properties: [] });
    }

    // Fetch photos for all properties
    const propertyIds = properties.map(p => p.uplisting_id);
    const { data: photos, error: photosError } = await supabaseServer
      .from('property_photos')
      .select('*')
      .in('property_id', propertyIds)
      .order('position', { ascending: true });

    if (photosError) {
      console.warn('Error fetching photos:', photosError);
      // Continue without photos if there's an error
      return NextResponse.json({ properties });
    }

    // Group photos by property_id
    const photosByProperty = new Map<string, any[]>();
    if (photos) {
      for (const photo of photos) {
        if (!photosByProperty.has(photo.property_id)) {
          photosByProperty.set(photo.property_id, []);
        }
        photosByProperty.get(photo.property_id)!.push(photo);
      }
    }

    // Attach photos to properties
    const propertiesWithPhotos = properties.map(property => ({
      ...property,
      photos: photosByProperty.get(property.uplisting_id) || [],
    }));

    console.log('API: Attached photos to properties');
    return NextResponse.json({ properties: propertiesWithPhotos });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

