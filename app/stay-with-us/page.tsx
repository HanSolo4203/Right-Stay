import { Suspense } from 'react';
import { getCachedProperties, getCachedPropertyLocations } from '@/lib/properties-data';
import { isGuideEnabled, isToursEnabled } from '@/lib/public-site-settings';
import StayWithUsClient from './StayWithUsClient';

export default async function StayWithUsPage() {
  const [initialLocations, initialProperties, toursEnabled, guideEnabled] = await Promise.all([
    getCachedPropertyLocations(),
    getCachedProperties(),
    isToursEnabled(),
    isGuideEnabled(),
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
        toursEnabled={toursEnabled}
        guideEnabled={guideEnabled}
      />
    </Suspense>
  );
}
