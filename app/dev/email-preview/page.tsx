import { notFound } from 'next/navigation';
import EmailPreviewClient from '@/components/dev/EmailPreviewClient';
import { isEmailPreviewEnabled } from '@/lib/dev/is-email-preview-enabled';
import { renderAdminBookingRequestEmail } from '@/lib/email-templates/admin-booking-request';
import { renderGuestBookingRequestEmail } from '@/lib/email-templates/guest-booking-request';
import {
  SAMPLE_BOOKING_EMAIL_DETAILS,
  SAMPLE_EMAIL_PREVIEW_SITE_URL,
} from '@/lib/email-templates/sample-booking-details';

function buildPreviewSubjects(details: typeof SAMPLE_BOOKING_EMAIL_DETAILS) {
  return {
    admin: `New Booking Request – ${details.propertyName} – ${details.guestName}`,
    guest: 'Right Stay Africa – Booking Request Received (Not Confirmed)',
  };
}

type DevEmailPreviewPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function DevEmailPreviewPage({ searchParams }: DevEmailPreviewPageProps) {
  if (!isEmailPreviewEnabled()) {
    notFound();
  }

  const { tab } = await searchParams;
  const initialTab =
    tab === 'guest' ? 'guest' : tab === 'admin' ? 'admin' : tab === 'both' ? 'both' : 'both';

  const siteUrl =
    (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '') ||
    SAMPLE_EMAIL_PREVIEW_SITE_URL;
  const details = SAMPLE_BOOKING_EMAIL_DETAILS;
  const adminLink = `${siteUrl}/admin?tab=booking-requests`;
  const subjects = buildPreviewSubjects(details);

  const adminHtml = renderAdminBookingRequestEmail({
    details,
    adminLink,
    siteUrl,
  });
  const guestHtml = renderGuestBookingRequestEmail({ details, siteUrl });

  return (
    <EmailPreviewClient
      adminHtml={adminHtml}
      guestHtml={guestHtml}
      adminSubject={subjects.admin}
      guestSubject={subjects.guest}
      initialTab={initialTab}
    />
  );
}
