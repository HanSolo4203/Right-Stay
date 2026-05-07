import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function buildPricingObject(row: any) {
  if (!row) return null;

  return {
    propertyId: row.property_id as string,
    minPrice: row.min_price !== null && row.min_price !== undefined ? Number(row.min_price) : null,
    basePrice:
      row.base_price !== null && row.base_price !== undefined ? Number(row.base_price) : null,
    maxPrice: row.max_price !== null && row.max_price !== undefined ? Number(row.max_price) : null,
    pricingEnabled: !!row.pricing_enabled,
    cleaningFee:
      row.cleaning_fee !== null && row.cleaning_fee !== undefined ? Number(row.cleaning_fee) : null,
    serviceFeePercent:
      row.service_fee_percent !== null && row.service_fee_percent !== undefined
        ? Number(row.service_fee_percent)
        : null,
  };
}

export async function GET(request: Request) {
  try {
    // Check if Supabase is configured
    if (!supabaseServer) {
      console.warn('Supabase environment variables not configured');
      console.warn('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
      console.warn('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
      return NextResponse.json({ 
        error: 'Database not configured', 
        properties: [] 
      }, { status: 200 });
    }

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
        console.error('Supabase error fetching property:', propertyError);
        console.error('Error details:', JSON.stringify(propertyError, null, 2));
        return NextResponse.json({ 
          error: propertyError.message,
          details: propertyError 
        }, { status: 500 });
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

      // Fetch pricing for this property (if any)
      const { data: pricingRow, error: pricingError } = await supabaseServer
        .from('property_pricing')
        .select('*')
        .eq('property_id', property.id)
        .maybeSingle();

      if (pricingError) {
        console.warn('Error fetching pricing:', pricingError);
      }

      const propertyWithPhotosAndPricing = {
        ...property,
        photos: photos || [],
        pricing: buildPricingObject(pricingRow),
      };

      return NextResponse.json({ property: propertyWithPhotosAndPricing });
    }

    // Otherwise fetch all properties
    console.log('API: Fetching properties from Supabase...');
    
    const { data: properties, error: propertiesError } = await supabaseServer
      .from('cached_properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Supabase error fetching properties:', propertiesError);
      console.error('Error details:', JSON.stringify(propertiesError, null, 2));
      console.error('Error code:', propertiesError.code);
      console.error('Error hint:', propertiesError.hint);
      
      // Return a more helpful error message
      return NextResponse.json({ 
        error: propertiesError.message || 'Failed to fetch properties',
        code: propertiesError.code,
        details: propertiesError.hint || propertiesError.details
      }, { status: 500 });
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
      // Continue without photos if there's an error - return properties without photos
      return NextResponse.json({ 
        properties: properties.map(p => ({ ...p, photos: [], pricing: null }))
      });
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

    // Fetch pricing for all properties
    const cachedIds = properties.map(p => p.id);
    let pricingByPropertyId = new Map<string, any>();

    if (cachedIds.length > 0) {
      const { data: pricingRows, error: pricingError } = await supabaseServer
        .from('property_pricing')
        .select('*')
        .in('property_id', cachedIds);

      if (pricingError) {
        console.warn('Error fetching pricing for properties:', pricingError);
      } else if (pricingRows) {
        for (const row of pricingRows) {
          pricingByPropertyId.set(row.property_id, row);
        }
      }
    }

    // Attach photos and pricing to properties
    const propertiesWithExtras = properties.map(property => ({
      ...property,
      photos: photosByProperty.get(property.uplisting_id) || [],
      pricing: buildPricingObject(pricingByPropertyId.get(property.id)),
    }));

    console.log('API: Attached photos and pricing to properties');
    return NextResponse.json({ properties: propertiesWithExtras });
  } catch (error) {
    console.error('Unexpected error fetching properties:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error stack:', errorStack);
    return NextResponse.json({ 
      error: 'Failed to fetch properties',
      message: errorMessage
    }, { status: 500 });
  }
}

