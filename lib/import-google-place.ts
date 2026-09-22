import { createClient } from '@supabase/supabase-js';
import {
  downloadGooglePlacePhoto,
  fetchGooglePlaceProfile,
  searchGooglePlaceProfile,
  type GooglePlaceProfile,
} from '@/lib/google-place-profile';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ITEM_SELECT =
  '*, category:guide_categories(id, name, slug, icon, color), photos:guide_item_photos(*)';

export type ImportGooglePlaceResult = {
  item: Record<string, unknown>;
  importedPhotos: number;
  skippedPhotos: number;
  profile: GooglePlaceProfile;
};

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

async function loadItem(guideItemId: string) {
  const { data, error } = await supabase
    .from('guide_items')
    .select('id, name, address, short_description, description, website_url, phone, google_place_id')
    .eq('id', guideItemId)
    .single();

  if (error || !data) {
    throw new Error('Guide item not found');
  }
  return data;
}

async function resolveProfile(
  item: Awaited<ReturnType<typeof loadItem>>,
  placeId?: string | null
): Promise<GooglePlaceProfile> {
  const explicitId = placeId?.trim() || item.google_place_id?.trim() || '';
  if (explicitId) {
    const profile = await fetchGooglePlaceProfile(explicitId);
    if (profile) return profile;
  }

  const query = [item.name, item.address].filter(Boolean).join(' ');
  const searched = await searchGooglePlaceProfile(query);
  if (!searched) {
    throw new Error('Could not find this place on Google.');
  }
  return searched;
}

export async function importGooglePlaceForItem(
  guideItemId: string,
  options: { placeId?: string | null; overwriteCopy?: boolean } = {}
): Promise<ImportGooglePlaceResult> {
  const item = await loadItem(guideItemId);
  const profile = await resolveProfile(item, options.placeId);
  const overwriteCopy = Boolean(options.overwriteCopy);

  const updates: Record<string, unknown> = {
    google_place_id: profile.googlePlaceId,
    google_synced_at: new Date().toISOString(),
  };

  if (profile.address && (overwriteCopy || !item.address)) {
    updates.address = profile.address;
  }
  if (profile.websiteUrl && (overwriteCopy || !item.website_url)) {
    updates.website_url = profile.websiteUrl;
  }
  if (profile.phone && (overwriteCopy || !item.phone)) {
    updates.phone = profile.phone;
  }
  if (profile.shortDescription && (overwriteCopy || !item.short_description)) {
    updates.short_description = profile.shortDescription;
  }
  if (profile.description && (overwriteCopy || !item.description)) {
    updates.description = profile.description;
  }

  const { error: updateError } = await supabase
    .from('guide_items')
    .update(updates)
    .eq('id', guideItemId);

  if (updateError) {
    if (updateError.code === '23505') {
      throw new Error('Another place is already linked to this Google listing.');
    }
    throw updateError;
  }

  const { data: existingPhotos, error: photosError } = await supabase
    .from('guide_item_photos')
    .select('id, google_photo_name, sort_order, is_primary')
    .eq('guide_item_id', guideItemId)
    .order('sort_order', { ascending: true });

  if (photosError) throw photosError;

  const existingKeys = new Set(
    (existingPhotos || [])
      .map((photo) => photo.google_photo_name)
      .filter((name): name is string => Boolean(name))
  );
  let nextSort =
    (existingPhotos || []).reduce((max, photo) => Math.max(max, Number(photo.sort_order ?? 0)), -1) +
    1;
  const hasPrimary = (existingPhotos || []).some((photo) => photo.is_primary);
  let importedPhotos = 0;
  let skippedPhotos = 0;

  for (const [index, photo] of profile.photos.entries()) {
    if (existingKeys.has(photo.key)) {
      skippedPhotos += 1;
      continue;
    }

    const downloaded = await downloadGooglePlacePhoto(photo.name);
    if (!downloaded) {
      skippedPhotos += 1;
      continue;
    }

    const filePath = `${guideItemId}/google-${Date.now()}-${index}.${downloaded.extension}`;
    const { error: uploadError } = await supabase.storage
      .from('guide-photos')
      .upload(filePath, downloaded.buffer, {
        contentType: downloaded.contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Google place photo upload failed:', uploadError);
      skippedPhotos += 1;
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('guide-photos').getPublicUrl(filePath);

    const makePrimary = !hasPrimary && importedPhotos === 0;
    const { error: insertError } = await supabase.from('guide_item_photos').insert({
      guide_item_id: guideItemId,
      storage_path: filePath,
      url: publicUrl,
      is_primary: makePrimary,
      sort_order: nextSort,
      google_photo_name: photo.key,
    });

    if (insertError) {
      await supabase.storage.from('guide-photos').remove([filePath]);
      if (insertError.code === '23505') {
        skippedPhotos += 1;
        continue;
      }
      throw insertError;
    }

    importedPhotos += 1;
    nextSort += 1;
  }

  const { data: refreshed, error: refreshError } = await supabase
    .from('guide_items')
    .select(ITEM_SELECT)
    .eq('id', guideItemId)
    .single();

  if (refreshError || !refreshed) {
    throw refreshError || new Error('Failed to reload place after Google import');
  }

  return {
    item: mapItem(refreshed),
    importedPhotos,
    skippedPhotos,
    profile,
  };
}
