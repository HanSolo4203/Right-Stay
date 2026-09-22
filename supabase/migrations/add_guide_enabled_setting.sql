-- Add guide_enabled app setting (0 = disabled, 1 = enabled)
BEGIN;

INSERT INTO app_settings (key, value, text_value)
VALUES ('guide_enabled', 0, NULL)
ON CONFLICT (key) DO NOTHING;

COMMIT;
