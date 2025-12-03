import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Check if bookings table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);

    // If table doesn't exist, return empty array
    if (tableError && tableError.message?.includes('does not exist')) {
      console.log('Bookings table does not exist, returning empty array');
      return NextResponse.json([]);
    }

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

    if (error) {
      // If related tables don't exist, try simpler query
      if (error.message?.includes('does not exist')) {
        const { data: simpleData, error: simpleError } = await supabase
          .from('bookings')
          .select('*')
          .order('check_in_date', { ascending: false });
        
        if (simpleError) throw simpleError;
        return NextResponse.json(simpleData || []);
      }
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    // Return empty array instead of error to prevent dashboard from breaking
    return NextResponse.json([]);
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

    // Normalize payment_date to ISO (handles formats like DD/MM/YYYY or YYYY-MM-DD)
    const normalizeDateToISO = (input: string | null | undefined): string | null => {
      if (!input) return null;
      const trimmed = String(input).trim();
      if (!trimmed) return null;

      // If it's already ISO-like (YYYY-MM-DD or full ISO), attempt Date parse
      if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) return d.toISOString();
      }

      // Handle DD/MM/YYYY
      const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy) {
        const day = parseInt(ddmmyyyy[1], 10);
        const month = parseInt(ddmmyyyy[2], 10) - 1; // JS months 0-based
        const year = parseInt(ddmmyyyy[3], 10);
        const d = new Date(Date.UTC(year, month, day, 0, 0, 0));
        if (!isNaN(d.getTime())) return d.toISOString();
      }

      // Fallback: attempt Date parse
      const d = new Date(trimmed);
      return isNaN(d.getTime()) ? null : d.toISOString();
    };

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
    if (payment_date !== undefined) {
      const iso = normalizeDateToISO(payment_date);
      // If parsing fails, set null to avoid invalid format errors
      updateData.payment_date = iso;
    }
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

