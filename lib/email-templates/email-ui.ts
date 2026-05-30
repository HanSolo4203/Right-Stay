import { EMAIL_BRAND, EMAIL_BRAND_NAME, getEmailLogoUrl } from './brand';
import { escapeHtml } from './escape';

/** Layered shadow from lib/glass-styles.ts (email-safe subset). */
export const EMAIL_GLASS_SHADOW =
  '0 2.8px 2.2px rgba(0,0,0,0.06), 0 12.5px 10px rgba(0,0,0,0.1), 0 41.8px 33.4px rgba(0,0,0,0.14)';

export function glassPanelInlineStyle(radiusPx = 24): string {
  return [
    `background-color:${EMAIL_BRAND.glassBg}`,
    `border:1px solid ${EMAIL_BRAND.glassBorder}`,
    `border-radius:${radiusPx}px`,
    `box-shadow:${EMAIL_GLASS_SHADOW}`,
  ].join(';');
}

export function glassHighlightInlineStyle(radiusPx = 16): string {
  return [
    `background-color:${EMAIL_BRAND.glassHighlight}`,
    `border:1px solid ${EMAIL_BRAND.glassBorder}`,
    `border-radius:${radiusPx}px`,
  ].join(';');
}

export function renderEmailLogo(siteUrl?: string): string {
  const logoUrl = escapeHtml(getEmailLogoUrl(siteUrl));
  return `<img src="${logoUrl}" alt="${escapeHtml(EMAIL_BRAND_NAME)}" width="220" height="66" style="display:block;margin:0 auto;max-width:220px;width:100%;height:auto;border:0;outline:none;text-decoration:none;" />`;
}

export function renderEmailTaglinePill(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:18px auto 0;border-collapse:separate;">
    <tr>
      <td style="padding:10px 20px;background-color:${EMAIL_BRAND.glassPill};border:1px solid ${EMAIL_BRAND.glassBorderStrong};border-radius:16px;">
        <p style="margin:0;font-size:13px;line-height:1.5;color:${EMAIL_BRAND.textMuted};text-align:center;letter-spacing:0.02em;">
          Premium short-stay accommodation in Cape Town
        </p>
      </td>
    </tr>
  </table>`;
}

export function wrapGlassHighlightBlock(innerHtml: string, options?: { accentLeft?: boolean }): string {
  const leftAccent = options?.accentLeft
    ? `border-left:4px solid ${EMAIL_BRAND.green};border-radius:0 16px 16px 0;`
    : '';
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;${glassHighlightInlineStyle(16)};${leftAccent}">
    <tr>
      <td style="padding:16px 18px;">
        ${innerHtml}
      </td>
    </tr>
  </table>`;
}

export function wrapGlassNoticeBlock(innerHtml: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px;background-color:${EMAIL_BRAND.noticeBg};border:1px solid ${EMAIL_BRAND.noticeBorder};border-radius:16px;box-shadow:${EMAIL_GLASS_SHADOW};">
    <tr>
      <td style="padding:16px 18px;">
        ${innerHtml}
      </td>
    </tr>
  </table>`;
}

export function renderEmailCta(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
    <tr>
      <td>
        <a href="${safeHref}" style="display:inline-block;background-color:${EMAIL_BRAND.ctaBg};color:${EMAIL_BRAND.ctaText};font-size:15px;font-weight:600;line-height:1;text-decoration:none;padding:14px 28px;border-radius:16px;box-shadow:${EMAIL_GLASS_SHADOW};mso-padding-alt:0;">
          <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
          <span style="mso-text-raise:15pt;">${safeLabel}</span>
          <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%">&nbsp;</i><![endif]-->
        </a>
      </td>
    </tr>
  </table>`;
}
