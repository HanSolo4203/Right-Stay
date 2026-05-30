import { Suspense } from 'react';
import BookingPageClient from './BookingPageClient';

export default function BookPropertyPage() {
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
      <BookingPageClient />
    </Suspense>
  );
}
