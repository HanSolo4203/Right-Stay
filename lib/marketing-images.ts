/**
 * Static marketing / fallback images.
 * Sources are pre-sized JPEGs (max 2560w for heroes, 1600w for cards) so Next
 * can transcode to AVIF/WebP quickly without decoding huge originals.
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
