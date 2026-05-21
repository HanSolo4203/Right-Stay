import type { BookingEmailDetails } from './types';
import { EMAIL_BRAND } from './brand';
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

function detailRow(label: string, value: string): string {
  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value);
  return `<tr>
    <td class="details-label stack-column" valign="top" style="padding:12px 16px;border-bottom:1px solid ${EMAIL_BRAND.border};width:40%;font-size:14px;line-height:1.5;color:${EMAIL_BRAND.textLight};font-weight:500;">${safeLabel}</td>
    <td class="stack-column" valign="top" style="padding:12px 16px;border-bottom:1px solid ${EMAIL_BRAND.border};font-size:14px;line-height:1.5;color:${EMAIL_BRAND.text};font-weight:600;">${safeValue}</td>
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
      ? [
          ...sharedRows.slice(0, 1),
          ...adminOnlyRows,
          ...sharedRows.slice(1),
        ]
      : sharedRows;

  const rowsHtml = rows.map(([label, value]) => detailRow(label, value)).join('');

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${EMAIL_BRAND.border};border-radius:8px;border-collapse:separate;background-color:${EMAIL_BRAND.greenLight};">
    <tr>
      <td style="padding:14px 16px;background-color:${EMAIL_BRAND.green};border-radius:8px 8px 0 0;">
        <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#ffffff;">Request details</p>
      </td>
    </tr>
    <tr>
      <td style="padding:0;background-color:#ffffff;border-radius:0 0 8px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
          ${rowsHtml}
        </table>
      </td>
    </tr>
  </table>`;
}
