import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 3) {
    return NextResponse.json(
      { error: 'Enter at least 3 characters to search.' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      q,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': 'RightStayAfrica/1.0 (property-admin-geocode)',
        Accept: 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Geocoding service unavailable. Try again shortly.' },
        { status: 502 }
      );
    }

    const results = (await response.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    if (!results?.length) {
      return NextResponse.json(
        { error: 'No results found for that address.' },
        { status: 404 }
      );
    }

    const hit = results[0];
    return NextResponse.json({
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      displayName: hit.display_name,
    });
  } catch (error) {
    console.error('Geocode error:', error);
    return NextResponse.json(
      { error: 'Geocoding request failed.' },
      { status: 500 }
    );
  }
}
