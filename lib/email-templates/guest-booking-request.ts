import { EMAIL_BRAND, EMAIL_CONTACT } from './brand';
import { buildBookingDetailsTable } from './booking-details-table';
import { escapeHtml } from './escape';
import { wrapEmailLayout } from './layout';
import type { BookingEmailDetails } from './types';

export interface GuestBookingRequestEmailOptions {
  details: BookingEmailDetails;
  siteUrl?: string;
}

export function renderGuestBookingRequestEmail(
  options: GuestBookingRequestEmailOptions
): string {
  const { details, siteUrl } = options;
  const guestName = escapeHtml(details.guestName);
  const detailsTable = buildBookingDetailsTable(details, 'guest');

  const content = `
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;font-weight:700;color:${EMAIL_BRAND.text};">Booking request received</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.textMuted};">
      Hi ${guestName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.textMuted};">
      Thank you for choosing Right Stay Africa. We have received your booking request and our team will review it shortly.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px;background-color:${EMAIL_BRAND.noticeBg};border:1px solid ${EMAIL_BRAND.noticeBorder};border-radius:8px;">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;color:${EMAIL_BRAND.noticeText};">Important</p>
          <p style="margin:0;font-size:15px;line-height:1.55;color:${EMAIL_BRAND.noticeText};">
            <strong>This is a booking request, not a confirmed reservation.</strong>
            Your stay is not booked until Right Stay Africa confirms availability and sends you a confirmation.
            No payment or reservation is final based on this email alone.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.textMuted};">
      Please keep this email for your records. Summary of your request:
    </p>
    ${detailsTable}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 0;">
      <tr>
        <td style="padding:16px;background-color:${EMAIL_BRAND.greenLight};border-radius:8px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.text};">
            <strong>What happens next?</strong><br />
            We will check availability for your dates and contact you at
            <a href="mailto:${escapeHtml(details.guestEmail)}" style="color:${EMAIL_BRAND.green};text-decoration:none;font-weight:600;">${escapeHtml(details.guestEmail)}</a>
            with next steps. If you need to make changes, reply to this email or contact us at
            <a href="mailto:${EMAIL_CONTACT}" style="color:${EMAIL_BRAND.green};text-decoration:none;font-weight:600;">${EMAIL_CONTACT}</a>.
          </p>
        </td>
      </tr>
    </table>
  `;

  return wrapEmailLayout(content, {
    siteUrl,
    preheader: 'Your booking request was received — not yet confirmed',
  });
}
