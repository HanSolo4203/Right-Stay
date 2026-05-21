import { EMAIL_BRAND, EMAIL_BRAND_NAME, EMAIL_CONTACT } from './brand';
import { escapeHtml } from './escape';

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

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
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
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
          <tr>
            <td style="background-color:${EMAIL_BRAND.green};border-radius:8px 8px 0 0;padding:28px 32px;" class="mobile-padding">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <p style="margin:0;font-size:22px;line-height:1.3;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${EMAIL_BRAND_NAME}</p>
                    <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.88);">Premium short-stay accommodation in Cape Town</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:${EMAIL_BRAND.card};border-left:1px solid ${EMAIL_BRAND.border};border-right:1px solid ${EMAIL_BRAND.border};padding:32px;" class="mobile-padding">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color:${EMAIL_BRAND.card};border:1px solid ${EMAIL_BRAND.border};border-top:none;border-radius:0 0 8px 8px;padding:24px 32px;" class="mobile-padding">
              <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:${EMAIL_BRAND.textMuted};text-align:center;">
                <a href="${homeLink}" style="color:${EMAIL_BRAND.green};text-decoration:none;font-weight:600;">rightstayafrica.com</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:${EMAIL_BRAND.textLight};text-align:center;">
                Questions? <a href="mailto:${EMAIL_CONTACT}" style="color:${EMAIL_BRAND.green};text-decoration:none;">${EMAIL_CONTACT}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
