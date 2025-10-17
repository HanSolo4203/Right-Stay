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

    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .order('apartment_number', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Properties fetched successfully:', data?.length || 0, 'properties');
    return NextResponse.json(data || []);
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

    const propertyData = {
      apartment_number: body.apartment_number,
      owner_name: body.owner_name,
      owner_email: body.owner_email || null,
      address: body.address || null,
      cleaner_payout: parseFloat(body.cleaner_payout) || 0,
      welcome_pack_fee: parseFloat(body.welcome_pack_fee) || 0,
    };

    const { data, error } = await supabase
      .from('apartments')
      .insert([propertyData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
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

    const propertyData = {
      apartment_number: body.apartment_number,
      owner_name: body.owner_name,
      owner_email: body.owner_email || null,
      address: body.address || null,
      cleaner_payout: parseFloat(body.cleaner_payout) || 0,
      welcome_pack_fee: parseFloat(body.welcome_pack_fee) || 0,
    };

    const { data, error } = await supabase
      .from('apartments')
      .update(propertyData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
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
      .from('apartments')
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

