import { EMAIL_BRAND } from './brand';
import { getSiteContactEmail } from '@/lib/site-contact';
import { buildBookingDetailsTable } from './booking-details-table';
import {
  wrapGlassHighlightBlock,
  wrapGlassNoticeBlock,
} from './email-ui';
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
  const contactEmail = getSiteContactEmail();
  const contactLine = contactEmail
    ? `<span style="color:${EMAIL_BRAND.textMuted};"> with next steps. If you need to make changes, reply to this email or contact us at</span>
      <a href="mailto:${escapeHtml(contactEmail)}" style="color:${EMAIL_BRAND.green};text-decoration:none;font-weight:600;">${escapeHtml(contactEmail)}</a>.`
    : `<span style="color:${EMAIL_BRAND.textMuted};"> with next steps. If you need to make changes, reply to this email.</span>`;

  const noticeBlock = wrapGlassNoticeBlock(`
    <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_BRAND.noticeText};">Important</p>
    <p style="margin:0;font-size:15px;line-height:1.55;color:${EMAIL_BRAND.noticeText};">
      <strong>This is a booking request, not a confirmed reservation.</strong>
      Your stay is not booked until Right Stay Africa confirms availability and sends you a confirmation.
      No payment or reservation is final based on this email alone.
    </p>
  `);

  const nextStepsBlock = wrapGlassHighlightBlock(`
    <p style="margin:0;font-size:14px;line-height:1.65;color:${EMAIL_BRAND.text};">
      <strong style="color:#ffffff;">What happens next?</strong><br />
      <span style="color:${EMAIL_BRAND.textMuted};">We will check availability for your dates and contact you at</span>
      <a href="mailto:${escapeHtml(details.guestEmail)}" style="color:${EMAIL_BRAND.green};text-decoration:none;font-weight:600;">${escapeHtml(details.guestEmail)}</a>${contactLine}
    </p>
  `);

  const content = `
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:700;color:${EMAIL_BRAND.text};letter-spacing:-0.02em;">Booking request received</h1>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.65;color:${EMAIL_BRAND.textMuted};">
      Hi ${guestName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:${EMAIL_BRAND.textMuted};">
      Thank you for choosing Right Stay Africa. We have received your booking request and our team will review it shortly.
    </p>
    ${noticeBlock}
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${EMAIL_BRAND.textMuted};">
      Please keep this email for your records. Summary of your request:
    </p>
    ${detailsTable}
    ${nextStepsBlock}
  `;

  return wrapEmailLayout(content, {
    siteUrl,
    preheader: 'Your booking request was received — not yet confirmed',
  });
}
