/** Right Stay Africa brand tokens for HTML emails (inline-safe values). */
export const EMAIL_BRAND = {
  green: '#337e2f',
  greenDark: '#2a6527',
  greenGlow: 'rgba(51,126,47,0.22)',
  /** Dark canvas aligned with hero / premium pages */
  background: '#0b100b',
  backgroundAccent: '#141c14',
  /** Frosted glass (matches glassFrostPanel: white/5–10 on dark) */
  glassBg: '#1a221a',
  glassBorder: 'rgba(255,255,255,0.12)',
  glassBorderStrong: 'rgba(255,255,255,0.2)',
  glassHighlight: '#232d23',
  glassPill: 'rgba(255,255,255,0.08)',
  /** Typography on dark glass */
  text: '#f4f7f4',
  textMuted: 'rgba(255,255,255,0.78)',
  textLight: 'rgba(255,255,255,0.55)',
  /** Amber notice glass */
  noticeBg: 'rgba(245,158,11,0.14)',
  noticeBorder: 'rgba(245,158,11,0.38)',
  noticeText: '#fde68a',
  /** Hero search CTA */
  ctaBg: '#ffffff',
  ctaText: '#0a0a0a',
  /** Legacy / accents */
  greenLight: 'rgba(51,126,47,0.18)',
  border: 'rgba(255,255,255,0.1)',
  card: '#1a221a',
} as const;

export const EMAIL_BRAND_NAME = 'Right Stay Africa';
export const EMAIL_LOGO_PATH = '/rsa-logo-white.png';

/** Absolute logo URL for email clients (must be HTTPS in production). */
export function getEmailLogoUrl(siteUrl?: string): string {
  const base = (siteUrl || 'https://rightstayafrica.com').replace(/\/$/, '');
  return `${base}${EMAIL_LOGO_PATH}`;
}
