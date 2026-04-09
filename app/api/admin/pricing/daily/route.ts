import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/admin/pricing/daily
 * Body: { propertyId (uplisting_id), date (YYYY-MM-DD), price }
 * Upserts a custom daily price
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, date, price } = body;

    if (!propertyId || !date || price == null) {
      return NextResponse.json(
        { error: 'propertyId, date, and price are required' },
        { status: 400 }
      );
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Resolve uplisting_id -> cached_properties.id
    const { data: property, error: propError } = await supabase
      .from('cached_properties')
      .select('id')
      .eq('uplisting_id', propertyId)
      .single();

    if (propError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('property_daily_prices')
      .upsert(
        {
          property_id: property.id,
          date,
          price: priceNum,
          is_custom: true,
        },
        { onConflict: 'property_id,date' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      dailyPrice: {
        date: data.date,
        price: Number(data.price),
        isCustom: data.is_custom,
      },
    });
  } catch (error) {
    console.error('Error upserting daily price:', error);
    return NextResponse.json(
      {
        error: 'Failed to save daily price',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pricing/daily
 * Query params: propertyId (uplisting_id), date (YYYY-MM-DD)
 * Removes custom daily price for that date
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const date = searchParams.get('date');

    if (!propertyId || !date) {
      return NextResponse.json(
        { error: 'propertyId and date are required' },
        { status: 400 }
      );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Resolve uplisting_id -> cached_properties.id
    const { data: property, error: propError } = await supabase
      .from('cached_properties')
      .select('id')
      .eq('uplisting_id', propertyId)
      .single();

    if (propError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('property_daily_prices')
      .delete()
      .eq('property_id', property.id)
      .eq('date', date);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily price:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete daily price',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
