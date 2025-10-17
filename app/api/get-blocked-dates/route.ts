import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/get-blocked-dates
 * Get all blocked dates for a property within a date range
 * 
 * Query parameters:
 * - propertyId: The property ID to check
 * - startDate: Start date (YYYY-MM-DD)
 * - endDate: End date (YYYY-MM-DD)
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

    console.log(`Fetching blocked dates for property ${propertyId} from ${startDate} to ${endDate}`);

    // Fetch all blocked dates in the range
    const { data: blockedDates, error } = await supabaseServer
      .from('cached_availability')
      .select('date, blocked_reason, available')
      .eq('property_id', propertyId)
      .eq('available', false)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching blocked dates:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch blocked dates',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      propertyId,
      startDate,
      endDate,
      blockedDates: blockedDates || [],
      count: blockedDates?.length || 0
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch blocked dates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

