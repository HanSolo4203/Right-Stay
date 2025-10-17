-- Add iCal URL field to cached_properties table
ALTER TABLE cached_properties 
ADD COLUMN IF NOT EXISTS ical_url TEXT;

-- Add comment
COMMENT ON COLUMN cached_properties.ical_url IS 'iCal feed URL for syncing availability from external calendars (e.g., Airbnb, Booking.com)';

-- Create index for properties with iCal URLs
CREATE INDEX IF NOT EXISTS idx_cached_properties_ical_url 
ON cached_properties(ical_url) 
WHERE ical_url IS NOT NULL;

-- Update property 135133 with the Airbnb iCal URL
UPDATE cached_properties 
SET ical_url = 'https://www.airbnb.co.za/calendar/ical/1323863386746095841.ics?s=8fef6db13fedb2dcbb0b9f6d70844bb5'
WHERE uplisting_id = '135133';

