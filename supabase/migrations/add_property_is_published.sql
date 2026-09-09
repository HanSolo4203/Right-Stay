-- Control whether a property appears on the public website
ALTER TABLE public.cached_properties
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.cached_properties.is_published IS
  'When false, property is hidden from the public website but remains in admin.';

CREATE INDEX IF NOT EXISTS idx_cached_properties_is_published
  ON public.cached_properties(is_published);
