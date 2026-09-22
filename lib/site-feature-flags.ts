export type SiteSettingRow = {
  key: string;
  value?: number | string | boolean | null;
  text_value?: string | null;
};

export type SiteFeatureFlags = {
  toursEnabled: boolean;
  guideEnabled: boolean;
};

export function isSiteFeatureEnabled(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === '1.0' || normalized === 'true';
  }
  return false;
}

export function parseSiteFeatureFlags(settings: SiteSettingRow[]): SiteFeatureFlags {
  const byKey = new Map(settings.map((setting) => [setting.key, setting]));

  const flagFrom = (key: string) => {
    const row = byKey.get(key);
    return isSiteFeatureEnabled(row?.value) || isSiteFeatureEnabled(row?.text_value);
  };

  return {
    toursEnabled: flagFrom('tours_enabled'),
    guideEnabled: flagFrom('guide_enabled'),
  };
}
