"use client";

import { useState, useEffect, useRef, FormEvent, Suspense } from 'react';
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
import {
  buildAccommodationSearchParams,
  getDefaultAccommodationDates,
  getStoredAccommodationDates,
  hasActiveAccommodationSearch,
  isValidAccommodationDateRange,
  persistAccommodationDatesIfValid,
  setStoredAccommodationDates,
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

  const searchHydratedRef = useRef(false);

  const [formData, setFormData] = useState<AccommodationSearchForm>(() => ({
    location: locationFilter || initialLocations[0] || '',
    checkIn: checkIn || '',
    checkOut: checkOut || '',
    guests: guestsFilter || '2',
  }));

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
    const urlHasSearch = hasActiveAccommodationSearch({
      location: locationFilter,
      checkIn,
      checkOut,
    });

    if (urlHasSearch) {
      searchHydratedRef.current = true;
      setFormData({
        location: locationFilter,
        checkIn,
        checkOut,
        guests: guestsFilter || '2',
      });
      persistAccommodationDatesIfValid(
        checkIn,
        checkOut,
        guestsFilter,
        locationFilter
      );
      return;
    }

    if (searchHydratedRef.current) return;

    const stored = getStoredAccommodationDates();
    if (
      stored &&
      isValidAccommodationDateRange(stored.checkIn, stored.checkOut)
    ) {
      const location =
        stored.location || locationFilter || initialLocations[0] || '';
      const guests = stored.guests || guestsFilter || '2';

      if (location) {
        searchHydratedRef.current = true;
        router.replace(
          `/stay-with-us?${buildAccommodationSearchParams({
            location,
            checkIn: stored.checkIn,
            checkOut: stored.checkOut,
            guests,
          }).toString()}`,
          { scroll: false }
        );
        return;
      }
    }

    searchHydratedRef.current = true;
    const defaults = getDefaultAccommodationDates();
    setFormData((prev) => ({
      ...prev,
      location: prev.location || initialLocations[0] || '',
      checkIn: prev.checkIn || defaults.checkIn,
      checkOut: prev.checkOut || defaults.checkOut,
      guests: prev.guests || guestsFilter || '2',
    }));
  }, [
    locationFilter,
    checkIn,
    checkOut,
    guestsFilter,
    initialLocations,
    router,
  ]);

  const handleFormDataChange = (updates: Partial<AccommodationSearchForm>) => {
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      persistAccommodationDatesIfValid(
        next.checkIn,
        next.checkOut,
        next.guests,
        next.location
      );
      return next;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const error = validateAccommodationSearch(formData);
    if (error) {
      alert(error);
      return;
    }

    setStoredAccommodationDates({
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: formData.guests,
      location: formData.location,
    });

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
        <PremiumPageBackdrop />
        <div className="relative z-[1] min-h-screen">
          <PremiumBackgroundProvider>
            <div className="pt-12 sm:pt-[3.25rem]">
              <Suspense
                fallback={
                  <div className="py-16 text-center text-white/70">Loading accommodations...</div>
                }
              >
                <AccommodationCards
                  variant="dark"
                  layout="belowNav"
                  initialProperties={initialProperties}
                />
              </Suspense>
            </div>
          </PremiumBackgroundProvider>
          <Footer />
        </div>
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
            className="pointer-events-none object-cover"
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
