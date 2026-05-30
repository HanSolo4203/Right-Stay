import { NextResponse } from 'next/server';
import { getPublicSiteContact } from '@/lib/public-site-settings';

export async function GET() {
  const contact = await getPublicSiteContact();

  return NextResponse.json(contact, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
