import { EMAIL_BRAND, EMAIL_BRAND_NAME } from './brand';
import { getSiteContactEmail } from '@/lib/site-contact';
import { escapeHtml } from './escape';
import { glassPanelInlineStyle, renderEmailLogo, renderEmailTaglinePill } from './email-ui';

export interface EmailLayoutOptions {
  preheader?: string;
  siteUrl?: string;
}

export function wrapEmailLayout(contentHtml: string, options: EmailLayoutOptions = {}): string {
  const siteUrl = (options.siteUrl || '').replace(/\/$/, '');
  const homeLink = siteUrl || 'https://rightstayafrica.com';
  const preheader = options.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(options.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
    : '';

  const outerGlass = glassPanelInlineStyle(24);
  const contactEmail = getSiteContactEmail();
  const contactFooter = contactEmail
    ? `Questions? <a href="mailto:${escapeHtml(contactEmail)}" style="color:${EMAIL_BRAND.green};text-decoration:none;font-weight:500;">${escapeHtml(contactEmail)}</a>`
    : `Questions? Visit <a href="${homeLink}" style="color:${EMAIL_BRAND.green};text-decoration:none;font-weight:500;">our website</a>`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${EMAIL_BRAND_NAME}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .details-label { width: 38% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${EMAIL_BRAND.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${preheader}
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${EMAIL_BRAND.background};">
    <tr>
      <td align="center" style="padding:40px 16px;background:linear-gradient(180deg,${EMAIL_BRAND.background} 0%,${EMAIL_BRAND.backgroundAccent} 100%);">
        <!--[if mso]>
        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;">
          <v:fill type="gradient" color="${EMAIL_BRAND.background}" color2="${EMAIL_BRAND.backgroundAccent}" angle="180" />
        </v:rect>
        <![endif]-->
        <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;${outerGlass};border-collapse:separate;">
          <tr>
            <td style="padding:36px 32px 28px;text-align:center;border-bottom:1px solid ${EMAIL_BRAND.border};" class="mobile-padding">
              <a href="${homeLink}" style="text-decoration:none;">
                ${renderEmailLogo(siteUrl)}
              </a>
              ${renderEmailTaglinePill()}
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px;" class="mobile-padding">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;" class="mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${glassPanelInlineStyle(16)};border-collapse:separate;">
                <tr>
                  <td style="padding:20px 22px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:${EMAIL_BRAND.textMuted};">
                      <a href="${homeLink}" style="color:${EMAIL_BRAND.green};text-decoration:none;font-weight:600;">rightstayafrica.com</a>
                    </p>
                    <p style="margin:0;font-size:12px;line-height:1.6;color:${EMAIL_BRAND.textLight};">
                      ${contactFooter}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:11px;line-height:1.5;color:${EMAIL_BRAND.textLight};text-align:center;max-width:600px;">
          &copy; ${new Date().getFullYear()} ${EMAIL_BRAND_NAME}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
