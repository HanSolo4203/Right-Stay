import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/check-availability
 * Check if a property is available for the specified date range
 * 
 * Query parameters:
 * - propertyId: The property ID to check
 * - startDate: Check-in date (YYYY-MM-DD)
 * - endDate: Check-out date (YYYY-MM-DD)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate parameters
    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Missing required parameters: propertyId, startDate, and endDate are required' 
      }, { status: 400 });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      }, { status: 400 });
    }

    // Validate date logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return NextResponse.json({ 
        error: 'Check-out date must be after check-in date' 
      }, { status: 400 });
    }

    console.log(`Checking availability for property ${propertyId} from ${startDate} to ${endDate}`);

    // Check for any blocked dates in the range
    // Note: We check dates >= startDate and < endDate (check-out date is not included in stay)
    const { data: blockedDates, error } = await supabaseServer
      .from('cached_availability')
      .select('date, blocked_reason, available')
      .eq('property_id', propertyId)
      .eq('available', false)
      .gte('date', startDate)
      .lt('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error checking availability:', error);
      return NextResponse.json({ 
        error: 'Failed to check availability',
        details: error.message 
      }, { status: 500 });
    }

    const isAvailable = !blockedDates || blockedDates.length === 0;

    // Calculate number of nights
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const response = {
      available: isAvailable,
      propertyId,
      startDate,
      endDate,
      nights,
      blockedDates: blockedDates || [],
      message: isAvailable 
        ? `Property is available for ${nights} night(s)`
        : `Property is not available. ${blockedDates.length} date(s) are already booked.`
    };

    console.log(`Availability check result:`, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Failed to check availability',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

