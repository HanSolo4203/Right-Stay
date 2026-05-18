import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  extractLocationFromAttributes,
  locationFieldsForAttributes,
} from '@/lib/property-location';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function buildPricingObject(row: any) {
  if (!row) {
    return null;
  }

  return {
    propertyId: row.property_id as string,
    minPrice: row.min_price !== null && row.min_price !== undefined ? Number(row.min_price) : null,
    basePrice:
      row.base_price !== null && row.base_price !== undefined ? Number(row.base_price) : null,
    maxPrice: row.max_price !== null && row.max_price !== undefined ? Number(row.max_price) : null,
    pricingEnabled: !!row.pricing_enabled,
    cleaningFee:
      row.cleaning_fee !== null && row.cleaning_fee !== undefined ? Number(row.cleaning_fee) : null,
    serviceFeePercent:
      row.service_fee_percent !== null && row.service_fee_percent !== undefined
        ? Number(row.service_fee_percent)
        : null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function buildPriceLabsMappingObject(row: any) {
  if (!row) return null;

  return {
    propertyId: row.property_id as string,
    pricelabsListingId: row.pricelabs_listing_id as string,
    pricelabsPms: row.pricelabs_pms as string,
    syncEnabled: !!row.sync_enabled,
    lastSyncedAt: (row.last_synced_at as string) || null,
    lastSyncStatus: (row.last_sync_status as string) || null,
    lastSyncError: (row.last_sync_error as string) || null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function GET() {
  try {
    console.log('Fetching properties from database...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
    console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');

    // Fetch from cached_properties table
    const { data, error } = await supabase
      .from('cached_properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    const properties = data || [];

    // Fetch pricing rows for all properties in a single query
    const propertyIds = properties.map((p: any) => p.id).filter(Boolean);
    let pricingByPropertyId: Record<string, any> = {};
    let mappingByPropertyId: Record<string, any> = {};

    if (propertyIds.length > 0) {
      const { data: pricingRows, error: pricingError } = await supabase
        .from('property_pricing')
        .select('*')
        .in('property_id', propertyIds);

      if (pricingError) {
        console.error('Supabase error fetching pricing:', pricingError);
      } else {
        pricingByPropertyId = (pricingRows || []).reduce(
          (acc: Record<string, any>, row: any) => {
            acc[row.property_id] = row;
            return acc;
          },
          {}
        );
      }

      const { data: mappingRows, error: mappingError } = await supabase
        .from('property_pricelabs_mapping')
        .select('*')
        .in('property_id', propertyIds);

      if (mappingError) {
        console.error('Supabase error fetching PriceLabs mappings:', mappingError);
      } else {
        mappingByPropertyId = (mappingRows || []).reduce(
          (acc: Record<string, any>, row: any) => {
            acc[row.property_id] = row;
            return acc;
          },
          {}
        );
      }
    }

    // Transform the data to include extracted attributes for easier display
    const transformedData = properties.map((property: any) => {
      const attributes = property.data?.attributes || {};
      const pricingRow = pricingByPropertyId[property.id];
      const mappingRow = mappingByPropertyId[property.id];
      const location = extractLocationFromAttributes(attributes);
      return {
        id: property.id,
        uplisting_id: property.uplisting_id,
        name: attributes.name || attributes.nickname || 'Unnamed Property',
        type: attributes.type || 'Property',
        bedrooms: attributes.bedrooms || null,
        bathrooms: attributes.bathrooms || null,
        beds: attributes.beds || null,
        maximum_capacity: attributes.maximum_capacity || null,
        currency: attributes.currency || 'ZAR',
        description: attributes.description || '',
        check_in_time: attributes.check_in_time || null,
        check_out_time: attributes.check_out_time || null,
        property_slug: attributes.property_slug || null,
        time_zone: attributes.time_zone || null,
        ical_url: property.ical_url || null,
        last_synced: property.last_synced,
        created_at: property.created_at,
        updated_at: property.updated_at,
        ...location,
        pricing: buildPricingObject(pricingRow),
        pricelabsMapping: buildPriceLabsMappingObject(mappingRow),
        // Keep full data for reference
        data: property.data
      };
    });

    console.log('Properties fetched successfully:', transformedData?.length || 0, 'properties');
    return NextResponse.json(transformedData || []);
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch properties',
        details: error.message,
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const location = locationFieldsForAttributes(body);

    // Create property data structure for cached_properties
    const propertyData = {
      uplisting_id: body.uplisting_id || `prop-${Date.now()}`,
      data: {
        attributes: {
          name: body.name || 'New Property',
          nickname: body.nickname || body.name || 'New Property',
          type: body.type || 'Property',
          bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
          bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
          beds: body.beds ? parseInt(body.beds) : null,
          maximum_capacity: body.maximum_capacity ? parseInt(body.maximum_capacity) : null,
          currency: body.currency || 'ZAR',
          description: body.description || '',
          check_in_time: body.check_in_time ? parseInt(body.check_in_time) : 15,
          check_out_time: body.check_out_time ? parseInt(body.check_out_time) : 11,
          property_slug: body.property_slug || null,
          time_zone: body.time_zone || 'Africa/Johannesburg',
          ...location,
        }
      },
      ical_url: body.ical_url || null
    };

    const { data, error } = await supabase
      .from('cached_properties')
      .insert([propertyData])
      .select()
      .single();

    if (error) throw error;

    // Optionally create a pricing row if pricing fields were provided
    let pricing = null;
    const hasPricingFields =
      body.minPrice !== undefined ||
      body.basePrice !== undefined ||
      body.maxPrice !== undefined ||
      body.cleaningFee !== undefined ||
      body.serviceFeePercent !== undefined ||
      body.pricingEnabled !== undefined;

    if (hasPricingFields) {
      const min_price =
        body.minPrice !== undefined && body.minPrice !== null
          ? Number(body.minPrice)
          : null;
      const base_price =
        body.basePrice !== undefined && body.basePrice !== null
          ? Number(body.basePrice)
          : null;
      const max_price =
        body.maxPrice !== undefined && body.maxPrice !== null
          ? Number(body.maxPrice)
          : null;
      const pricing_enabled = !!body.pricingEnabled;
      const cleaning_fee =
        body.cleaningFee !== undefined && body.cleaningFee !== null
          ? Number(body.cleaningFee)
          : 450;
      const service_fee_percent =
        body.serviceFeePercent !== undefined && body.serviceFeePercent !== null
          ? Number(body.serviceFeePercent)
          : 5;

      const { data: pricingData, error: pricingError } = await supabase
        .from('property_pricing')
        .upsert(
          {
            property_id: data.id,
            min_price,
            base_price,
            max_price,
            pricing_enabled,
            cleaning_fee,
            service_fee_percent,
          },
          { onConflict: 'property_id' }
        )
        .select()
        .single();

      if (pricingError) {
        console.error('Error creating property pricing:', pricingError);
      } else {
        pricing = buildPricingObject(pricingData);
      }
    }

    let pricelabsMapping = null;
    const hasMappingFields =
      body.pricelabsListingId !== undefined ||
      body.pricelabsPms !== undefined ||
      body.pricelabsSyncEnabled !== undefined;

    if (hasMappingFields && body.pricelabsListingId && body.pricelabsPms) {
      const { data: mappingData, error: mappingError } = await supabase
        .from('property_pricelabs_mapping')
        .upsert(
          {
            property_id: data.id,
            pricelabs_listing_id: String(body.pricelabsListingId).trim(),
            pricelabs_pms: String(body.pricelabsPms).trim(),
            sync_enabled: body.pricelabsSyncEnabled !== undefined ? !!body.pricelabsSyncEnabled : true,
          },
          { onConflict: 'property_id' }
        )
        .select()
        .single();

      if (mappingError) {
        console.error('Error creating PriceLabs mapping:', mappingError);
      } else {
        pricelabsMapping = buildPriceLabsMappingObject(mappingData);
      }
    }

    // Transform response
    const attributes = data.data?.attributes || {};
    return NextResponse.json({
      id: data.id,
      uplisting_id: data.uplisting_id,
      name: attributes.name || attributes.nickname || 'Unnamed Property',
      type: attributes.type || 'Property',
      bedrooms: attributes.bedrooms,
      bathrooms: attributes.bathrooms,
      maximum_capacity: attributes.maximum_capacity,
      description: attributes.description,
      ical_url: data.ical_url,
      created_at: data.created_at,
      pricing,
      pricelabsMapping,
    });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const location = locationFieldsForAttributes(body);

    // First get the existing property to preserve data structure
    const { data: existing, error: fetchError } = await supabase
      .from('cached_properties')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const hasLocationFields =
      body.location_address !== undefined ||
      body.location_display !== undefined ||
      body.latitude !== undefined ||
      body.longitude !== undefined;

    // Update the data JSONB field
    const updatedData = {
      ...existing.data,
      attributes: {
        ...existing.data?.attributes,
        name: body.name !== undefined ? body.name : existing.data?.attributes?.name,
        nickname: body.nickname !== undefined ? body.nickname : body.name || existing.data?.attributes?.nickname,
        type: body.type !== undefined ? body.type : existing.data?.attributes?.type,
        bedrooms: body.bedrooms !== undefined ? parseInt(body.bedrooms) : existing.data?.attributes?.bedrooms,
        bathrooms: body.bathrooms !== undefined ? parseInt(body.bathrooms) : existing.data?.attributes?.bathrooms,
        beds: body.beds !== undefined ? parseInt(body.beds) : existing.data?.attributes?.beds,
        maximum_capacity: body.maximum_capacity !== undefined ? parseInt(body.maximum_capacity) : existing.data?.attributes?.maximum_capacity,
        currency: body.currency !== undefined ? body.currency : existing.data?.attributes?.currency || 'ZAR',
        description: body.description !== undefined ? body.description : existing.data?.attributes?.description,
        check_in_time: body.check_in_time !== undefined ? parseInt(body.check_in_time) : existing.data?.attributes?.check_in_time,
        check_out_time: body.check_out_time !== undefined ? parseInt(body.check_out_time) : existing.data?.attributes?.check_out_time,
        property_slug: body.property_slug !== undefined ? body.property_slug : existing.data?.attributes?.property_slug,
        time_zone: body.time_zone !== undefined ? body.time_zone : existing.data?.attributes?.time_zone || 'Africa/Johannesburg',
        ...(hasLocationFields ? location : {}),
      }
    };

    const updateData: any = {
      data: updatedData
    };

    if (body.ical_url !== undefined) {
      updateData.ical_url = body.ical_url;
    }

    const { data, error } = await supabase
      .from('cached_properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Upsert pricing if pricing fields were provided
    let pricing = null;
    const hasPricingFields =
      body.minPrice !== undefined ||
      body.basePrice !== undefined ||
      body.maxPrice !== undefined ||
      body.cleaningFee !== undefined ||
      body.serviceFeePercent !== undefined ||
      body.pricingEnabled !== undefined;

    if (hasPricingFields) {
      const min_price =
        body.minPrice !== undefined && body.minPrice !== null
          ? Number(body.minPrice)
          : null;
      const base_price =
        body.basePrice !== undefined && body.basePrice !== null
          ? Number(body.basePrice)
          : null;
      const max_price =
        body.maxPrice !== undefined && body.maxPrice !== null
          ? Number(body.maxPrice)
          : null;
      const pricing_enabled = !!body.pricingEnabled;
      const cleaning_fee =
        body.cleaningFee !== undefined && body.cleaningFee !== null
          ? Number(body.cleaningFee)
          : 450;
      const service_fee_percent =
        body.serviceFeePercent !== undefined && body.serviceFeePercent !== null
          ? Number(body.serviceFeePercent)
          : 5;

      const { data: pricingData, error: pricingError } = await supabase
        .from('property_pricing')
        .upsert(
          {
            property_id: id,
            min_price,
            base_price,
            max_price,
            pricing_enabled,
            cleaning_fee,
            service_fee_percent,
          },
          { onConflict: 'property_id' }
        )
        .select()
        .single();

      if (pricingError) {
        console.error('Error updating property pricing:', pricingError);
      } else {
        pricing = buildPricingObject(pricingData);
      }
    } else {
      // If no pricing fields sent, fetch existing pricing (if any) to include in response
      const { data: pricingData, error: pricingError } = await supabase
        .from('property_pricing')
        .select('*')
        .eq('property_id', id)
        .maybeSingle();

      if (!pricingError && pricingData) {
        pricing = buildPricingObject(pricingData);
      }
    }

    let pricelabsMapping = null;
    const hasMappingFields =
      body.pricelabsListingId !== undefined ||
      body.pricelabsPms !== undefined ||
      body.pricelabsSyncEnabled !== undefined;

    if (hasMappingFields) {
      const listingId = body.pricelabsListingId ? String(body.pricelabsListingId).trim() : '';
      const pms = body.pricelabsPms ? String(body.pricelabsPms).trim() : '';

      if (listingId && pms) {
        const { data: mappingData, error: mappingError } = await supabase
          .from('property_pricelabs_mapping')
          .upsert(
            {
              property_id: id,
              pricelabs_listing_id: listingId,
              pricelabs_pms: pms,
              sync_enabled:
                body.pricelabsSyncEnabled !== undefined ? !!body.pricelabsSyncEnabled : true,
            },
            { onConflict: 'property_id' }
          )
          .select()
          .single();

        if (mappingError) {
          console.error('Error upserting PriceLabs mapping:', mappingError);
        } else {
          pricelabsMapping = buildPriceLabsMappingObject(mappingData);
        }
      } else if (body.pricelabsListingId === '' || body.pricelabsPms === '') {
        const { error: deleteError } = await supabase
          .from('property_pricelabs_mapping')
          .delete()
          .eq('property_id', id);
        if (deleteError) {
          console.error('Error clearing PriceLabs mapping:', deleteError);
        }
      }
    } else {
      const { data: mappingData, error: mappingError } = await supabase
        .from('property_pricelabs_mapping')
        .select('*')
        .eq('property_id', id)
        .maybeSingle();
      if (!mappingError && mappingData) {
        pricelabsMapping = buildPriceLabsMappingObject(mappingData);
      }
    }

    // Transform response
    const attributes = data.data?.attributes || {};
    return NextResponse.json({
      id: data.id,
      uplisting_id: data.uplisting_id,
      name: attributes.name || attributes.nickname || 'Unnamed Property',
      type: attributes.type || 'Property',
      bedrooms: attributes.bedrooms,
      bathrooms: attributes.bathrooms,
      maximum_capacity: attributes.maximum_capacity,
      description: attributes.description,
      ical_url: data.ical_url,
      updated_at: data.updated_at,
      pricing,
      pricelabsMapping,
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('cached_properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}

