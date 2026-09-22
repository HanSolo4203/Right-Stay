import { NextRequest, NextResponse } from 'next/server';
import {
  geocodeAddress,
  resolvePlaceId,
  suggestAddresses,
} from '@/lib/admin-geocode';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() || '';
  const placeId = request.nextUrl.searchParams.get('placeId')?.trim() || '';
  const sessionToken = request.nextUrl.searchParams.get('sessionToken')?.trim() || undefined;
  const suggest = request.nextUrl.searchParams.get('suggest') === '1';
  const includeProfile = request.nextUrl.searchParams.get('profile') === '1';

  try {
    if (placeId) {
      const resolved = await resolvePlaceId(placeId, sessionToken);
      if (!resolved) {
        return NextResponse.json(
          { error: 'No results found for that address.' },
          { status: 404 }
        );
      }
      return NextResponse.json(resolved);
    }

    if (!q || q.length < (suggest ? 2 : 3)) {
      return NextResponse.json(
        { error: `Enter at least ${suggest ? 2 : 3} characters to search.` },
        { status: 400 }
      );
    }

    if (suggest) {
      const result = await suggestAddresses(q, sessionToken);
      return NextResponse.json(result);
    }

    const resolved = await geocodeAddress(q, { includeProfile });
    if (!resolved) {
      return NextResponse.json(
        { error: 'No results found for that address.' },
        { status: 404 }
      );
    }

    return NextResponse.json(resolved);
  } catch (error) {
    console.error('Geocode error:', error);
    const message =
      error instanceof Error && error.message === 'Geocoding service unavailable. Try again shortly.'
        ? error.message
        : 'Geocoding request failed.';
    const status = message.includes('unavailable') ? 502 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
