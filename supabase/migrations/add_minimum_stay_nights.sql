-- Minimum stay per property (booking rules live with pricing configuration)
ALTER TABLE property_pricing
  ADD COLUMN IF NOT EXISTS minimum_stay_nights INTEGER NOT NULL DEFAULT 2;

COMMENT ON COLUMN property_pricing.minimum_stay_nights IS 'Minimum number of nights required for a direct booking request on this property.';

-- Persist guest count on direct booking requests
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS number_of_guests INTEGER;

COMMENT ON COLUMN bookings.number_of_guests IS 'Number of guests for this booking (direct website requests).';
