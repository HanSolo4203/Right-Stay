import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*');

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Prepare settings to upsert
    const settingsToUpsert = [];

    // Text-based settings
    const textSettings = ['site_name', 'site_email', 'site_phone', 'site_address'];
    for (const key of textSettings) {
      if (body[key] !== undefined) {
        settingsToUpsert.push({
          key,
          text_value: body[key],
          value: null,
        });
      }
    }

    // Numeric settings
    const numericSettings = [
      'commission_rate',
      'payment_processing_fee',
      'default_cleaning_fee',
      'default_welcome_pack_fee',
    ];
    for (const key of numericSettings) {
      if (body[key] !== undefined && body[key] !== '') {
        settingsToUpsert.push({
          key,
          value: parseFloat(body[key]),
          text_value: null,
        });
      }
    }

    // Upsert all settings
    const { error } = await supabase
      .from('app_settings')
      .upsert(settingsToUpsert, { onConflict: 'key' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving site settings:', error);
    return NextResponse.json(
      { error: 'Failed to save site settings' },
      { status: 500 }
    );
  }
}

