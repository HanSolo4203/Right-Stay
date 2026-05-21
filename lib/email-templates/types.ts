export interface BookingEmailDetails {
  bookingReference: string;
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
