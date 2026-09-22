import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type GuideItemsCount = { count: number }[] | null;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapCategory(row: Record<string, unknown> & { guide_items?: GuideItemsCount }) {
  const { guide_items, ...category } = row;
  return {
    ...category,
    item_count: guide_items?.[0]?.count ?? 0,
  };
}

function isUniqueViolation(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
  );
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('guide_categories')
      .select('*, guide_items(count)')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json((data || []).map(mapCategory));
  } catch (error) {
    console.error('Error fetching guide categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const slug = slugify(typeof body.slug === 'string' && body.slug.trim() ? body.slug : name);

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: 'Category slug is required' },
        { status: 400 }
      );
    }

    let sortOrder = Number.parseInt(String(body.sort_order ?? ''), 10);
    if (!Number.isFinite(sortOrder)) {
      const { data: lastCategory } = await supabase
        .from('guide_categories')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      sortOrder = (lastCategory?.sort_order ?? -1) + 1;
    }

    const categoryData = {
      name,
      slug,
      icon: body.icon || 'Compass',
      color: body.color || '#2f8f5b',
      sort_order: sortOrder,
      is_active: body.is_active !== undefined ? body.is_active : true,
    };

    const { data, error } = await supabase
      .from('guide_categories')
      .insert([categoryData])
      .select('*, guide_items(count)')
      .single();

    if (error) {
      if (isUniqueViolation(error)) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(mapCategory(data));
  } catch (error) {
    console.error('Error creating guide category:', error);
    return NextResponse.json(
      { error: 'Failed to create guide category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Guide category ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const categoryData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!name) {
        return NextResponse.json(
          { error: 'Category name is required' },
          { status: 400 }
        );
      }
      categoryData.name = name;
    }

    if (body.slug !== undefined) {
      const slugSource = typeof body.slug === 'string' ? body.slug : '';
      const slug = slugify(slugSource);
      if (!slug) {
        return NextResponse.json(
          { error: 'Category slug is required' },
          { status: 400 }
        );
      }
      categoryData.slug = slug;
    }

    if (body.icon !== undefined) categoryData.icon = body.icon;
    if (body.color !== undefined) categoryData.color = body.color;
    if (body.is_active !== undefined) categoryData.is_active = body.is_active;
    if (body.sort_order !== undefined) {
      const sortOrder = Number.parseInt(String(body.sort_order), 10);
      if (!Number.isFinite(sortOrder)) {
        return NextResponse.json(
          { error: 'Sort order must be a number' },
          { status: 400 }
        );
      }
      categoryData.sort_order = sortOrder;
    }

    const { data, error } = await supabase
      .from('guide_categories')
      .update(categoryData)
      .eq('id', id)
      .select('*, guide_items(count)')
      .single();

    if (error) {
      if (isUniqueViolation(error)) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(mapCategory(data));
  } catch (error) {
    console.error('Error updating guide category:', error);
    return NextResponse.json(
      { error: 'Failed to update guide category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Guide category ID is required' },
        { status: 400 }
      );
    }

    const { count, error: countError } = await supabase
      .from('guide_items')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) throw countError;

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete this category because ${count} guide item${count === 1 ? '' : 's'} still ${count === 1 ? 'references' : 'reference'} it. Move or delete those items first.`,
        },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from('guide_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide category:', error);
    return NextResponse.json(
      { error: 'Failed to delete guide category' },
      { status: 500 }
    );
  }
}
