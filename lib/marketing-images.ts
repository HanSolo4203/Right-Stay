import { MARKETING_IMAGE_DIMENSIONS } from '@/lib/marketing-image-blur';

/**
 * Static marketing / fallback images.
 * JPEG masters stay in /public/images. Full-bleed heroes load prebuilt WebP
 * srcsets (see HERO_IMAGE_SOURCES) so the VPS never AVIF-encodes them on request.
 *
 * Keep HERO_VARIANT_WIDTHS in sync with WIDTHS in scripts/optimize-marketing-images.mjs.
 */
export const MARKETING_IMAGES = {
  mainHero: '/images/hero-home.jpg',
  stayWithUsHero: '/images/hero-stay.jpg',
  heroCapeTown: '/images/hero-lions-head.jpg',
  propertyManagementHero: '/images/hero-host.jpg',
  contactHero: '/images/hero-contact.jpg',
  coastalVilla: '/images/services-accommodation.jpg',
  safariLodge: '/images/services-experiences.jpg',
  wineEstate: '/images/services-exterior.jpg',
  gardenRoute: '/images/services-living.jpg',
  pricing: '/images/services-asset-management.jpg',
  premiumAccommodationTile: '/images/tile-premium-accommodation.jpg',
  experiencesTile: '/images/tile-experiences.jpg',
  assetManagementTile: '/images/tile-asset-management.jpg',
  weKnowWhatYouWantTile: '/images/tile-we-know.jpg',
  testimonialRibbon: '/images/testimonial-ribbon-flow-brand.jpg',
} as const;

export type HeroImageSources = {
  src: string;
  srcSet: string;
};

/** Candidate widths; actual srcset is clipped to each JPEG master. */
export const HERO_VARIANT_WIDTHS = [800, 1280, 1920, 2560] as const;

function heroVariantWidths(masterWidth: number): number[] {
  const widths: number[] = HERO_VARIANT_WIDTHS.filter((width) => width < masterWidth);
  if (masterWidth >= 640) widths.push(masterWidth);
  return [...new Set(widths)].sort((a, b) => a - b);
}

function heroWebpSources(jpgSrc: string): HeroImageSources {
  const base = jpgSrc.replace(/\.jpe?g$/i, '');
  const masterWidth = MARKETING_IMAGE_DIMENSIONS[jpgSrc]?.width ?? 1920;
  const widths = heroVariantWidths(masterWidth);
  const fallback = [...widths].reverse().find((width) => width <= 1920) ?? widths[widths.length - 1];
  return {
    src: `${base}-${fallback}.webp`,
    srcSet: widths.map((width) => `${base}-${width}.webp ${width}w`).join(', '),
  };
}

const HERO_SOURCE_PATHS = [
  MARKETING_IMAGES.mainHero,
  MARKETING_IMAGES.stayWithUsHero,
  MARKETING_IMAGES.heroCapeTown,
  MARKETING_IMAGES.propertyManagementHero,
  MARKETING_IMAGES.contactHero,
  MARKETING_IMAGES.safariLodge,
  MARKETING_IMAGES.testimonialRibbon,
  '/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg',
] as const;

export const HERO_IMAGE_SOURCES: Record<string, HeroImageSources> = Object.fromEntries(
  HERO_SOURCE_PATHS.map((src) => [src, heroWebpSources(src)])
);

export const DEFAULT_PROPERTY_IMAGE = MARKETING_IMAGES.coastalVilla;

/** Crop focus per image: keep the subject in frame on tall mobile viewports. */
export const MARKETING_IMAGE_OBJECT_CLASS: Record<string, string> = {
  [MARKETING_IMAGES.mainHero]:
    'object-[62%_58%] sm:object-[55%_52%] lg:object-[52%_48%]',
  [MARKETING_IMAGES.stayWithUsHero]:
    'object-[48%_36%] sm:object-[center_40%] lg:object-[center_42%]',
  [MARKETING_IMAGES.propertyManagementHero]:
    'object-[84%_58%] sm:object-[76%_50%] lg:object-[70%_48%]',
  [MARKETING_IMAGES.contactHero]:
    'object-[38%_48%] sm:object-[42%_42%] lg:object-[40%_40%]',
  [MARKETING_IMAGES.coastalVilla]: 'object-[72%_58%] sm:object-[68%_55%]',
  [MARKETING_IMAGES.heroCapeTown]: 'object-[center_32%]',
  [MARKETING_IMAGES.premiumAccommodationTile]: 'object-[68%_center]',
};
