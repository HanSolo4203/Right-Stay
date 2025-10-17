import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        apartment:apartments (
          apartment_number,
          address
        ),
        guest:guests (
          name,
          email,
          phone
        ),
        channel:booking_channels (
          name
        )
      `)
      .order('check_in_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
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
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { booking_status, payment_status, payment_date, payment_method, payment_notes } = body;

    // Only allow status update to confirmed if payment is received
    if (booking_status === 'confirmed' && payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Cannot confirm booking without payment confirmation' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (booking_status !== undefined) updateData.booking_status = booking_status;
    if (payment_status !== undefined) updateData.payment_status = payment_status;
    if (payment_date !== undefined) updateData.payment_date = payment_date;
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (payment_notes !== undefined) updateData.payment_notes = payment_notes;

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
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
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // First, check if this is a Direct booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        channel:booking_channels (
          name
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Only allow deletion for Direct bookings
    if ((booking.channel as any)?.name !== 'Direct') {
      return NextResponse.json(
        { error: 'Only Direct bookings can be deleted. Other bookings can be cancelled.' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}

