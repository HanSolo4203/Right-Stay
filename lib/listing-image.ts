/**
 * When NEXT_PUBLIC_USE_SUPABASE_IMAGE_TRANSFORM=true and your Supabase project has
 * Storage image transformations enabled (Pro+), URLs are rewritten to the render
 * endpoint so the CDN serves resized WebP. Otherwise full URLs are returned and
 * next/image handles resizing (requires images.unoptimized = false).
 */
export type ListingImageVariant =
  | 'card'
  | 'thumbnail'
  | 'modalMain'
  | 'modalTile'
  | 'lightbox';

type Preset = {
  maxWidth: number;
  quality: number;
  resize: 'cover' | 'contain';
  /** Supabase/imgproxy: `contain` should set both dimensions for reliable output */
  maxHeight?: number;
};

const PRESETS: Record<ListingImageVariant, Preset> = {
  card: { maxWidth: 960, quality: 78, resize: 'cover' },
  thumbnail: { maxWidth: 220, quality: 70, resize: 'cover' },
  modalMain: { maxWidth: 1280, quality: 78, resize: 'cover' },
  modalTile: { maxWidth: 640, quality: 72, resize: 'cover' },
  // Match lightbox stage (aspect-video); both width+height avoids bad/empty transforms with resize=contain
  lightbox: { maxWidth: 1600, maxHeight: 900, quality: 78, resize: 'contain' },
};

export function listingImageSrc(
  src: string | undefined | null,
  variant: ListingImageVariant = 'card'
): string {
  if (!src) return '';

  const { maxWidth, maxHeight, quality, resize } = PRESETS[variant];

  if (!src.startsWith('http')) return src;

  const enabled = process.env.NEXT_PUBLIC_USE_SUPABASE_IMAGE_TRANSFORM === 'true';
  if (!enabled) return src;

  try {
    const u = new URL(src);
    if (!u.hostname.endsWith('.supabase.co')) return src;
    if (!u.pathname.includes('/storage/v1/object/public/')) return src;

    u.pathname = u.pathname.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    );
    u.search = '';
    u.searchParams.set('width', String(maxWidth));
    if (maxHeight != null) {
      u.searchParams.set('height', String(maxHeight));
    }
    u.searchParams.set('quality', String(quality));
    u.searchParams.set('resize', resize);
    return u.toString();
  } catch {
    return src;
  }
}
