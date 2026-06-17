import { Suspense } from 'react';
import { isToursEnabled } from '@/lib/public-site-settings';
import BookingPageClient from './BookingPageClient';

export default async function BookPropertyPage() {
  const toursEnabled = await isToursEnabled();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-right-stay-200 border-t-right-stay-500"
            aria-hidden
          />
        </div>
      }
    >
      <BookingPageClient toursEnabled={toursEnabled} />
    </Suspense>
  );
}
