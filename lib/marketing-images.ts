/**
 * Static marketing / fallback images (optimized widths in /public/images).
 * Prefer 800w assets for cards; avoid 3840w sources in UI — Next still downloads full files for optimization.
 */
export const MARKETING_IMAGES = {
  mainHero: '/main-hero-image-2.png',
  stayWithUsHero: '/premium%20accommodation%20hero-2.jpeg',
  heroCapeTown: '/cpt-lions-head-1.jpg',
  coastalVilla: '/images/services-accommodation.jpg',
  safariLodge: '/images/services-experiences.jpg',
  wineEstate: '/images/services-exterior.jpg',
  gardenRoute: '/images/services-living.jpg',
  pricing: '/images/services-asset-management.jpg',
  premiumAccommodationTile: '/premium-accommodation-tile.jpeg',
  experiencesTile: '/experiences-tile.jpeg',
  assetManagementTile: '/asset-management-tile.jpeg',
  weKnowWhatYouWantTile: '/we-know-what-you-want-tile.jpeg',
} as const;

export const DEFAULT_PROPERTY_IMAGE = MARKETING_IMAGES.coastalVilla;
