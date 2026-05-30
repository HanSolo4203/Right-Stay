import { cache } from 'react';
import { supabaseServer } from '@/lib/supabase-server';
import {
  formatPhoneTel,
  getSiteContactEmail,
  SITE_LOCATION,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
} from '@/lib/site-contact';

export type PublicSiteContact = {
  email: string;
  phone: string;
  phoneTel: string;
  address: string;
};

const PUBLIC_SETTING_KEYS = ['site_phone', 'site_address', 'site_email'] as const;

function buildContactFallbacks(): PublicSiteContact {
  const phone = SITE_PHONE_DISPLAY;

  return {
    email: getSiteContactEmail(),
    phone,
    phoneTel: SITE_PHONE_TEL || formatPhoneTel(phone),
    address: SITE_LOCATION,
  };
}

export const getPublicSiteContact = cache(async (): Promise<PublicSiteContact> => {
  const fallbacks = buildContactFallbacks();

  if (!supabaseServer) {
    return fallbacks;
  }

  const { data, error } = await supabaseServer
    .from('app_settings')
    .select('key, text_value')
    .in('key', [...PUBLIC_SETTING_KEYS]);

  if (error || !data) {
    return fallbacks;
  }

  const settings = Object.fromEntries(
    data.map((row) => [row.key, row.text_value?.trim() || ''])
  );

  const phone = settings.site_phone || fallbacks.phone;
  const address = settings.site_address || fallbacks.address;
  const email = settings.site_email || fallbacks.email;

  return {
    email,
    phone,
    phoneTel: formatPhoneTel(phone) || fallbacks.phoneTel,
    address,
  };
});
