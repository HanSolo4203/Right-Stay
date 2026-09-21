'use client';

import Image, { type ImageProps } from 'next/image';
import { useLayoutEffect, useRef, useState } from 'react';
import { IMAGE_SIZES } from '@/lib/image-sizes';
import { MARKETING_IMAGE_BLUR } from '@/lib/marketing-image-blur';
import { HERO_IMAGE_SOURCES, MARKETING_IMAGE_OBJECT_CLASS } from '@/lib/marketing-images';
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
 * Prebuilt WebP srcsets skip `/_next/image` so the photo is not AVIF-encoded on the VPS.
 */
export default function HeroBackgroundImage({
  alt = '',
  priority = false,
  className,
  src,
  quality,
  placeholder,
  blurDataURL,
  style,
  onLoad,
  ...props
}: HeroBackgroundImageProps) {
  const srcKey = typeof src === 'string' ? src : '';
  const sources = srcKey ? HERO_IMAGE_SOURCES[srcKey] : undefined;
  const blur = blurDataURL ?? MARKETING_IMAGE_BLUR[srcKey];
  const focusClass = MARKETING_IMAGE_OBJECT_CLASS[srcKey];
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const sizes = priority ? IMAGE_SIZES.heroLcp : IMAGE_SIZES.hero;

  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [srcKey]);

  const markLoaded = () => setLoaded(true);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#121816]" style={style}>
      {priority && sources ? (
        <link
          rel="preload"
          as="image"
          href={sources.src}
          imageSrcSet={sources.srcSet}
          imageSizes={sizes}
          fetchPriority="high"
        />
      ) : null}

      {blur ? (
        <img
          src={blur}
          alt=""
          aria-hidden
          className={cn(
            'hero-photo-lqip pointer-events-none absolute inset-0 h-full w-full object-cover',
            focusClass
          )}
        />
      ) : null}

      {sources ? (
        <img
          ref={imgRef}
          src={sources.src}
          srcSet={sources.srcSet}
          sizes={sizes}
          alt={alt}
          fetchPriority={priority ? 'high' : 'low'}
          decoding="async"
          onLoad={(event) => {
            markLoaded();
            onLoad?.(event);
          }}
          className={cn(
            'hero-photo pointer-events-none absolute inset-0 h-full w-full object-cover',
            loaded && 'is-loaded',
            focusClass,
            className
          )}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          fetchPriority={priority ? 'high' : 'low'}
          quality={quality ?? (priority ? 78 : 72)}
          placeholder={placeholder ?? (blur ? 'blur' : undefined)}
          blurDataURL={blur}
          onLoad={(event) => {
            markLoaded();
            onLoad?.(event);
          }}
          className={cn(
            'hero-photo pointer-events-none object-cover',
            loaded && 'is-loaded',
            focusClass,
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}
