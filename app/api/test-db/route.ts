import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Check environment variables
    const envCheck = {
      supabaseUrl: !!supabaseUrl,
      supabaseServiceKey: !!supabaseServiceKey,
      supabaseAnonKey: !!supabaseAnonKey,
      supabaseUrlValue: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'MISSING',
    };

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Missing Supabase environment variables',
        envCheck,
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test database connection
    const { data, error } = await supabase
      .from('apartments')
      .select('id, apartment_number, owner_name')
      .limit(5);

    if (error) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: error.message,
        envCheck,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      envCheck,
      apartmentCount: data?.length || 0,
      apartments: data,
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error.message,
    }, { status: 500 });
  }
}
