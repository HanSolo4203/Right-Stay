/**
 * Uplisting API Service
 * Handles all interactions with the Uplisting API
 * Documentation: https://support.uplisting.io/docs/api
 */

const UPLISTING_API_BASE_URL = 'https://connect.uplisting.io';

/** Uplisting uses HTTP Basic auth with the raw API key Base64-encoded (not Bearer). */
function uplistingRequestHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Basic ${Buffer.from(apiKey).toString('base64')}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

function resolveUplistingApiKey(): string {
  let apiKey = process.env.UPLISTING_API_KEY;

  if (!apiKey) {
    throw new Error('UPLISTING_API_KEY is not configured. Please add it to your .env.local file.');
  }

  apiKey = apiKey.trim();

  if (apiKey === 'your_uplisting_api_key_here' || apiKey === '') {
    throw new Error(
      'UPLISTING_API_KEY is set to placeholder value. Please add your actual API key from Uplisting Settings > Connect > API Key.'
    );
  }

  return apiKey;
}

export interface UplistingPhoto {
  id: string;
  type: string;
  attributes: {
    caption?: string;
    position?: number;
    order?: number;
    url: string;
    width?: number;
    height?: number;
  };
}

export interface UplistingProperty {
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
      links?: { related?: string; next?: string };
    };
    [key: string]: unknown;
  };
}

interface UplistingApiResponse<T> {
  data: T;
  included?: UplistingPhoto[];
  links?: { next?: string };
  meta?: Record<string, unknown>;
}

function sortUplistingPhotos(photos: UplistingPhoto[]): UplistingPhoto[] {
  return [...photos].sort((a, b) => {
    const posA = a.attributes.position ?? a.attributes.order ?? 999;
    const posB = b.attributes.position ?? b.attributes.order ?? 999;
    return posA - posB;
  });
}

function buildPhotoLookup(included: UplistingPhoto[] | undefined): Map<string, UplistingPhoto> {
  const lookup = new Map<string, UplistingPhoto>();
  for (const item of included || []) {
    if (item.type === 'photos') {
      lookup.set(item.id, item);
    }
  }
  return lookup;
}

/**
 * Resolve photos for a property using relationship IDs and compound-document included data.
 */
export function resolvePhotosForProperty(
  property: UplistingProperty,
  included: UplistingPhoto[] | undefined
): UplistingPhoto[] {
  const photoRefs = property.relationships?.photos?.data || [];
  if (photoRefs.length === 0) {
    return [];
  }

  const lookup = buildPhotoLookup(included);
  const photos: UplistingPhoto[] = [];

  for (const ref of photoRefs) {
    const photo = lookup.get(ref.id);
    if (photo?.attributes?.url) {
      photos.push(photo);
    }
  }

  return sortUplistingPhotos(photos);
}

async function fetchUplistingJson<T>(path: string): Promise<UplistingApiResponse<T>> {
  const apiKey = resolveUplistingApiKey();
  const response = await fetch(`${UPLISTING_API_BASE_URL}${path}`, {
    headers: uplistingRequestHeaders(apiKey),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Uplisting API error: ${response.status} ${response.statusText}${
        errorText && errorText.length < 200 ? ` — ${errorText}` : ''
      }`
    );
  }

  return response.json();
}

/**
 * Loads all properties (paginated) with photos included in the compound document.
 */
async function fetchAllPropertiesWithPhotos(): Promise<{
  properties: UplistingProperty[];
  included: UplistingPhoto[];
}> {
  const properties: UplistingProperty[] = [];
  const included: UplistingPhoto[] = [];
  let page = 1;
  const maxPages = 50;

  while (page <= maxPages) {
    const result = await fetchUplistingJson<UplistingProperty[]>(
      `/properties?include=photos&page[number]=${page}&page[size]=100`
    );

    if (Array.isArray(result.data)) {
      properties.push(...result.data);
    }

    for (const item of result.included || []) {
      if (item.type === 'photos') {
        included.push(item);
      }
    }

    if (!result.links?.next) {
      break;
    }
    page++;
  }

  return { properties, included };
}

async function enrichPhotosFromAccountList(
  propertyId: string,
  property: UplistingProperty,
  photos: UplistingPhoto[]
): Promise<UplistingPhoto[]> {
  const refCount = property.relationships?.photos?.data?.length ?? 0;
  if (photos.length >= refCount && photos.length > 0) {
    return photos;
  }

  const { properties, included } = await fetchAllPropertiesWithPhotos();
  const fromList = properties.find((p) => p.id === propertyId);
  if (!fromList) {
    return photos;
  }

  const listPhotos = resolvePhotosForProperty(fromList, included);
  return listPhotos.length > photos.length ? listPhotos : photos;
}

/**
 * Fetches every photo Uplisting exposes for a property via the Partner API.
 */
export async function fetchUplistingPropertyPhotos(
  propertyId: string
): Promise<UplistingPhoto[]> {
  const single = await fetchUplistingJson<UplistingProperty>(
    `/properties/${propertyId}?include=photos`
  );

  if (!single.data) {
    throw new Error('Uplisting API returned invalid response format.');
  }

  const photos = resolvePhotosForProperty(single.data, single.included);
  return enrichPhotosFromAccountList(propertyId, single.data, photos);
}

/**
 * Fetches all properties from Uplisting API
 */
export async function fetchUplistingProperties(): Promise<UplistingProperty[]> {
  const apiKey = resolveUplistingApiKey();

  // Log API key length for debugging (first 8 chars only for security)
  console.log(`[Uplisting API] Using API key: ${apiKey.substring(0, 8)}... (length: ${apiKey.length})`);

  try {
    const response = await fetch(`${UPLISTING_API_BASE_URL}/properties`, {
      headers: uplistingRequestHeaders(apiKey),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = `Uplisting API error: ${response.status} ${response.statusText}`;
      
      // Provide more specific error messages
      if (response.status === 401) {
        errorMessage = 'Invalid Uplisting API key or API access not enabled. Please: 1) Regenerate your API key in Settings > Connect > API Key, 2) Ensure your account has API access enabled (contact Uplisting support if needed), 3) Restart your server after updating the key.';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. Your account may not have API access enabled. Contact Uplisting support to enable API access for your account.';
      } else if (response.status === 404) {
        errorMessage = 'Uplisting API endpoint not found. Please check the API documentation.';
      } else if (response.status >= 500) {
        errorMessage = 'Uplisting API server error. Please try again later.';
      }
      
      // Try to parse error details if available
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error || errorData.message) {
          errorMessage += ` Details: ${errorData.error || errorData.message}`;
        }
      } catch {
        // If parsing fails, use the text as-is if it's not empty
        if (errorText && errorText.length < 200) {
          errorMessage += ` Details: ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result: UplistingApiResponse<UplistingProperty[]> = await response.json();
    
    if (!result.data) {
      throw new Error('Uplisting API returned invalid response format. Expected data array.');
    }
    
    return result.data;
  } catch (error) {
    // Re-throw if it's already our formatted error
    if (error instanceof Error && error.message.includes('UPLISTING_API_KEY')) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error connecting to Uplisting API. Please check your internet connection and try again.');
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Fetches a single property with all its details including photos
 */
export async function fetchUplistingProperty(propertyId: string): Promise<{
  property: UplistingProperty;
  photos: UplistingPhoto[];
}> {
  const apiKey = resolveUplistingApiKey();

  try {
    const response = await fetch(
      `${UPLISTING_API_BASE_URL}/properties/${propertyId}?include=photos`,
      {
        headers: uplistingRequestHeaders(apiKey),
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = `Uplisting API error: ${response.status} ${response.statusText}`;
      
      if (response.status === 401) {
        errorMessage = 'Invalid Uplisting API key or API access not enabled. Please: 1) Regenerate your API key in Settings > Connect > API Key, 2) Ensure your account has API access enabled (contact Uplisting support if needed), 3) Restart your server after updating the key.';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. Your account may not have API access enabled. Contact Uplisting support to enable API access.';
      } else if (response.status === 404) {
        errorMessage = `Property ${propertyId} not found in Uplisting.`;
      }
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error || errorData.message) {
          errorMessage += ` Details: ${errorData.error || errorData.message}`;
        }
      } catch {
        if (errorText && errorText.length < 200) {
          errorMessage += ` Details: ${errorText}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const result: UplistingApiResponse<UplistingProperty> = await response.json();
    
    if (!result.data) {
      throw new Error('Uplisting API returned invalid response format.');
    }

    const photos = await enrichPhotosFromAccountList(
      propertyId,
      result.data,
      resolvePhotosForProperty(result.data, result.included)
    );

    return {
      property: result.data,
      photos,
    };
  } catch (error) {
    // Re-throw if it's already our formatted error
    if (error instanceof Error && error.message.includes('UPLISTING_API_KEY')) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error fetching property ${propertyId} from Uplisting API. Please check your internet connection.`);
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Fetches photos for multiple properties
 */
export async function fetchPhotosForProperties(propertyIds: string[]): Promise<Map<string, UplistingPhoto[]>> {
  const photosByProperty = new Map<string, UplistingPhoto[]>();

  // Fetch photos for each property
  for (const propertyId of propertyIds) {
    try {
      const photos = await fetchUplistingPropertyPhotos(propertyId);
      photosByProperty.set(propertyId, photos);
    } catch (error) {
      console.error(`Error fetching photos for property ${propertyId}:`, error);
      photosByProperty.set(propertyId, []);
    }
  }

  return photosByProperty;
}

