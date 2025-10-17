import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with better error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    serviceKey: !!supabaseServiceKey,
    anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
}

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface BookingRequest {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  specialRequests: string;
  pricing: {
    numberOfNights: number;
    basePrice?: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
  };
}

export async function POST(request: Request) {
  try {
    // Check environment variables first
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration error:', {
        url: supabaseUrl ? 'SET' : 'MISSING',
        serviceKey: supabaseServiceKey ? 'SET' : 'MISSING',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
      });
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const body: BookingRequest = await request.json();
    
    // Debug logging
    console.log('Booking request received:', JSON.stringify(body, null, 2));
    
    const {
      propertyId,
      checkInDate,
      checkOutDate,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests,
      specialRequests,
      pricing
    } = body;

    // Validate required fields
    if (!propertyId || !checkInDate || !checkOutDate || !guestName || !guestEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, find or create the guest
    let guestId;
    
    // Check if guest already exists
    const { data: existingGuest, error: guestSearchError } = await supabase
      .from('guests')
      .select('id')
      .eq('email', guestEmail)
      .single();

    if (guestSearchError && guestSearchError.code !== 'PGRST116') {
      console.error('Error searching for guest:', guestSearchError);
      return NextResponse.json(
        { error: 'Failed to search for guest' },
        { status: 500 }
      );
    }

    if (existingGuest) {
      guestId = existingGuest.id;
      
      // Update guest information if needed
      const { error: updateError } = await supabase
        .from('guests')
        .update({
          name: guestName,
          phone: guestPhone || null,
        })
        .eq('id', guestId);

      if (updateError) {
        console.error('Error updating guest:', updateError);
      }
    } else {
      // Create new guest
      const { data: newGuest, error: guestCreateError } = await supabase
        .from('guests')
        .insert({
          name: guestName,
          email: guestEmail,
          phone: guestPhone || null,
        })
        .select()
        .single();

      if (guestCreateError) {
        console.error('Error creating guest:', guestCreateError);
        return NextResponse.json(
          { error: 'Failed to create guest record' },
          { status: 500 }
        );
      }

      guestId = newGuest.id;
    }

    // Find the apartment record linked to this property
    let apartment;
    
    // First, check if this is a UUID (direct apartment ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId);
    
    if (isUUID) {
      // This is a direct apartment ID
      const { data: directApartment, error: directError } = await supabase
        .from('apartments')
        .select('id, apartment_number')
        .eq('id', propertyId)
        .single();

      if (directError || !directApartment) {
        console.error('Error fetching apartment by UUID:', directError);
        return NextResponse.json(
          { error: 'No apartment found for this property ID' },
          { status: 500 }
        );
      }
      apartment = directApartment;
    } else {
      // This is an Uplisting property ID - look up in property mapping table
      const { data: mapping, error: mappingError } = await supabase
        .from('property_mapping')
        .select(`
          apartment_id,
          apartments!inner (
            id,
            apartment_number
          )
        `)
        .eq('uplisting_property_id', propertyId)
        .single();

      if (mappingError || !mapping) {
        console.error('Error fetching property mapping for Uplisting property:', mappingError);
        return NextResponse.json(
          { error: `No apartment mapping found for Uplisting property ${propertyId}. Please contact support to set up property mapping.` },
          { status: 500 }
        );
      }
      
      apartment = {
        id: (mapping.apartments as any).id,
        apartment_number: (mapping.apartments as any).apartment_number
      };
      
      console.log(`Mapped Uplisting property ${propertyId} to apartment ${apartment.apartment_number}`);
    }

    // Get or create a "Direct" booking channel
    let channelId;
    const { data: channel, error: channelError } = await supabase
      .from('booking_channels')
      .select('id')
      .eq('name', 'Direct')
      .single();

    if (channelError && channelError.code !== 'PGRST116') {
      console.error('Error fetching channel:', channelError);
      return NextResponse.json(
        { error: 'Failed to fetch booking channel' },
        { status: 500 }
      );
    }

    if (channel) {
      channelId = channel.id;
    } else {
      // Create Direct channel if it doesn't exist
      const { data: newChannel, error: createChannelError } = await supabase
        .from('booking_channels')
        .insert({
          name: 'Direct',
          commission_rate: 0,
          payment_processing_fee: 0,
        })
        .select()
        .single();

      if (createChannelError) {
        console.error('Error creating channel:', createChannelError);
        return NextResponse.json(
          { error: 'Failed to create booking channel' },
          { status: 500 }
        );
      }

      channelId = newChannel.id;
    }

    // Generate a unique booking reference
    const bookingReference = `DIR-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Calculate accommodation total if not provided
    const accommodationTotal = pricing.basePrice || (pricing.total - (pricing.cleaningFee || 0) - (pricing.serviceFee || 0));

    // Ensure dates are in correct format (YYYY-MM-DD)
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };

    // Debug logging for booking data
    console.log('Creating booking with:', {
      propertyId,
      apartment_id: apartment.id,
      apartment_number: apartment.apartment_number,
      check_in_date: formatDate(checkInDate),
      check_out_date: formatDate(checkOutDate),
      accommodation_total: accommodationTotal,
      cleaning_fee: pricing.cleaningFee || 0,
      service_fee: pricing.serviceFee || 0,
      total: pricing.total,
      guest_name: guestName,
      guest_email: guestEmail
    });

    // Create the booking with pending status and payment tracking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_reference: bookingReference,
        apartment_id: apartment.id,
        guest_id: guestId,
        channel_id: channelId,
        check_in_date: formatDate(checkInDate),
        check_out_date: formatDate(checkOutDate),
        accommodation_total: accommodationTotal,
        cleaning_fee: pricing.cleaningFee || 0,
        extra_charges: pricing.serviceFee || 0,
        discount_amount: 0,
        booking_taxes: 0,
        channel_commission: 0,
        payment_processing_fee: 0,
        commission_tax: 0,
        booking_status: 'pending',
        payment_status: 'pending',
        notes: specialRequests || null,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking', details: bookingError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingReference: booking.booking_reference,
        checkInDate: booking.check_in_date,
        checkOutDate: booking.check_out_date,
        total: pricing.total,
      },
    });
  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json(
      { error: 'Failed to process booking request' },
      { status: 500 }
    );
  }
}

