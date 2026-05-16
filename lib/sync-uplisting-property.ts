import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchUplistingProperty } from '@/lib/uplisting';

export type SyncPropertyResult = {
  property_id: string;
  property_name: string;
  photos_count: number;
  photos_in_uplisting_api: number;
  status: 'success' | 'error';
  error?: string;
};

function storagePathFromPublicUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/property-photos/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
}

async function removeUploadedStoragePhotos(
  supabase: SupabaseClient,
  propertyId: string
): Promise<void> {
  const { data: existingPhotos } = await supabase
    .from('property_photos')
    .select('url')
    .eq('property_id', propertyId);

  if (!existingPhotos?.length) return;

  const paths = existingPhotos
    .map((row) => storagePathFromPublicUrl(row.url))
    .filter((path): path is string => Boolean(path));

  if (paths.length === 0) return;

  const { error } = await supabase.storage.from('property-photos').remove(paths);
  if (error) {
    console.warn(`Could not remove old storage photos for ${propertyId}:`, error.message);
  }
}

/**
 * Sync a single property and its photos from Uplisting into the database.
 * Replaces all existing property_photos rows (including manual uploads).
 */
export async function syncSinglePropertyFromUplisting(
  supabase: SupabaseClient,
  propertyId: string
): Promise<SyncPropertyResult> {
  const { property: fullProperty, photos } = await fetchUplistingProperty(propertyId);
  const photosInApi =
    fullProperty.relationships?.photos?.data?.length ?? photos.length;

  const propertyData = {
    uplisting_id: propertyId,
    data: {
      id: fullProperty.id,
      type: fullProperty.type,
      attributes: fullProperty.attributes || {},
      relationships: fullProperty.relationships || {},
    },
    last_synced: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase
    .from('cached_properties')
    .upsert(propertyData, {
      onConflict: 'uplisting_id',
      ignoreDuplicates: false,
    });

  if (upsertError) {
    throw upsertError;
  }

  await removeUploadedStoragePhotos(supabase, propertyId);

  const { error: deleteError } = await supabase
    .from('property_photos')
    .delete()
    .eq('property_id', propertyId);

  if (deleteError) {
    throw deleteError;
  }

  let photosInserted = 0;
  if (photos.length > 0) {
    const photoRecords = photos.map((photo, index) => ({
      property_id: propertyId,
      photo_id: photo.id,
      url: photo.attributes.url,
      caption: photo.attributes.caption || null,
      position: photo.attributes.position ?? photo.attributes.order ?? index,
      is_primary: index === 0,
      width: photo.attributes.width || null,
      height: photo.attributes.height || null,
    }));

    const { error: insertError } = await supabase.from('property_photos').insert(photoRecords);

    if (insertError) {
      throw insertError;
    }

    photosInserted = photos.length;
  }

  return {
    property_id: propertyId,
    property_name:
      fullProperty.attributes?.name ||
      fullProperty.attributes?.nickname ||
      'Unnamed Property',
    photos_count: photosInserted,
    photos_in_uplisting_api: photosInApi,
    status: 'success',
  };
}

export function validateUplistingApiKey(): string | null {
  const apiKey = process.env.UPLISTING_API_KEY;
  if (!apiKey || apiKey === 'your_uplisting_api_key_here' || apiKey.trim() === '') {
    return 'UPLISTING_API_KEY is not configured. Add your API key to .env.local (Settings > Connect > API Key in Uplisting).';
  }
  return null;
}
