import { EMAIL_BRAND } from './brand';
import { buildBookingDetailsTable } from './booking-details-table';
import { escapeHtml } from './escape';
import { wrapEmailLayout } from './layout';
import type { BookingEmailDetails } from './types';

export interface AdminBookingRequestEmailOptions {
  details: BookingEmailDetails;
  adminLink?: string;
  siteUrl?: string;
}

export function renderAdminBookingRequestEmail(
  options: AdminBookingRequestEmailOptions
): string {
  const { details, adminLink, siteUrl } = options;
  const guestName = escapeHtml(details.guestName);
  const propertyName = escapeHtml(details.propertyName);
  const detailsTable = buildBookingDetailsTable(details, 'admin');

  const ctaBlock = adminLink
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
        <tr>
          <td>
            <a href="${escapeHtml(adminLink)}" style="display:inline-block;background-color:${EMAIL_BRAND.green};color:#ffffff;font-size:15px;font-weight:600;line-height:1;text-decoration:none;padding:14px 28px;border-radius:8px;mso-padding-alt:0;">
              <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%;mso-text-raise:30pt">&nbsp;</i><![endif]-->
              <span style="mso-text-raise:15pt;">Review in admin</span>
              <!--[if mso]><i style="letter-spacing:28px;mso-font-width:-100%">&nbsp;</i><![endif]-->
            </a>
          </td>
        </tr>
      </table>`
    : '';

  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;font-weight:700;color:${EMAIL_BRAND.text};">New booking request</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.textMuted};">
      A guest submitted a booking request on the website for <strong style="color:${EMAIL_BRAND.text};">${propertyName}</strong>.
      This request is <strong>pending</strong> and is not a confirmed reservation until you approve it in admin.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;background-color:${EMAIL_BRAND.greenLight};border-left:4px solid ${EMAIL_BRAND.green};border-radius:0 6px 6px 0;">
      <tr>
        <td style="padding:14px 16px;">
          <p style="margin:0;font-size:14px;line-height:1.5;color:${EMAIL_BRAND.text};">
            <strong>Guest:</strong> ${guestName}<br />
            <strong>Reference:</strong> ${escapeHtml(details.bookingReference)}
          </p>
        </td>
      </tr>
    </table>
    ${detailsTable}
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.textMuted};">
      Review availability, update the request status, and follow up with the guest when ready.
    </p>
    ${ctaBlock}
  `;

  return wrapEmailLayout(content, {
    siteUrl,
    preheader: `New request from ${details.guestName} — ${details.propertyName}`,
  });
}
