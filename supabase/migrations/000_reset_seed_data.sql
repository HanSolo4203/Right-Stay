--
-- Full reset + seed for the public listing data.
-- Run once in a clean database before pointing the site at the new project.
--

BEGIN;

-- Drop every table that came from the old Supabase project so migrations can start fresh.
DROP TABLE IF EXISTS property_photos;
DROP TABLE IF EXISTS cached_properties;
DROP TABLE IF EXISTS tour_packages;
DROP TABLE IF EXISTS property_mapping;
DROP TABLE IF EXISTS apartments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS booking_channels;
DROP TABLE IF EXISTS cleaners;
DROP TABLE IF EXISTS cleaning_sessions;
DROP TABLE IF EXISTS internal_assets;
DROP TABLE IF EXISTS upsells;
DROP TABLE IF EXISTS custom_expenses;
DROP TABLE IF EXISTS cached_availability;

-- Enable UUID generation helper
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Primary dataset that the home page consumes
CREATE TABLE cached_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uplisting_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ical_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_cached_properties_uplisting_id ON cached_properties(uplisting_id);
CREATE INDEX IF NOT EXISTS idx_cached_properties_last_synced ON cached_properties(last_synced);
CREATE INDEX IF NOT EXISTS idx_cached_properties_ical_url ON cached_properties(ical_url) WHERE ical_url IS NOT NULL;

CREATE TABLE property_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL REFERENCES cached_properties(uplisting_id) ON DELETE CASCADE,
  photo_id TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  caption TEXT,
  position INTEGER,
  is_primary BOOLEAN DEFAULT false,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_photos_property_id ON property_photos(property_id);
CREATE INDEX IF NOT EXISTS idx_property_photos_is_primary ON property_photos(is_primary);

-- Tour package data used in the `/tours` page and admin screens
CREATE TABLE tour_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  duration TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 1,
  location TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tour_packages_name ON tour_packages(name);
CREATE INDEX IF NOT EXISTS idx_tour_packages_is_active ON tour_packages(is_active);

-- Admin dashboard tables
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_number TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT,
  address TEXT,
  cleaner_payout NUMERIC(10, 2) DEFAULT 0,
  welcome_pack_fee NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apartments_apartment_number ON apartments(apartment_number);

CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value NUMERIC,
  text_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared trigger to keep updated_at current
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cached_properties_updated_at
  BEFORE UPDATE ON cached_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_property_photos_updated_at
  BEFORE UPDATE ON property_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_tour_packages_updated_at
  BEFORE UPDATE ON tour_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_apartments_updated_at
  BEFORE UPDATE ON apartments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed the listings that feed the homepage
INSERT INTO cached_properties (uplisting_id, data, ical_url) VALUES
(
  '135133',
  jsonb_build_object(
    'attributes', jsonb_build_object(
      'name', 'Cape Town Luxury Villa',
      'nickname', 'Atlantic Breeze',
      'type', 'Villa',
      'bedrooms', 3,
      'bathrooms', 2,
      'beds', 4,
      'maximum_capacity', 6,
      'currency', 'ZAR',
      'description', 'Stunning oceanfront villa with panoramic views of Camps Bay and Devil''s Peak.',
      'check_in_time', 15,
      'check_out_time', 11,
      'property_slug', 'cape-town-luxury-villa',
      'time_zone', 'Africa/Johannesburg'
    )
  ),
  'https://www.airbnb.co.za/calendar/ical/1323863386746095841.ics?s=8fef6db13fedb2dcbb0b9f6d70844bb5'
),
(
  '135134',
  jsonb_build_object(
    'attributes', jsonb_build_object(
      'name', 'Safari Lodge Retreat',
      'nickname', 'Bush Dream',
      'type', 'Lodge',
      'bedrooms', 2,
      'bathrooms', 2,
      'beds', 3,
      'maximum_capacity', 4,
      'currency', 'ZAR',
      'description', 'Immersive safari lodge beside the Kruger National Park with game drives at dawn.',
      'check_in_time', 14,
      'check_out_time', 10,
      'property_slug', 'kruger-safari-lodge',
      'time_zone', 'Africa/Johannesburg'
    )
  ),
  NULL
),
(
  '135135',
  jsonb_build_object(
    'attributes', jsonb_build_object(
      'name', 'Wine Estate Villa',
      'nickname', 'Vineyard View',
      'type', 'Estate',
      'bedrooms', 4,
      'bathrooms', 3,
      'beds', 5,
      'maximum_capacity', 8,
      'currency', 'ZAR',
      'description', 'Elegant villa on a working wine estate near Stellenbosch with vineyard views.',
      'check_in_time', 15,
      'check_out_time', 11,
      'property_slug', 'stellenbosch-wine-villa',
      'time_zone', 'Africa/Johannesburg'
    )
  ),
  NULL
);

-- Seed the photos the front page expects
INSERT INTO property_photos (property_id, photo_id, url, caption, position, is_primary) VALUES
('135133', 'photo-001', '/images/993d5154-c104-4507-8f74-593d55181036_800w_1.jpg', 'Oceanfront living space', 1, true),
('135133', 'photo-002', '/images/6b428a64-0de1-4837-bab2-9729ce2e28c2_3840w_1.jpg', 'Sunset view from the balcony', 2, false),
('135134', 'photo-101', '/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_3840w_1.jpg', 'Safari lodge sunrise', 1, true),
('135134', 'photo-102', '/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg', 'Private deck over the bush', 2, false),
('135135', 'photo-201', '/images/4ca8123b-2b44-4ef6-9ce7-51db6671104c_800w_1.jpg', 'Vineyard pool and estate', 1, true),
('135135', 'photo-202', '/images/4ca8123b-2b44-4ef6-9ce7-51db6671104c_800w.jpg', 'Tasting room terrace', 2, false);

-- Add the tour packages that appear in `/tours`
INSERT INTO tour_packages (name, description, price, duration, max_participants, location, is_active) VALUES
('Cape Town City & Table Mountain Tour', 'Explore Cape Town with Table Mountain, the V&A Waterfront, and coastline drives. Includes cable car tickets and lunch.', 1200.00, 'Full Day (8 hours)', 12, 'Cape Town, Western Cape', true),
('Kruger Safari Experience', 'Three-day immersive Big Five safari with guided game drives, meals, and overnight lodge stays.', 8500.00, '3 Days / 2 Nights', 8, 'Kruger National Park', true),
('Wine Route & Vineyard Tour', 'Full-day tour of Stellenbosch & Franschhoek include tastings, cellar tours, and gourmet lunch.', 1800.00, 'Full Day (7 hours)', 10, 'Stellenbosch & Franschhoek', true),
('Garden Route Adventure', 'Five-day road trip along the Garden Route with coastal hikes, lagoon tours, and Knysna experiences.', 15000.00, '5 Days / 4 Nights', 6, 'Garden Route, South Africa', true),
('Soweto Cultural Experience', 'Half-day cultural tour featuring Mandela House and Apartheid Museum visits with local guides.', 850.00, 'Half Day (4 hours)', 15, 'Johannesburg, Gauteng', true),
('Whale Watching Experience', 'Half-day marine safari from Hermanus to see Southern Right Whales with expert naturalists.', 950.00, 'Half Day (5 hours)', 20, 'Hermanus, Western Cape', true);

COMMIT;

