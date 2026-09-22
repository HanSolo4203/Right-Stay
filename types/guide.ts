export type GuidePriceLevel = 'free' | '$' | '$$' | '$$$';

export interface GuideCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  item_count?: number;
  created_at: string;
  updated_at: string;
}

export interface GuideItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  address: string | null;
  latitude: number;
  longitude: number;
  price_level: GuidePriceLevel | null;
  website_url: string | null;
  booking_url: string | null;
  phone: string | null;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  google_place_id: string | null;
  google_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuideItemPhoto {
  id: string;
  guide_item_id: string;
  storage_path: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
  google_photo_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GuideItemCategoryRef {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export interface GuideItemAdmin extends GuideItem {
  category?: GuideItemCategoryRef | null;
  photos?: GuideItemPhoto[];
  primary_photo_url?: string | null;
}

/** Public Things To Do place with a required category and photo set. */
export interface GuidePlace extends GuideItem {
  category: GuideItemCategoryRef;
  photos: GuideItemPhoto[];
  primary_photo_url: string | null;
}

/** Published stay pin shown on the Things To Do map. */
export interface GuidePropertyPin {
  id: string;
  name: string;
  slug: string | null;
  latitude: number;
  longitude: number;
  label: string;
}
