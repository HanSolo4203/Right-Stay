import Image, { type ImageProps } from 'next/image';
import { IMAGE_SIZES } from '@/lib/image-sizes';
import { MARKETING_IMAGE_BLUR } from '@/lib/marketing-image-blur';
import { MARKETING_IMAGE_OBJECT_CLASS } from '@/lib/marketing-images';
import { cn } from '@/lib/utils';

type HeroBackgroundImageProps = Omit<
  ImageProps,
  'fill' | 'sizes' | 'priority' | 'alt' | 'width' | 'height'
> & {
  alt?: string;
  /** True for the LCP hero on the current page. */
  priority?: boolean;
};

/**
 * Full-bleed hero background. Parent must be `position: relative` with a min-height.
 */
export default function HeroBackgroundImage({
  alt = '',
  priority = false,
  className,
  src,
  quality,
  placeholder,
  blurDataURL,
  ...props
}: HeroBackgroundImageProps) {
  const srcKey = typeof src === 'string' ? src : '';
  const blur = blurDataURL ?? MARKETING_IMAGE_BLUR[srcKey];
  const focusClass = MARKETING_IMAGE_OBJECT_CLASS[srcKey];

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={priority ? IMAGE_SIZES.heroLcp : IMAGE_SIZES.hero}
      priority={priority}
      fetchPriority={priority ? 'high' : 'low'}
      quality={quality ?? (priority ? 85 : 78)}
      placeholder={placeholder ?? (blur ? 'blur' : undefined)}
      blurDataURL={blurDataURL ?? blur}
      className={cn('pointer-events-none object-cover', focusClass, className)}
      {...props}
    />
  );
}
