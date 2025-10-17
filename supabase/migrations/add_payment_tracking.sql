-- Add payment tracking to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Create index for faster payment status queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Add comment
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: pending (awaiting payment), partial (deposit received), paid (full payment received), refunded';
COMMENT ON COLUMN bookings.payment_date IS 'Date when payment was received/confirmed';
COMMENT ON COLUMN bookings.payment_method IS 'Payment method used (e.g., Bank Transfer, Credit Card, Cash)';
COMMENT ON COLUMN bookings.payment_notes IS 'Additional payment-related notes';

