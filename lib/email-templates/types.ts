export interface BookingEmailDetails {
  bookingReference: string;
  /** Uplisting id — used for guest links such as Things To Do near the stay. */
  propertyId?: string;
  propertyName: string;
  apartmentNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfGuests: number;
  estimatedTotal: number;
  specialRequests: string | null;
}
