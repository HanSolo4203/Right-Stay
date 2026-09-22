import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PRICE_LEVELS = new Set(['free', '$', '$$', '$$$']);

const ITEM_SELECT =
  '*, category:guide_categories(id, name, slug, icon, color), photos:guide_item_photos(*)';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isUniqueViolation(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
  );
}

function uniqueViolationResponse(error: unknown) {
  const details =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message?: string }).message)
      : '';
  if (details.includes('google_place_id')) {
    return NextResponse.json(
      { error: 'Another place is already linked to this Google listing' },
      { status: 409 }
    );
  }
  return NextResponse.json(
    { error: 'A place with this slug already exists' },
    { status: 409 }
  );
}

function isForeignKeyViolation(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === '23503'
  );
}

function optionalText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

function mapItem(row: Record<string, unknown>) {
  const photos = Array.isArray(row.photos)
    ? [...(row.photos as Array<Record<string, unknown>>)].sort(
        (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
      )
    : [];
  const primary = photos.find((photo) => photo.is_primary) || photos[0] || null;

  return {
    ...row,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    tags: Array.isArray(row.tags) ? row.tags : [],
    photos,
    primary_photo_url: (primary?.url as string | undefined) ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    let query = supabase
      .from('guide_items')
      .select(ITEM_SELECT)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json((data || []).map(mapItem));
  } catch (error) {
    console.error('Error fetching guide items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const slug = slugify(typeof body.slug === 'string' && body.slug.trim() ? body.slug : name);
    const categoryId = typeof body.category_id === 'string' ? body.category_id.trim() : '';
    const shortDescription =
      typeof body.short_description === 'string' ? body.short_description.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const latitude = parseCoordinate(body.latitude);
    const longitude = parseCoordinate(body.longitude);

    if (!name) {
      return NextResponse.json({ error: 'Place name is required' }, { status: 400 });
    }
    if (!slug) {
      return NextResponse.json({ error: 'Place slug is required' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!shortDescription) {
      return NextResponse.json({ error: 'Short description is required' }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    if (latitude == null || longitude == null) {
      return NextResponse.json(
        { error: 'Drop a pin on the map to set the place location' },
        { status: 400 }
      );
    }

    const priceLevel = body.price_level ?? '$$';
    if (priceLevel != null && !PRICE_LEVELS.has(priceLevel)) {
      return NextResponse.json(
        { error: 'Price level must be free, $, $$, or $$$' },
        { status: 400 }
      );
    }

    let sortOrder = Number.parseInt(String(body.sort_order ?? ''), 10);
    if (!Number.isFinite(sortOrder)) {
      const { data: lastItem } = await supabase
        .from('guide_items')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      sortOrder = (lastItem?.sort_order ?? -1) + 1;
    }

    const itemData = {
      category_id: categoryId,
      name,
      slug,
      short_description: shortDescription,
      description,
      address: optionalText(body.address),
      latitude,
      longitude,
      price_level: priceLevel,
      website_url: optionalText(body.website_url),
      booking_url: optionalText(body.booking_url),
      phone: optionalText(body.phone),
      tags: parseTags(body.tags),
      is_featured: body.is_featured !== undefined ? Boolean(body.is_featured) : false,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
      sort_order: sortOrder,
      google_place_id: optionalText(body.google_place_id),
    };

    const { data, error } = await supabase
      .from('guide_items')
      .insert([itemData])
      .select(ITEM_SELECT)
      .single();

    if (error) {
      if (isUniqueViolation(error)) {
        return uniqueViolationResponse(error);
      }
      if (isForeignKeyViolation(error)) {
        return NextResponse.json({ error: 'Selected category was not found' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(mapItem(data));
  } catch (error) {
    console.error('Error creating guide item:', error);
    return NextResponse.json(
      { error: 'Failed to create guide item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Guide item ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const itemData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!name) {
        return NextResponse.json({ error: 'Place name is required' }, { status: 400 });
      }
      itemData.name = name;
    }

    if (body.slug !== undefined) {
      const slug = slugify(typeof body.slug === 'string' ? body.slug : '');
      if (!slug) {
        return NextResponse.json({ error: 'Place slug is required' }, { status: 400 });
      }
      itemData.slug = slug;
    }

    if (body.category_id !== undefined) {
      const categoryId = typeof body.category_id === 'string' ? body.category_id.trim() : '';
      if (!categoryId) {
        return NextResponse.json({ error: 'Category is required' }, { status: 400 });
      }
      itemData.category_id = categoryId;
    }

    if (body.short_description !== undefined) {
      const shortDescription =
        typeof body.short_description === 'string' ? body.short_description.trim() : '';
      if (!shortDescription) {
        return NextResponse.json({ error: 'Short description is required' }, { status: 400 });
      }
      itemData.short_description = shortDescription;
    }

    if (body.description !== undefined) {
      const description = typeof body.description === 'string' ? body.description.trim() : '';
      if (!description) {
        return NextResponse.json({ error: 'Description is required' }, { status: 400 });
      }
      itemData.description = description;
    }

    if (body.address !== undefined) itemData.address = optionalText(body.address);
    if (body.website_url !== undefined) itemData.website_url = optionalText(body.website_url);
    if (body.booking_url !== undefined) itemData.booking_url = optionalText(body.booking_url);
    if (body.phone !== undefined) itemData.phone = optionalText(body.phone);
    if (body.google_place_id !== undefined) {
      itemData.google_place_id = optionalText(body.google_place_id);
    }
    if (body.tags !== undefined) itemData.tags = parseTags(body.tags);
    if (body.is_featured !== undefined) itemData.is_featured = Boolean(body.is_featured);
    if (body.is_active !== undefined) itemData.is_active = Boolean(body.is_active);

    if (body.latitude !== undefined || body.longitude !== undefined) {
      const latitude = parseCoordinate(body.latitude);
      const longitude = parseCoordinate(body.longitude);
      if (latitude == null || longitude == null) {
        return NextResponse.json(
          { error: 'Drop a pin on the map to set the place location' },
          { status: 400 }
        );
      }
      itemData.latitude = latitude;
      itemData.longitude = longitude;
    }

    if (body.price_level !== undefined) {
      if (body.price_level != null && !PRICE_LEVELS.has(body.price_level)) {
        return NextResponse.json(
          { error: 'Price level must be free, $, $$, or $$$' },
          { status: 400 }
        );
      }
      itemData.price_level = body.price_level;
    }

    if (body.sort_order !== undefined) {
      const sortOrder = Number.parseInt(String(body.sort_order), 10);
      if (!Number.isFinite(sortOrder)) {
        return NextResponse.json({ error: 'Sort order must be a number' }, { status: 400 });
      }
      itemData.sort_order = sortOrder;
    }

    const { data, error } = await supabase
      .from('guide_items')
      .update(itemData)
      .eq('id', id)
      .select(ITEM_SELECT)
      .single();

    if (error) {
      if (isUniqueViolation(error)) {
        return uniqueViolationResponse(error);
      }
      if (isForeignKeyViolation(error)) {
        return NextResponse.json({ error: 'Selected category was not found' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json(mapItem(data));
  } catch (error) {
    console.error('Error updating guide item:', error);
    return NextResponse.json(
      { error: 'Failed to update guide item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Guide item ID is required' }, { status: 400 });
    }

    const { data: photos } = await supabase
      .from('guide_item_photos')
      .select('storage_path')
      .eq('guide_item_id', id);

    const paths = (photos || [])
      .map((photo) => photo.storage_path)
      .filter((path): path is string => Boolean(path));

    if (paths.length > 0) {
      await supabase.storage.from('guide-photos').remove(paths);
    }

    const { error } = await supabase.from('guide_items').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting guide item:', error);
    return NextResponse.json(
      { error: 'Failed to delete guide item' },
      { status: 500 }
    );
  }
}
