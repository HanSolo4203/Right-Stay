import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseServer) {
      return NextResponse.json(
        { error: 'Database not configured', reviews: [] },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    let query = supabaseServer
      .from('reviews')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    // Filter by featured if specified
    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
      }
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist, return empty array
      if (error.message?.includes('does not exist')) {
        console.log('Reviews table does not exist, returning empty array');
        return NextResponse.json({ reviews: [] });
      }
      throw error;
    }

    return NextResponse.json({ reviews: data || [] });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    // Return empty array instead of error to prevent homepage from breaking
    return NextResponse.json({ reviews: [] });
  }
}
