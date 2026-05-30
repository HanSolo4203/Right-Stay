"use client";

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/sections/Header';
import AccommodationCards from '@/components/sections/AccommodationCards';
import PremiumBackgroundProvider from '@/components/premium/PremiumBackgroundProvider';
import PremiumPageBackdrop from '@/components/premium/PremiumPageBackdrop';
import Footer from '@/components/sections/Footer';
import Link from 'next/link';
import HeroBackgroundImage from '@/components/ui/HeroBackgroundImage';
import HeroPremiumFadeOverlay from '@/components/ui/HeroPremiumFadeOverlay';
import GlassAccommodationSearch from '@/components/search/GlassAccommodationSearch';
import MinimizedSearchHeader from '@/components/search/MinimizedSearchHeader';
import { getTodayISO } from '@/components/ui/GlassSearchDateRange';
import {
  buildAccommodationSearchParams,
  hasActiveAccommodationSearch,
  validateAccommodationSearch,
  type AccommodationSearchForm,
} from '@/lib/accommodation-search';
import { MARKETING_IMAGES } from '@/lib/marketing-images';
import type { CachedPropertyRecord } from '@/lib/properties-data';
import { ArrowLeft } from 'lucide-react';

type StayWithUsClientProps = {
  initialLocations: string[];
  initialProperties: CachedPropertyRecord[];
};

function StayWithUsContent({
  initialLocations,
  initialProperties,
}: StayWithUsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [locations, setLocations] = useState<string[]>(initialLocations);
  const [loadingLocations, setLoadingLocations] = useState(initialLocations.length === 0);

  const locationFilter = searchParams?.get('location') || '';
  const checkIn = searchParams?.get('checkIn') || '';
  const checkOut = searchParams?.get('checkOut') || '';
  const guestsFilter = searchParams?.get('guests') || '2';

  const isSearchResults = hasActiveAccommodationSearch({
    location: locationFilter,
    checkIn,
    checkOut,
  });

  const [formData, setFormData] = useState<AccommodationSearchForm>({
    location: locationFilter || initialLocations[0] || '',
    checkIn: checkIn || getTodayISO(),
    checkOut: checkOut,
    guests: guestsFilter,
  });

  useEffect(() => {
    if (initialLocations.length > 0) {
      setLoadingLocations(false);
      return;
    }

    async function fetchLocations() {
      try {
        const response = await fetch('/api/properties/locations');
        const data = await response.json();
        if (data.locations?.length > 0) {
          setLocations(data.locations);
          setFormData((prev) =>
            prev.location ? prev : { ...prev, location: data.locations[0] }
          );
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoadingLocations(false);
      }
    }

    fetchLocations();
  }, [initialLocations.length]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      location: locationFilter || prev.location,
      checkIn: checkIn || prev.checkIn || getTodayISO(),
      checkOut: checkOut || prev.checkOut,
      guests: guestsFilter || prev.guests,
    }));
  }, [locationFilter, checkIn, checkOut, guestsFilter]);

  const handleFormDataChange = (updates: Partial<AccommodationSearchForm>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const error = validateAccommodationSearch(formData);
    if (error) {
      alert(error);
      return;
    }

    const params = buildAccommodationSearchParams(formData);
    router.push(`/stay-with-us?${params.toString()}`);
  };

  if (isSearchResults) {
    return (
      <>
        <MinimizedSearchHeader
          formData={formData}
          onFormDataChange={handleFormDataChange}
          locations={locations}
          loadingLocations={loadingLocations}
          onSubmit={handleSubmit}
        />
        <main className="min-h-screen bg-gray-50">
          <Suspense
            fallback={
              <div className="py-16 text-center text-gray-600">Loading accommodations...</div>
            }
          >
            <AccommodationCards
              variant="light"
              initialProperties={initialProperties}
            />
          </Suspense>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className="isolate relative z-[1] min-h-[600px] overflow-x-hidden overflow-y-visible">
        <div className="absolute inset-0">
          <HeroBackgroundImage
            src={MARKETING_IMAGES.heroCapeTown}
            priority
            className="pointer-events-none object-cover motion-safe:[animation:cloudDrift_5s_ease-out_forwards]"
            style={{
              maskImage:
                'linear-gradient(to bottom, black 48%, rgba(0,0,0,0.75) 68%, rgba(0,0,0,0.25) 86%, transparent 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, black 48%, rgba(0,0,0,0.75) 68%, rgba(0,0,0,0.25) 86%, transparent 100%)',
            }}
          />
        </div>

        <Header />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div
              className="lg:col-span-7"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <h1 className="font-display sm:text-6xl lg:text-7xl text-4xl sm:text-5xl font-medium text-white tracking-tight mb-6">
                Premium Accommodations
              </h1>
              <p className="sm:text-xl text-lg leading-relaxed text-white/90 max-w-3xl">
                Browse our carefully curated collection of luxury properties across South Africa.
                Each accommodation is verified for quality, comfort, and exceptional experiences.
              </p>
            </div>

            <div
              className="lg:col-span-5 flex items-center justify-center w-full"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}
            >
              <GlassAccommodationSearch
                formData={formData}
                onFormDataChange={handleFormDataChange}
                locations={locations}
                loadingLocations={loadingLocations}
                onSubmit={handleSubmit}
                className="max-w-2xl"
              />
            </div>
          </div>
        </div>

        <HeroPremiumFadeOverlay />
      </section>
      <PremiumPageBackdrop />
      <PremiumBackgroundProvider className="premium-content-stack">
        <div className="pt-[var(--premium-hero-overlap)]">
          <Suspense fallback={<div className="py-16 text-center">Loading accommodations...</div>}>
            <AccommodationCards initialProperties={initialProperties} />
          </Suspense>
        </div>
      </PremiumBackgroundProvider>
      <Footer />
    </>
  );
}

export default function StayWithUsClient(props: StayWithUsClientProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <StayWithUsContent {...props} />
    </Suspense>
  );
}
