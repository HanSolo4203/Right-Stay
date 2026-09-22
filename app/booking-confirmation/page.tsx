import { isGuideEnabled, isToursEnabled } from '@/lib/public-site-settings';
import BookingConfirmationClient from './BookingConfirmationClient';

export default async function BookingConfirmationPage() {
  const [toursEnabled, guideEnabled] = await Promise.all([
    isToursEnabled(),
    isGuideEnabled(),
  ]);
  return <BookingConfirmationClient toursEnabled={toursEnabled} guideEnabled={guideEnabled} />;
}
