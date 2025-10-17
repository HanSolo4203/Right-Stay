import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tour_packages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching tour packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tour packages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const tourData = {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      duration: body.duration,
      max_participants: parseInt(body.max_participants),
      location: body.location,
      is_active: body.is_active !== undefined ? body.is_active : true,
    };

    const { data, error } = await supabase
      .from('tour_packages')
      .insert([tourData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating tour package:', error);
    return NextResponse.json(
      { error: 'Failed to create tour package' },
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
        { error: 'Tour package ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const tourData = {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      duration: body.duration,
      max_participants: parseInt(body.max_participants),
      location: body.location,
      is_active: body.is_active,
    };

    const { data, error } = await supabase
      .from('tour_packages')
      .update(tourData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating tour package:', error);
    return NextResponse.json(
      { error: 'Failed to update tour package' },
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
        { error: 'Tour package ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('tour_packages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tour package:', error);
    return NextResponse.json(
      { error: 'Failed to delete tour package' },
      { status: 500 }
    );
  }
}

