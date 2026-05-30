import type { BookingEmailDetails } from './types';
import { EMAIL_BRAND } from './brand';
import { EMAIL_GLASS_SHADOW, glassPanelInlineStyle } from './email-ui';
import { escapeHtml } from './escape';

export type BookingDetailsVariant = 'admin' | 'guest';

function formatCurrencyZar(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function detailRow(label: string, value: string, isLast: boolean): string {
  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value);
  const border = isLast ? 'none' : `1px solid ${EMAIL_BRAND.border}`;
  return `<tr>
    <td class="details-label stack-column" valign="top" style="padding:12px 16px;border-bottom:${border};width:40%;font-size:14px;line-height:1.5;color:${EMAIL_BRAND.textLight};font-weight:500;">${safeLabel}</td>
    <td class="stack-column" valign="top" style="padding:12px 16px;border-bottom:${border};font-size:14px;line-height:1.5;color:${EMAIL_BRAND.text};font-weight:600;">${safeValue}</td>
  </tr>`;
}

export function buildBookingDetailsTable(
  details: BookingEmailDetails,
  variant: BookingDetailsVariant
): string {
  const sharedRows: [string, string][] = [
    ['Booking reference', details.bookingReference],
    ['Property', details.propertyName],
    ['Apartment', details.apartmentNumber],
    ['Check-in', formatDate(details.checkInDate)],
    ['Check-out', formatDate(details.checkOutDate)],
    ['Nights', String(details.numberOfNights)],
    ['Guests', String(details.numberOfGuests)],
    ['Estimated total', formatCurrencyZar(details.estimatedTotal)],
    ['Special requests', details.specialRequests?.trim() || '—'],
  ];

  const adminOnlyRows: [string, string][] = [
    ['Guest name', details.guestName],
    ['Guest email', details.guestEmail],
    ['Guest phone', details.guestPhone || '—'],
  ];

  const rows =
    variant === 'admin'
      ? [...sharedRows.slice(0, 1), ...adminOnlyRows, ...sharedRows.slice(1)]
      : sharedRows;

  const rowsHtml = rows
    .map(([label, value], index) => detailRow(label, value, index === rows.length - 1))
    .join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="${glassPanelInlineStyle(20)};border-collapse:separate;box-shadow:${EMAIL_GLASS_SHADOW};">
    <tr>
      <td style="padding:14px 18px;background-color:${EMAIL_BRAND.greenGlow};border-bottom:1px solid ${EMAIL_BRAND.glassBorder};border-radius:20px 20px 0 0;">
        <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${EMAIL_BRAND.text};">Request details</p>
      </td>
    </tr>
    <tr>
      <td style="padding:4px 0 8px;background-color:${EMAIL_BRAND.glassHighlight};border-radius:0 0 20px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
          ${rowsHtml}
        </table>
      </td>
    </tr>
  </table>`;
}
