import { isToursEnabled } from '@/lib/public-site-settings';
import BookingConfirmationClient from './BookingConfirmationClient';

export default async function BookingConfirmationPage() {
  const toursEnabled = await isToursEnabled();
  return <BookingConfirmationClient toursEnabled={toursEnabled} />;
}
