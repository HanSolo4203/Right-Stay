import Image, { type ImageProps } from 'next/image';
import { MARKETING_IMAGE_BLUR } from '@/lib/marketing-image-blur';
import { MARKETING_IMAGE_OBJECT_CLASS } from '@/lib/marketing-images';
import { cn } from '@/lib/utils';

type MarketingImageProps = ImageProps;

/**
 * next/image wrapper for static marketing photos: blur LQIP, quality, and crop focus.
 */
export default function MarketingImage({
  src,
  quality,
  placeholder,
  blurDataURL,
  className,
  ...props
}: MarketingImageProps) {
  const srcKey = typeof src === 'string' ? src : '';
  const blur = blurDataURL ?? MARKETING_IMAGE_BLUR[srcKey];
  const focusClass = MARKETING_IMAGE_OBJECT_CLASS[srcKey];

  return (
    <Image
      src={src}
      quality={quality ?? 80}
      placeholder={placeholder ?? (blur ? 'blur' : undefined)}
      blurDataURL={blurDataURL ?? blur}
      className={cn(focusClass, className)}
      {...props}
    />
  );
}
