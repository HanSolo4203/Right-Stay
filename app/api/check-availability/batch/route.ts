import { NextResponse } from 'next/server';
import { checkAvailabilityBatch } from '@/lib/properties-data';

export const revalidate = 0;

/**
 * POST /api/check-availability/batch
 * Body: { propertyIds: string[], startDate: string, endDate: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const propertyIds = Array.isArray(body.propertyIds) ? body.propertyIds : [];
    const startDate = body.startDate as string;
    const endDate = body.endDate as string;

    if (!startDate || !endDate || propertyIds.length === 0) {
      return NextResponse.json(
        { error: 'propertyIds, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    const availability = await checkAvailabilityBatch(propertyIds, startDate, endDate);

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('Batch availability error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
