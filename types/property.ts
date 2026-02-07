export interface PropertyPricing {
  propertyId: string;
  minPrice: number | null;
  basePrice: number | null;
  maxPrice: number | null;
  pricingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  uplisting_id: string;
  name: string;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  beds: number | null;
  maximum_capacity: number | null;
  currency: string;
  description: string;
  check_in_time: number | null;
  check_out_time: number | null;
  ical_url: string | null;
  last_synced: string | null;
  created_at: string;
  updated_at: string;
  primaryPhotoUrl?: string;
  pricing?: PropertyPricing;
}

export interface PropertyFormValues {
  uplisting_id: string;
  name: string;
  type: string;
  bedrooms: string;
  bathrooms: string;
  beds: string;
  maximum_capacity: string;
  currency: string;
  description: string;
  check_in_time: string;
  check_out_time: string;
  ical_url: string;
  pricingEnabled: boolean;
  minPrice: string;
  basePrice: string;
  maxPrice: string;
}

