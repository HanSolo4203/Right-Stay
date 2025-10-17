/**
 * Uplisting API Service
 * Handles all interactions with the Uplisting API
 * Documentation: https://support.uplisting.io/docs/api
 */

const UPLISTING_API_BASE_URL = 'https://connect.uplisting.io';

interface UplistingPhoto {
  id: string;
  type: string;
  attributes: {
    caption?: string;
    position?: number;
    url: string;
    width?: number;
    height?: number;
  };
}

interface UplistingProperty {
  id: string;
  type: string;
  attributes: {
    name?: string;
    nickname?: string;
    [key: string]: any;
  };
  relationships?: {
    photos?: {
      data?: Array<{ id: string; type: string }>;
    };
  };
}

interface UplistingApiResponse<T> {
  data: T;
  included?: any[];
}

/**
 * Fetches all properties from Uplisting API
 */
export async function fetchUplistingProperties(): Promise<UplistingProperty[]> {
  const apiKey = process.env.UPLISTING_API_KEY;
  
  if (!apiKey) {
    throw new Error('UPLISTING_API_KEY is not configured');
  }

  const response = await fetch(`${UPLISTING_API_BASE_URL}/properties`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Uplisting API error: ${response.status} ${response.statusText}`);
  }

  const result: UplistingApiResponse<UplistingProperty[]> = await response.json();
  return result.data;
}

/**
 * Fetches a single property with all its details including photos
 */
export async function fetchUplistingProperty(propertyId: string): Promise<{
  property: UplistingProperty;
  photos: UplistingPhoto[];
}> {
  const apiKey = process.env.UPLISTING_API_KEY;
  
  if (!apiKey) {
    throw new Error('UPLISTING_API_KEY is not configured');
  }

  const response = await fetch(
    `${UPLISTING_API_BASE_URL}/properties/${propertyId}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Uplisting API error: ${response.status} ${response.statusText}`);
  }

  const result: UplistingApiResponse<UplistingProperty> = await response.json();
  
  // Extract photos from included data
  const photos: UplistingPhoto[] = [];
  if (result.included) {
    for (const item of result.included) {
      if (item.type === 'photos') {
        photos.push(item as UplistingPhoto);
      }
    }
  }

  // Sort photos by position
  photos.sort((a, b) => {
    const posA = a.attributes.position ?? 999;
    const posB = b.attributes.position ?? 999;
    return posA - posB;
  });

  return {
    property: result.data,
    photos,
  };
}

/**
 * Fetches photos for multiple properties
 */
export async function fetchPhotosForProperties(propertyIds: string[]): Promise<Map<string, UplistingPhoto[]>> {
  const photosByProperty = new Map<string, UplistingPhoto[]>();

  // Fetch photos for each property
  for (const propertyId of propertyIds) {
    try {
      const { photos } = await fetchUplistingProperty(propertyId);
      photosByProperty.set(propertyId, photos);
    } catch (error) {
      console.error(`Error fetching photos for property ${propertyId}:`, error);
      photosByProperty.set(propertyId, []);
    }
  }

  return photosByProperty;
}

