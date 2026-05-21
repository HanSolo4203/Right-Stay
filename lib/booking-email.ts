import { Resend } from 'resend';
import { renderAdminBookingRequestEmail } from '@/lib/email-templates/admin-booking-request';
import { renderGuestBookingRequestEmail } from '@/lib/email-templates/guest-booking-request';
import type { BookingEmailDetails } from '@/lib/email-templates/types';

export type { BookingEmailDetails };

export async function sendBookingRequestEmails(
  details: BookingEmailDetails
): Promise<{ adminSent: boolean; guestSent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.BOOKING_NOTIFICATION_EMAIL;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || 'Right Stay Africa <bookings@rightstayafrica.com>';

  const result = { adminSent: false, guestSent: false };

  if (!apiKey) {
    console.error('Booking email skipped: RESEND_API_KEY is not configured');
    return result;
  }

  const resend = new Resend(apiKey);
  const adminLink = siteUrl ? `${siteUrl}/admin?tab=booking-requests` : '';

  if (adminEmail) {
    try {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `New Booking Request – ${details.propertyName} – ${details.guestName}`,
        html: renderAdminBookingRequestEmail({
          details,
          adminLink,
          siteUrl,
        }),
      });
      if (error) {
        console.error('Failed to send admin booking notification:', error);
      } else {
        result.adminSent = true;
      }
    } catch (err) {
      console.error('Admin booking email error:', err);
    }
  } else {
    console.error('Booking email skipped: BOOKING_NOTIFICATION_EMAIL is not configured');
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: details.guestEmail,
      subject: 'Right Stay Africa – Booking Request Received (Not Confirmed)',
      html: renderGuestBookingRequestEmail({ details, siteUrl }),
    });
    if (error) {
      console.error('Failed to send guest booking confirmation:', error);
    } else {
      result.guestSent = true;
    }
  } catch (err) {
    console.error('Guest booking email error:', err);
  }

  return result;
}
