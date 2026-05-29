-- Booking system tables (guests, channels, bookings) and property mapping.
-- Required for direct website reservations via /api/bookings/create.

CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_email ON guests (LOWER(email));

CREATE TABLE IF NOT EXISTS booking_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  commission_rate NUMERIC(10, 2) DEFAULT 0,
  payment_processing_fee NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference TEXT NOT NULL UNIQUE,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE RESTRICT,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
  channel_id UUID NOT NULL REFERENCES booking_channels(id) ON DELETE RESTRICT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  accommodation_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cleaning_fee NUMERIC(10, 2) DEFAULT 0,
  extra_charges NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  booking_taxes NUMERIC(10, 2) DEFAULT 0,
  channel_commission NUMERIC(10, 2) DEFAULT 0,
  payment_processing_fee NUMERIC(10, 2) DEFAULT 0,
  commission_tax NUMERIC(10, 2) DEFAULT 0,
  booking_status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'partial', 'paid', 'refunded')
  ),
  payment_date TIMESTAMPTZ,
  payment_method TEXT,
  payment_notes TEXT,
  notes TEXT,
  number_of_guests INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON bookings (check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON bookings (booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings (payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_apartment_id ON bookings (apartment_id);

CREATE TABLE IF NOT EXISTS property_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uplisting_property_id TEXT NOT NULL UNIQUE,
  apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_mapping_uplisting_id ON property_mapping (uplisting_property_id);
CREATE INDEX IF NOT EXISTS idx_property_mapping_apartment_id ON property_mapping (apartment_id);

-- Triggers (function already exists from earlier migrations)
DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_channels_updated_at ON booking_channels;
CREATE TRIGGER update_booking_channels_updated_at
  BEFORE UPDATE ON booking_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_mapping_updated_at ON property_mapping;
CREATE TRIGGER update_property_mapping_updated_at
  BEFORE UPDATE ON property_mapping
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Direct website bookings channel
INSERT INTO booking_channels (name, commission_rate, payment_processing_fee)
VALUES ('Direct', 0, 0)
ON CONFLICT (name) DO NOTHING;

-- One apartment per cached Uplisting property (enables property_mapping for all listings)
INSERT INTO apartments (apartment_number, owner_name)
SELECT
  cp.uplisting_id,
  COALESCE(cp.data->'attributes'->>'name', 'Property ' || cp.uplisting_id)
FROM cached_properties cp
WHERE NOT EXISTS (
  SELECT 1 FROM apartments a WHERE a.apartment_number = cp.uplisting_id
);

INSERT INTO property_mapping (uplisting_property_id, apartment_id)
SELECT cp.uplisting_id, a.id
FROM cached_properties cp
JOIN apartments a ON a.apartment_number = cp.uplisting_id
ON CONFLICT (uplisting_property_id) DO UPDATE SET
  apartment_id = EXCLUDED.apartment_id,
  updated_at = NOW();
