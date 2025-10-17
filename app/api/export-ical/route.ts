import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Format a date as YYYYMMDD for iCal
 */
function formatICalDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Generate iCal UID (unique identifier for each event)
 */
function generateUID(bookingId: string, domain: string = 'rightstayafrica.com'): string {
  return `booking-${bookingId}@${domain}`;
}

/**
 * Escape special characters in iCal text fields
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const apartmentNumber = searchParams.get('apartmentNumber');
    
    // Build the query
    let query = supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        check_in_date,
        check_out_date,
        booking_status,
        apartments!inner (
          id,
          apartment_number,
          address
        ),
        guests!inner (
          name,
          email
        ),
        booking_channels!inner (
          name
        )
      `)
      .in('booking_status', ['confirmed', 'completed']);

    // Filter by property if specified
    if (propertyId) {
      query = query.eq('apartment_id', propertyId);
    } else if (apartmentNumber) {
      query = query.eq('apartments.apartment_number', apartmentNumber);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    if (!bookings || bookings.length === 0) {
      // Return empty calendar if no bookings
      const emptyCalendar = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Right Stay Africa//Booking Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Right Stay Africa Bookings',
        'X-WR-TIMEZONE:Africa/Johannesburg',
        'END:VCALENDAR'
      ].join('\r\n');

      return new NextResponse(emptyCalendar, {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': 'inline; filename="bookings.ics"',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Generate iCal format
    const icalLines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Right Stay Africa//Booking Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Right Stay Africa Bookings',
      'X-WR-TIMEZONE:Africa/Johannesburg',
    ];

    // Add each booking as an event
    for (const booking of bookings) {
      const apartment = booking.apartments as any;
      const guest = booking.guests as any;
      const channel = booking.booking_channels as any;
      
      const dtstart = formatICalDate(booking.check_in_date);
      const dtend = formatICalDate(booking.check_out_date);
      const uid = generateUID(booking.id);
      const summary = 'Booked'; // Simple summary that Airbnb will understand
      const description = escapeICalText(
        `Booking: ${booking.booking_reference}\n` +
        `Guest: ${guest.name}\n` +
        `Channel: ${channel.name}\n` +
        `Property: ${apartment.apartment_number}`
      );
      
      // Create timestamp for when this event was created/modified
      const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icalLines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${dtstart}`,
        `DTEND;VALUE=DATE:${dtend}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `STATUS:CONFIRMED`,
        `TRANSP:OPAQUE`, // Blocks time (not transparent)
        'END:VEVENT'
      );
    }

    icalLines.push('END:VCALENDAR');

    // Join with CRLF as per iCal spec (RFC 5545)
    const icalContent = icalLines.join('\r\n');

    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="bookings.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Error generating iCal feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate iCal feed' },
      { status: 500 }
    );
  }
}

