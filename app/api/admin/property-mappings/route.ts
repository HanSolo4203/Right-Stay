import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('property_mapping')
      .select(`
        *,
        apartments (
          apartment_number,
          address
        )
      `)
      .order('uplisting_property_id', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching property mappings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property mappings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const mappingData = {
      uplisting_property_id: body.uplisting_property_id,
      apartment_id: body.apartment_id,
    };

    const { data, error } = await supabase
      .from('property_mapping')
      .insert([mappingData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating property mapping:', error);
    return NextResponse.json(
      { error: 'Failed to create property mapping' },
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
        { error: 'Property mapping ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const mappingData = {
      uplisting_property_id: body.uplisting_property_id,
      apartment_id: body.apartment_id,
    };

    const { data, error } = await supabase
      .from('property_mapping')
      .update(mappingData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating property mapping:', error);
    return NextResponse.json(
      { error: 'Failed to update property mapping' },
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
        { error: 'Property mapping ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('property_mapping')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property mapping:', error);
    return NextResponse.json(
      { error: 'Failed to delete property mapping' },
      { status: 500 }
    );
  }
}
