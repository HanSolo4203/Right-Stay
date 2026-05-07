-- Mapping table to link internal properties with PriceLabs listing identifiers.
CREATE TABLE IF NOT EXISTS property_pricelabs_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL UNIQUE REFERENCES cached_properties(id) ON DELETE CASCADE,
  pricelabs_listing_id TEXT NOT NULL,
  pricelabs_pms TEXT NOT NULL,
  sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ NULL,
  last_sync_status TEXT NULL,
  last_sync_error TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_pricelabs_mapping_listing
  ON property_pricelabs_mapping(pricelabs_listing_id, pricelabs_pms);

CREATE INDEX IF NOT EXISTS idx_property_pricelabs_mapping_sync_enabled
  ON property_pricelabs_mapping(sync_enabled);

DROP TRIGGER IF EXISTS trigger_update_property_pricelabs_mapping_updated_at
  ON property_pricelabs_mapping;

CREATE TRIGGER trigger_update_property_pricelabs_mapping_updated_at
  BEFORE UPDATE ON property_pricelabs_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE property_pricelabs_mapping IS 'Maps Right-Stay properties to PriceLabs listing identifiers and stores sync status.';
COMMENT ON COLUMN property_pricelabs_mapping.pricelabs_listing_id IS 'PriceLabs listing id required by listing_prices endpoint.';
COMMENT ON COLUMN property_pricelabs_mapping.pricelabs_pms IS 'PriceLabs pms value required by listing_prices endpoint.';
