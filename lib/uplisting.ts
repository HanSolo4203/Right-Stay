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
  let apiKey = process.env.UPLISTING_API_KEY;
  
  if (!apiKey) {
    throw new Error('UPLISTING_API_KEY is not configured. Please add it to your .env.local file.');
  }

  // Trim whitespace that might have been accidentally added
  apiKey = apiKey.trim();

  if (apiKey === 'your_uplisting_api_key_here' || apiKey === '') {
    throw new Error('UPLISTING_API_KEY is set to placeholder value. Please add your actual API key from Uplisting Settings > Connect > API Key.');
  }

  // Log API key length for debugging (first 8 chars only for security)
  console.log(`[Uplisting API] Using API key: ${apiKey.substring(0, 8)}... (length: ${apiKey.length})`);

  try {
    const response = await fetch(`${UPLISTING_API_BASE_URL}/properties`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Add cache control for server-side requests
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
  let apiKey = process.env.UPLISTING_API_KEY;
  
  if (!apiKey) {
    throw new Error('UPLISTING_API_KEY is not configured. Please add it to your .env.local file.');
  }

  // Trim whitespace that might have been accidentally added
  apiKey = apiKey.trim();

  if (apiKey === 'your_uplisting_api_key_here' || apiKey === '') {
    throw new Error('UPLISTING_API_KEY is set to placeholder value. Please add your actual API key from Uplisting Settings > Connect > API Key.');
  }

  try {
    const response = await fetch(
      `${UPLISTING_API_BASE_URL}/properties/${propertyId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
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
      const { photos } = await fetchUplistingProperty(propertyId);
      photosByProperty.set(propertyId, photos);
    } catch (error) {
      console.error(`Error fetching photos for property ${propertyId}:`, error);
      photosByProperty.set(propertyId, []);
    }
  }

  return photosByProperty;
}

