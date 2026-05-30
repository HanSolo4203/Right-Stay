import { Resend } from 'resend';
import {
  getContactSubjectLabel,
  isPropertyHostingSubject,
  type ContactFormPayload,
} from '@/lib/contact-form';
import { renderAdminContactEnquiryEmail } from '@/lib/email-templates/admin-contact-enquiry';
import { renderAdminPropertyHostingEnquiryEmail } from '@/lib/email-templates/admin-property-hosting-enquiry';

export async function sendContactFormEmail(payload: ContactFormPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail =
    process.env.BOOKING_NOTIFICATION_EMAIL?.trim() ||
    process.env.SITE_CONTACT_EMAIL?.trim();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || 'Right Stay Africa <bookings@rightstayafrica.com>';

  if (!apiKey) {
    console.error('Contact email skipped: RESEND_API_KEY is not configured');
    return false;
  }

  if (!adminEmail) {
    console.error('Contact email skipped: BOOKING_NOTIFICATION_EMAIL is not configured');
    return false;
  }

  const resend = new Resend(apiKey);
  const isPropertyHosting = isPropertyHostingSubject(payload.subject);
  const subjectLabel = getContactSubjectLabel(payload.subject);

  const emailSubject = isPropertyHosting
    ? 'New Property Hosting Enquiry - Cape Town'
    : `New Contact Enquiry - ${subjectLabel}`;

  const html = isPropertyHosting && payload.propertyHosting
    ? renderAdminPropertyHostingEnquiryEmail({
        name: payload.name,
        email: payload.email,
        company: payload.company,
        subject: payload.subject,
        message: payload.message,
        property: payload.propertyHosting,
        siteUrl,
      })
    : renderAdminContactEnquiryEmail({
        name: payload.name,
        email: payload.email,
        company: payload.company,
        subject: payload.subject,
        message: payload.message,
        siteUrl,
      });

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      replyTo: payload.email,
      subject: emailSubject,
      html,
    });

    if (error) {
      console.error('Failed to send contact form notification:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Contact form email error:', err);
    return false;
  }
}
