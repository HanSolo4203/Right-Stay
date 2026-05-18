import Image, { type ImageProps } from 'next/image';
import { IMAGE_SIZES } from '@/lib/image-sizes';

type HeroBackgroundImageProps = Omit<
  ImageProps,
  'fill' | 'sizes' | 'priority' | 'alt' | 'width' | 'height'
> & {
  alt?: string;
  /** Only true for the single LCP hero on the homepage. */
  priority?: boolean;
};

/**
 * Full-bleed hero background. Parent must be `position: relative` with a min-height.
 */
export default function HeroBackgroundImage({
  alt = '',
  priority = false,
  className = 'pointer-events-none object-cover',
  ...props
}: HeroBackgroundImageProps) {
  return (
    <Image
      alt={alt}
      fill
      sizes={priority ? IMAGE_SIZES.heroLcp : IMAGE_SIZES.hero}
      priority={priority}
      fetchPriority={priority ? 'high' : 'low'}
      className={className}
      {...props}
    />
  );
}
