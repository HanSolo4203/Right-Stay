import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { parsePriceLabsCSV, calculateBookingPricing } from '@/lib/pricing';

/**
 * GET /api/get-pricing
 * Calculate pricing for a booking based on PriceLabs data
 * 
 * Query parameters:
 * - propertyId: The property ID (e.g., uplisting_135133)
 * - checkInDate: Check-in date (YYYY-MM-DD)
 * - checkOutDate: Check-out date (YYYY-MM-DD)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');

    // Validate parameters
    if (!propertyId || !checkInDate || !checkOutDate) {
      return NextResponse.json({ 
        error: 'Missing required parameters: propertyId, checkInDate, and checkOutDate are required' 
      }, { status: 400 });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkInDate) || !dateRegex.test(checkOutDate)) {
      return NextResponse.json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      }, { status: 400 });
    }

    // Validate date logic
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (end <= start) {
      return NextResponse.json({ 
        error: 'Check-out date must be after check-in date' 
      }, { status: 400 });
    }

    // Read the PriceLabs CSV file
    // For now, we'll use the specific file provided. In production, you'd map propertyId to the correct CSV
    const csvPath = join(process.cwd(), 'public', 'pricing', 'PriceLabs_uplisting_135133_2025-10-17.csv');
    
    let csvText: string;
    try {
      csvText = await readFile(csvPath, 'utf-8');
    } catch (error) {
      console.error('Error reading CSV file:', error);
      // Return default pricing if CSV not found
      return NextResponse.json({
        propertyId,
        checkInDate,
        checkOutDate,
        nights: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
        basePrice: 1500,
        cleaningFee: 500,
        serviceFee: 180,
        total: 2180,
        message: 'Using default pricing (CSV not available)',
        usingDefaultPricing: true
      });
    }

    // Parse CSV and calculate pricing
    const priceMap = parsePriceLabsCSV(csvText);
    const pricing = calculateBookingPricing(checkInDate, checkOutDate, priceMap);

    if (!pricing) {
      return NextResponse.json({ 
        error: 'Invalid date range' 
      }, { status: 400 });
    }

    return NextResponse.json({
      propertyId,
      checkInDate,
      checkOutDate,
      ...pricing,
      usingDefaultPricing: false
    });
  } catch (error) {
    console.error('Error calculating pricing:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate pricing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

