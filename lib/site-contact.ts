/**
 * Public contact email for the site and transactional emails.
 * Set SITE_CONTACT_EMAIL (server) and NEXT_PUBLIC_SITE_CONTACT_EMAIL (client) in .env.local.
 * Falls back to BOOKING_NOTIFICATION_EMAIL when only that is configured.
 */
const FALLBACK_CONTACT_EMAIL = '';

export function getSiteContactEmail(): string {
  return (
    process.env.SITE_CONTACT_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFICATION_EMAIL?.trim() ||
    FALLBACK_CONTACT_EMAIL
  );
}

/** For client components (set NEXT_PUBLIC_SITE_CONTACT_EMAIL in .env.local). */
export function getPublicSiteContactEmail(): string {
  return process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL?.trim() || FALLBACK_CONTACT_EMAIL;
}

export const SITE_LOCATION = 'Cape Town, South Africa';
export const SITE_PHONE_DISPLAY = '+27 (0)21 000 0000';
export const SITE_PHONE_TEL = '+27210000000';

/** Build a tel: href from a human-readable phone number. */
export function formatPhoneTel(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('0')) {
    return `+27${digits.slice(1)}`;
  }

  if (digits.startsWith('27')) {
    if (digits.length > 2 && digits[2] === '0') {
      digits = digits.slice(0, 2) + digits.slice(3);
    }
    return `+${digits}`;
  }

  return `+${digits}`;
}
