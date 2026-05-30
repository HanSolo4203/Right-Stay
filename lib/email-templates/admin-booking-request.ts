import { EMAIL_BRAND } from './brand';
import { buildBookingDetailsTable } from './booking-details-table';
import {
  renderEmailCta,
  wrapGlassHighlightBlock,
} from './email-ui';
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

  const ctaBlock = adminLink ? renderEmailCta(adminLink, 'Review in admin') : '';

  const summaryBlock = wrapGlassHighlightBlock(
    `<p style="margin:0;font-size:14px;line-height:1.55;color:${EMAIL_BRAND.text};">
      <strong style="color:#ffffff;">Guest:</strong> ${guestName}<br />
      <strong style="color:#ffffff;">Reference:</strong> ${escapeHtml(details.bookingReference)}
    </p>`,
    { accentLeft: true }
  );

  const content = `
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:700;color:${EMAIL_BRAND.text};letter-spacing:-0.02em;">New booking request</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:${EMAIL_BRAND.textMuted};">
      A guest submitted a booking request on the website for <strong style="color:#ffffff;">${propertyName}</strong>.
      This request is <strong style="color:#ffffff;">pending</strong> and is not a confirmed reservation until you approve it in admin.
    </p>
    ${summaryBlock}
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
