import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import {
  assertPublicImageUrl,
  PageImageError,
  scrapePageImages,
} from '@/lib/scrape-page-images';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const MAX_IMPORTED_PHOTOS = 3;
const MAX_IMAGE_BYTES = 8_000_000;
const MIN_IMAGE_BYTES = 12_000;
const IMAGE_TIMEOUT_MS = 15_000;
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

export type ImportWebsitePhotosResult = {
  importedPhotos: number;
  skippedPhotos: number;
};

function photoKey(identity: string) {
  const hash = createHash('sha256').update(identity).digest('hex').slice(0, 40);
  return `web:${hash}`;
}

function sniffImage(buffer: Buffer, contentType: string) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { contentType: 'image/jpeg', extension: 'jpg' };
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { contentType: 'image/png', extension: 'png' };
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { contentType: 'image/webp', extension: 'webp' };
  }
  if (buffer.length >= 6 && buffer.toString('ascii', 0, 3) === 'GIF') {
    return { contentType: 'image/gif', extension: 'gif' };
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12);
    if (brand === 'avif' || brand === 'avis') {
      return { contentType: 'image/avif', extension: 'avif' };
    }
  }
  if (contentType.startsWith('image/') && !contentType.includes('svg')) {
    const extension = contentType.includes('png')
      ? 'png'
      : contentType.includes('webp')
        ? 'webp'
        : contentType.includes('gif')
          ? 'gif'
          : 'jpg';
    return { contentType, extension };
  }
  return null;
}

async function readLimited(response: Response, maxBytes: number) {
  const declared = Number(response.headers.get('content-length') || 0);
  if (declared > maxBytes) return null;

  const reader = response.body?.getReader();
  if (!reader) {
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.length > maxBytes ? null : buffer;
  }

  const chunks: Buffer[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

async function downloadImage(imageUrl: string, pageUrl: string) {
  let current = (await assertPublicImageUrl(imageUrl)).toString();

  for (let hop = 0; hop < 4; hop += 1) {
    const response = await fetch(current, {
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS),
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: pageUrl,
      },
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) return null;
      current = (await assertPublicImageUrl(new URL(location, current).toString())).toString();
      continue;
    }
    if (!response.ok) return null;

    const buffer = await readLimited(response, MAX_IMAGE_BYTES);
    if (!buffer || buffer.length < MIN_IMAGE_BYTES) return null;
    const sniffed = sniffImage(buffer, (response.headers.get('content-type') || '').toLowerCase());
    if (!sniffed) return null;
    return { buffer, ...sniffed };
  }

  return null;
}

export async function importWebsitePhotosForItem(
  guideItemId: string,
  pageUrl: string
): Promise<ImportWebsitePhotosResult> {
  const trimmed = pageUrl.trim();
  if (!trimmed) {
    throw new PageImageError('Add a Website URL first.');
  }

  const { data: item, error: itemError } = await supabase
    .from('guide_items')
    .select('id')
    .eq('id', guideItemId)
    .single();

  if (itemError || !item) {
    throw new Error('Guide item not found');
  }

  const candidates = await scrapePageImages(trimmed, 8);
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
    (existingPhotos || []).reduce((max, photo) => Math.max(max, Number(photo.sort_order ?? 0)), -1) + 1;
  const hasPrimary = (existingPhotos || []).some((photo) => photo.is_primary);

  let importedPhotos = 0;
  let skippedPhotos = 0;

  for (const candidate of candidates) {
    if (importedPhotos >= MAX_IMPORTED_PHOTOS) break;
    const storedKey = photoKey(candidate.key);
    if (existingKeys.has(storedKey)) {
      skippedPhotos += 1;
      continue;
    }

    const file = await downloadImage(candidate.url, trimmed).catch(() => null);
    if (!file) {
      skippedPhotos += 1;
      continue;
    }

    const filePath = `${guideItemId}/web-${Date.now()}-${importedPhotos}.${file.extension}`;
    const { error: uploadError } = await supabase.storage.from('guide-photos').upload(filePath, file.buffer, {
      contentType: file.contentType,
      upsert: false,
    });

    if (uploadError) {
      console.error('Website photo upload failed:', uploadError);
      skippedPhotos += 1;
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('guide-photos').getPublicUrl(filePath);

    const { error: insertError } = await supabase.from('guide_item_photos').insert({
      guide_item_id: guideItemId,
      storage_path: filePath,
      url: publicUrl,
      is_primary: !hasPrimary && importedPhotos === 0,
      sort_order: nextSort,
      google_photo_name: storedKey,
    });

    if (insertError) {
      await supabase.storage.from('guide-photos').remove([filePath]);
      if (insertError.code === '23505') {
        skippedPhotos += 1;
        existingKeys.add(storedKey);
        continue;
      }
      throw insertError;
    }

    existingKeys.add(storedKey);
    importedPhotos += 1;
    nextSort += 1;
  }

  if (importedPhotos === 0) {
    throw new PageImageError(
      skippedPhotos > 0
        ? 'Those website photos are already imported, or the page did not offer downloadable images.'
        : 'No downloadable photos were found on that page.'
    );
  }

  return { importedPhotos, skippedPhotos };
}
