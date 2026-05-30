import { NextResponse } from 'next/server';
import { getCachedPropertyLocations } from '@/lib/properties-data';
import { supabaseServer } from '@/lib/supabase-server';

export const revalidate = 300;

/**
 * GET /api/properties/locations
 * Returns unique locations from all properties in the database
 */
export async function GET() {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Database not configured', locations: [] },
        { status: 200 }
      );
    }

    const locations = await getCachedPropertyLocations();

    return NextResponse.json(
      { locations },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations', locations: [] },
      { status: 500 }
    );
  }
}
