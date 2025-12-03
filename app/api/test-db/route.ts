import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!supabaseServer) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        configured: false
      }, { status: 200 });
    }

    // Test basic connection
    const { data, error } = await supabaseServer
      .from('cached_properties')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({ 
        error: error.message,
        configured: true,
        connected: false
      }, { status: 200 });
    }

    return NextResponse.json({ 
      message: 'Database connection successful',
      configured: true,
      connected: true,
      data: data
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      configured: true,
      connected: false
    }, { status: 200 });
  }
}