-- Contact form submissions from the public Get In Touch page.

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  subject TEXT NOT NULL,
  message TEXT,
  is_property_hosting BOOLEAN NOT NULL DEFAULT false,
  property_details JSONB,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON contact_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_subject
  ON contact_submissions (subject);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_is_property_hosting
  ON contact_submissions (is_property_hosting)
  WHERE is_property_hosting = true;

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Inserts are performed server-side via the service role key only.

CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contact_submissions_updated_at ON contact_submissions;

CREATE TRIGGER trigger_update_contact_submissions_updated_at
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_submissions_updated_at();
