import { EMAIL_BRAND } from './brand';
import { wrapGlassHighlightBlock } from './email-ui';
import { escapeHtml } from './escape';
import { wrapEmailLayout } from './layout';
import type { PropertyHostingDetails } from '@/lib/contact-form';
import { getContactSubjectLabel } from '@/lib/contact-form';

export interface AdminPropertyHostingEnquiryEmailOptions {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message?: string;
  property: PropertyHostingDetails;
  siteUrl?: string;
}

function detailRow(label: string, value: string, isLast: boolean): string {
  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value || '—');
  const border = isLast ? 'none' : `1px solid ${EMAIL_BRAND.border}`;

  return `<tr>
    <td class="details-label stack-column" valign="top" style="padding:12px 16px;border-bottom:${border};width:40%;font-size:14px;line-height:1.5;color:${EMAIL_BRAND.textLight};font-weight:500;">${safeLabel}</td>
    <td class="stack-column" valign="top" style="padding:12px 16px;border-bottom:${border};font-size:14px;line-height:1.5;color:${EMAIL_BRAND.text};font-weight:600;">${safeValue}</td>
  </tr>`;
}

function buildDetailsTable(title: string, rows: [string, string][]): string {
  const body = rows
    .map(([label, value], index) => detailRow(label, value, index === rows.length - 1))
    .join('');

  return `<h2 style="margin:0 0 12px;font-size:16px;line-height:1.4;font-weight:700;color:${EMAIL_BRAND.text};letter-spacing:-0.01em;">${escapeHtml(title)}</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px;border-collapse:collapse;background-color:${EMAIL_BRAND.glassBg};border:1px solid ${EMAIL_BRAND.border};border-radius:16px;overflow:hidden;">
      <tbody>${body}</tbody>
    </table>`;
}

export function renderAdminPropertyHostingEnquiryEmail(
  options: AdminPropertyHostingEnquiryEmailOptions
): string {
  const { name, email, company, subject, message, property, siteUrl } = options;
  const subjectLabel = getContactSubjectLabel(subject);

  const generalRows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Company', company?.trim() || '—'],
    ['Subject', subjectLabel],
    ['Message', message?.trim() || '—'],
  ];

  const ownerRows: [string, string][] = [
    ['Name', property.ownerName],
    ['Email', property.ownerEmail],
    ['Phone', property.ownerPhone],
  ];

  const propertyRows: [string, string][] = [
    ['Location', property.location],
    ['Area / Suburb', property.areaSuburb],
    ['Building', property.buildingName],
    ['Unit', property.unitNumber],
    ['Property Type', property.propertyType],
    ['Bedrooms', property.bedrooms],
    ['Bathrooms', property.bathrooms],
    ['Parking', property.parking],
    ['Furnishing', property.furnishingStatus],
    ['Listed On', property.currentlyListed],
    ['Start Date', property.preferredStartDate],
    ['Average Monthly Rental', property.monthlyRentalIncome],
    ['Condition', property.propertyCondition],
    ['WiFi', property.hasWifi],
    ['Washing Machine', property.hasWashingMachine],
    ['Air Conditioning', property.hasAirConditioning],
    ['Backup Power', property.hasBackupPower],
    ['Description', property.propertyDescription],
    ['Notes', property.additionalNotes],
  ];

  const summaryBlock = wrapGlassHighlightBlock(
    `<p style="margin:0;font-size:14px;line-height:1.55;color:${EMAIL_BRAND.text};">
      <strong style="color:#ffffff;">Owner:</strong> ${escapeHtml(property.ownerName)}<br />
      <strong style="color:#ffffff;">Area:</strong> ${escapeHtml(property.areaSuburb)}<br />
      <strong style="color:#ffffff;">Property:</strong> ${escapeHtml(property.propertyType)}
    </p>`,
    { accentLeft: true }
  );

  const content = `
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:700;color:${EMAIL_BRAND.text};letter-spacing:-0.02em;">New property hosting enquiry</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:${EMAIL_BRAND.textMuted};">
      A property owner submitted a hosting enquiry for <strong style="color:#ffffff;">${escapeHtml(property.location)}</strong>.
    </p>
    ${summaryBlock}
    ${buildDetailsTable('General Contact Info', generalRows)}
    ${buildDetailsTable('Owner Details', ownerRows)}
    ${buildDetailsTable('Property Hosting Information', propertyRows)}
  `;

  return wrapEmailLayout(content, {
    siteUrl,
    preheader: `Property hosting enquiry from ${property.ownerName} — ${property.areaSuburb}`,
  });
}
