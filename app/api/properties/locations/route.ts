import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/properties/locations
 * Returns unique locations from all properties in the database
 */
export async function GET() {
  try {
    if (!supabaseServer) {
      return NextResponse.json({ 
        error: 'Database not configured', 
        locations: [] 
      }, { status: 200 });
    }

    // Fetch all properties
    const { data: properties, error } = await supabaseServer
      .from('cached_properties')
      .select('data');

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json({ 
        error: error.message,
        locations: [] 
      }, { status: 500 });
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json({ locations: [] });
    }

    // Extract unique locations from property data
    // For now, we'll extract from descriptions or use a default
    const locationSet = new Set<string>();
    
    properties.forEach((property) => {
      const data = property.data;
      const attributes = data?.attributes || {};
      const description = attributes.description || '';
      const name = attributes.name || attributes.nickname || '';
      
      // Try to extract location from description or name
      // Look for common location patterns
      const locationPatterns = [
        /Cape Town/gi,
        /Kruger/gi,
        /Stellenbosch/gi,
        /Johannesburg/gi,
        /Durban/gi,
        /Pretoria/gi,
      ];
      
      let foundLocation: string | null = null;
      
      // Check description first
      for (const pattern of locationPatterns) {
        const match = description.match(pattern);
        if (match) {
          foundLocation = match[0];
          break;
        }
      }
      
      // If not found in description, check name
      if (!foundLocation) {
        for (const pattern of locationPatterns) {
          const match = name.match(pattern);
          if (match) {
            foundLocation = match[0];
            break;
          }
        }
      }
      
      // Default to Cape Town if no location found (as per user requirement)
      const location = foundLocation || 'Cape Town';
      locationSet.add(location);
    });

    const locations = Array.from(locationSet).sort();
    
    return NextResponse.json({ locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch locations',
      locations: []
    }, { status: 500 });
  }
}
