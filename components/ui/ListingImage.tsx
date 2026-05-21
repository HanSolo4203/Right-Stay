'use client';

import Image, { type ImageProps } from 'next/image';
import {
  listingImageSrc,
  shouldBypassImageOptimizer,
  type ListingImageVariant,
} from '@/lib/listing-image';
import { IMAGE_SIZES } from '@/lib/image-sizes';

const VARIANT_SIZES: Record<ListingImageVariant, string> = {
  card: IMAGE_SIZES.card,
  thumbnail: IMAGE_SIZES.cardThumb,
  modalMain: IMAGE_SIZES.modalMain,
  modalTile: IMAGE_SIZES.modalTile,
  lightbox: IMAGE_SIZES.lightbox,
};

const VARIANT_QUALITY: Partial<Record<ListingImageVariant, number>> = {
  card: 78,
  thumbnail: 68,
  modalMain: 78,
  modalTile: 72,
  lightbox: 78,
};

type ListingImageProps = Omit<ImageProps, 'src' | 'sizes'> & {
  src: string;
  variant?: ListingImageVariant;
  sizes?: string;
  rawSrc?: boolean;
};

/**
 * Property listing photo with Supabase transform + CloudFront bypass when needed.
 */
export default function ListingImage({
  src,
  variant = 'card',
  sizes,
  quality,
  priority = false,
  rawSrc = false,
  alt = '',
  ...props
}: ListingImageProps) {
  const displaySrc = rawSrc ? src : listingImageSrc(src, variant);
  const resolvedQuality = quality ?? VARIANT_QUALITY[variant];

  return (
    <Image
      src={displaySrc}
      alt={alt}
      sizes={sizes ?? VARIANT_SIZES[variant]}
      quality={resolvedQuality}
      priority={priority}
      fetchPriority={priority ? 'high' : undefined}
      unoptimized={shouldBypassImageOptimizer(src)}
      {...props}
    />
  );
}
