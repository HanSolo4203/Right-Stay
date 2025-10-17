/**
 * Unsplash API Service for Stock Images
 * Uses Unsplash's free API for high-quality property photos
 */

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  width: number;
  height: number;
  description: string | null;
  alt_description: string | null;
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/**
 * Get curated property/apartment photos from Unsplash
 * These are free to use with attribution
 */
export async function getStockPropertyPhotos(
  query: string = 'luxury apartment interior',
  count: number = 5
): Promise<UnsplashPhoto[]> {
  try {
    // Using Unsplash's public API endpoint
    // Note: For production, you should get an API key from unsplash.com/developers
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=demo`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data: UnsplashSearchResponse = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    // Return fallback to curated collection if API fails
    return [];
  }
}

/**
 * Get property-specific search terms based on property data
 */
export function getPropertySearchQuery(propertyData: any): string {
  const attributes = propertyData?.attributes || {};
  const name = attributes.name || attributes.nickname || '';
  const description = attributes.description || '';
  const propertyType = attributes.type || 'apartment';

  // Determine search query based on property characteristics
  if (name.toLowerCase().includes('penthouse')) {
    return 'luxury penthouse interior cape town';
  } else if (name.toLowerCase().includes('sea') || name.toLowerCase().includes('ocean')) {
    return 'luxury apartment ocean view';
  } else if (description.toLowerCase().includes('mountain')) {
    return 'luxury apartment mountain view';
  } else if (propertyType.toLowerCase() === 'villa') {
    return 'luxury villa interior';
  } else if (name.toLowerCase().includes('studio')) {
    return 'modern studio apartment interior';
  } else {
    return 'modern luxury apartment interior';
  }
}

/**
 * Local property photos from /public/images directory
 * These are the existing images on the site
 */
export const FALLBACK_PROPERTY_PHOTOS = [
  '/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg',
  '/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_3840w_1.jpg',
  '/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg',
  '/images/6b428a64-0de1-4837-bab2-9729ce2e28c2_3840w_1.jpg',
  '/images/4ca8123b-2b44-4ef6-9ce7-51db6671104c_800w_1.jpg',
  '/images/993d5154-c104-4507-8c0a-55364d2a948c_800w.jpg',
  '/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_3840w.jpg',
  '/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w.jpg',
  '/images/6b428a64-0de1-4837-bab2-9729ce2e28c2_3840w.jpg',
  '/images/4ca8123b-2b44-4ef6-9ce7-51db6671104c_800w.jpg',
];

