-- Add missing admin dashboard tables
-- Run this if you've already run 000_reset_seed_data.sql but need the admin tables

BEGIN;

-- Create apartments table for admin property management
CREATE TABLE IF NOT EXISTS apartments (
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

-- Create app_settings table for site configuration
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value NUMERIC,
  text_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add triggers for updated_at
CREATE TRIGGER trigger_update_apartments_updated_at
  BEFORE UPDATE ON apartments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;


