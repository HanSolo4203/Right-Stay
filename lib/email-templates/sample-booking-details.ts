import type { BookingEmailDetails } from './types';

/** Fixture data for /dev/email-preview and local HTML exports. */
export const SAMPLE_BOOKING_EMAIL_DETAILS: BookingEmailDetails = {
  bookingReference: 'RS-PREVIEW-001',
  propertyName: 'Ocean View Apartment',
  apartmentNumber: '4B',
  guestName: 'Jane Doe',
  guestEmail: 'jane@example.com',
  guestPhone: '+27 82 123 4567',
  checkInDate: '2026-06-01',
  checkOutDate: '2026-06-05',
  numberOfNights: 4,
  numberOfGuests: 2,
  estimatedTotal: 8500,
  specialRequests: 'Late check-in please',
};

export const SAMPLE_EMAIL_PREVIEW_SITE_URL = 'http://localhost:3000';
