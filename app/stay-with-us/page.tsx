import { Suspense } from 'react';
import { getCachedProperties, getCachedPropertyLocations } from '@/lib/properties-data';
import StayWithUsClient from './StayWithUsClient';

export default async function StayWithUsPage() {
  const [initialLocations, initialProperties] = await Promise.all([
    getCachedPropertyLocations(),
    getCachedProperties(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <StayWithUsClient
        initialLocations={initialLocations}
        initialProperties={initialProperties}
      />
    </Suspense>
  );
}
