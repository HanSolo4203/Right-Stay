import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    console.log('Fetching properties from database...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
    console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

    // Fetch from cached_properties table
    const { data, error } = await supabase
      .from('cached_properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Transform the data to include extracted attributes for easier display
    const transformedData = (data || []).map((property: any) => {
      const attributes = property.data?.attributes || {};
      return {
        id: property.id,
        uplisting_id: property.uplisting_id,
        name: attributes.name || attributes.nickname || 'Unnamed Property',
        type: attributes.type || 'Property',
        bedrooms: attributes.bedrooms || null,
        bathrooms: attributes.bathrooms || null,
        beds: attributes.beds || null,
        maximum_capacity: attributes.maximum_capacity || null,
        currency: attributes.currency || 'ZAR',
        description: attributes.description || '',
        check_in_time: attributes.check_in_time || null,
        check_out_time: attributes.check_out_time || null,
        property_slug: attributes.property_slug || null,
        time_zone: attributes.time_zone || null,
        ical_url: property.ical_url || null,
        last_synced: property.last_synced,
        created_at: property.created_at,
        updated_at: property.updated_at,
        // Keep full data for reference
        data: property.data
      };
    });

    console.log('Properties fetched successfully:', transformedData?.length || 0, 'properties');
    return NextResponse.json(transformedData || []);
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch properties',
        details: error.message,
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create property data structure for cached_properties
    const propertyData = {
      uplisting_id: body.uplisting_id || `prop-${Date.now()}`,
      data: {
        attributes: {
          name: body.name || 'New Property',
          nickname: body.nickname || body.name || 'New Property',
          type: body.type || 'Property',
          bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
          bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
          beds: body.beds ? parseInt(body.beds) : null,
          maximum_capacity: body.maximum_capacity ? parseInt(body.maximum_capacity) : null,
          currency: body.currency || 'ZAR',
          description: body.description || '',
          check_in_time: body.check_in_time ? parseInt(body.check_in_time) : 15,
          check_out_time: body.check_out_time ? parseInt(body.check_out_time) : 11,
          property_slug: body.property_slug || null,
          time_zone: body.time_zone || 'Africa/Johannesburg'
        }
      },
      ical_url: body.ical_url || null
    };

    const { data, error } = await supabase
      .from('cached_properties')
      .insert([propertyData])
      .select()
      .single();

    if (error) throw error;

    // Transform response
    const attributes = data.data?.attributes || {};
    return NextResponse.json({
      id: data.id,
      uplisting_id: data.uplisting_id,
      name: attributes.name || attributes.nickname || 'Unnamed Property',
      type: attributes.type || 'Property',
      bedrooms: attributes.bedrooms,
      bathrooms: attributes.bathrooms,
      maximum_capacity: attributes.maximum_capacity,
      description: attributes.description,
      ical_url: data.ical_url,
      created_at: data.created_at
    });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // First get the existing property to preserve data structure
    const { data: existing, error: fetchError } = await supabase
      .from('cached_properties')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Update the data JSONB field
    const updatedData = {
      ...existing.data,
      attributes: {
        ...existing.data?.attributes,
        name: body.name !== undefined ? body.name : existing.data?.attributes?.name,
        nickname: body.nickname !== undefined ? body.nickname : body.name || existing.data?.attributes?.nickname,
        type: body.type !== undefined ? body.type : existing.data?.attributes?.type,
        bedrooms: body.bedrooms !== undefined ? parseInt(body.bedrooms) : existing.data?.attributes?.bedrooms,
        bathrooms: body.bathrooms !== undefined ? parseInt(body.bathrooms) : existing.data?.attributes?.bathrooms,
        beds: body.beds !== undefined ? parseInt(body.beds) : existing.data?.attributes?.beds,
        maximum_capacity: body.maximum_capacity !== undefined ? parseInt(body.maximum_capacity) : existing.data?.attributes?.maximum_capacity,
        currency: body.currency !== undefined ? body.currency : existing.data?.attributes?.currency || 'ZAR',
        description: body.description !== undefined ? body.description : existing.data?.attributes?.description,
        check_in_time: body.check_in_time !== undefined ? parseInt(body.check_in_time) : existing.data?.attributes?.check_in_time,
        check_out_time: body.check_out_time !== undefined ? parseInt(body.check_out_time) : existing.data?.attributes?.check_out_time,
        property_slug: body.property_slug !== undefined ? body.property_slug : existing.data?.attributes?.property_slug,
        time_zone: body.time_zone !== undefined ? body.time_zone : existing.data?.attributes?.time_zone || 'Africa/Johannesburg'
      }
    };

    const updateData: any = {
      data: updatedData
    };

    if (body.ical_url !== undefined) {
      updateData.ical_url = body.ical_url;
    }

    const { data, error } = await supabase
      .from('cached_properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Transform response
    const attributes = data.data?.attributes || {};
    return NextResponse.json({
      id: data.id,
      uplisting_id: data.uplisting_id,
      name: attributes.name || attributes.nickname || 'Unnamed Property',
      type: attributes.type || 'Property',
      bedrooms: attributes.bedrooms,
      bathrooms: attributes.bathrooms,
      maximum_capacity: attributes.maximum_capacity,
      description: attributes.description,
      ical_url: data.ical_url,
      updated_at: data.updated_at
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('cached_properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}

