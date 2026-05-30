/**
 * Static marketing / fallback images (optimized widths in /public/images).
 * Prefer 800w assets for cards; avoid 3840w sources in UI — Next still downloads full files for optimization.
 */
export const MARKETING_IMAGES = {
  heroCapeTown: '/cpt-lions-head-1.jpg',
  coastalVilla: '/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg',
  safariLodge: '/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_800w_1.jpg',
  wineEstate: '/images/d953ad7f-2dd7-42f7-8f74-593d55181036_800w_1.jpg',
  gardenRoute: '/images/6b428a64-0de1-4837-bab2-9729ce2e28c2_800w_1.jpg',
  pricing: '/images/4ca8123b-2b44-4ef6-9ce7-51db6671104c_800w_1.jpg',
} as const;

export const DEFAULT_PROPERTY_IMAGE = MARKETING_IMAGES.coastalVilla;
