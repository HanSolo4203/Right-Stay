import { NextResponse } from 'next/server';

/**
 * GET /api/cron/sync-calendars
 * Cron endpoint to sync all property calendars on a schedule
 * 
 * This endpoint should be called by a cron service (e.g., Vercel Cron, cron-job.org)
 * to regularly sync availability from external calendars (Airbnb, Booking.com, etc.)
 * 
 * To secure this endpoint, set CRON_SECRET in your environment variables
 * and pass it as: Authorization: Bearer YOUR_CRON_SECRET
 */
export async function GET(request: Request) {
  try {
    // Verify authorization if CRON_SECRET is set
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      const expectedAuth = `Bearer ${cronSecret}`;
      
      if (authHeader !== expectedAuth) {
        console.error('Unauthorized cron request');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      console.warn('CRON_SECRET not set - endpoint is not secured!');
    }

    console.log('Starting scheduled calendar sync...');

    // Get the base URL from environment or construct it
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;

    // Call the sync-availability endpoint
    const response = await fetch(`${baseUrl}/api/sync-availability`, {
      method: 'GET',
    });

    const result = await response.json();

    console.log('Scheduled sync completed:', result);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json({ 
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

