import { EMAIL_BRAND } from './brand';
import { wrapGlassHighlightBlock } from './email-ui';
import { escapeHtml } from './escape';
import { wrapEmailLayout } from './layout';
import { getContactSubjectLabel } from '@/lib/contact-form';

export interface AdminContactEnquiryEmailOptions {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
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

export function renderAdminContactEnquiryEmail(options: AdminContactEnquiryEmailOptions): string {
  const { name, email, company, subject, message, siteUrl } = options;
  const subjectLabel = getContactSubjectLabel(subject);

  const rows: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Company', company?.trim() || '—'],
    ['Subject', subjectLabel],
    ['Message', message],
  ];

  const body = rows
    .map(([label, value], index) => detailRow(label, value, index === rows.length - 1))
    .join('');

  const summaryBlock = wrapGlassHighlightBlock(
    `<p style="margin:0;font-size:14px;line-height:1.55;color:${EMAIL_BRAND.text};">
      <strong style="color:#ffffff;">From:</strong> ${escapeHtml(name)}<br />
      <strong style="color:#ffffff;">Subject:</strong> ${escapeHtml(subjectLabel)}
    </p>`,
    { accentLeft: true }
  );

  const content = `
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:700;color:${EMAIL_BRAND.text};letter-spacing:-0.02em;">New contact enquiry</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:${EMAIL_BRAND.textMuted};">
      Someone submitted the Get In Touch form on the website.
    </p>
    ${summaryBlock}
    <h2 style="margin:0 0 12px;font-size:16px;line-height:1.4;font-weight:700;color:${EMAIL_BRAND.text};letter-spacing:-0.01em;">General Contact Info</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px;border-collapse:collapse;background-color:${EMAIL_BRAND.glassBg};border:1px solid ${EMAIL_BRAND.border};border-radius:16px;overflow:hidden;">
      <tbody>${body}</tbody>
    </table>
  `;

  return wrapEmailLayout(content, {
    siteUrl,
    preheader: `Contact enquiry from ${name} — ${subjectLabel}`,
  });
}
