import { NextResponse } from 'next/server';
import { getCachedProperties, getCachedPropertyByUplistingId } from '@/lib/properties-data';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 120;

export async function GET(request: Request) {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Database not configured', properties: [] },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('id');

    if (propertyId) {
      const property = await getCachedPropertyByUplistingId(propertyId);
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }
      return NextResponse.json(
        { property },
        { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' } }
      );
    }

    const properties = await getCachedProperties();
    return NextResponse.json(
      { properties },
      { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Unexpected error fetching properties:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch properties', message: errorMessage },
      { status: 500 }
    );
  }
}

