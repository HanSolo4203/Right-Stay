"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HeroBackgroundImage from '@/components/ui/HeroBackgroundImage';
import HeroPremiumFadeOverlay from '@/components/ui/HeroPremiumFadeOverlay';
import GlassAccommodationSearch from '@/components/search/GlassAccommodationSearch';
import {
  buildAccommodationSearchParams,
  getDefaultAccommodationDates,
  clearStoredAccommodationDatesOnPageReload,
  persistAccommodationDatesIfValid,
  setStoredAccommodationDates,
  validateAccommodationSearch,
  type AccommodationSearchForm,
} from '@/lib/accommodation-search';
import Link from 'next/link';
import { MARKETING_IMAGES } from '@/lib/marketing-images';
import { glassShadow } from '@/lib/glass-styles';
import { ArrowRight, ChevronRight } from 'lucide-react';

type HeroSectionProps = {
  initialLocations?: string[];
};

export default function HeroSection({ initialLocations = [] }: HeroSectionProps) {
  const router = useRouter();
  const [locations, setLocations] = useState<string[]>(initialLocations);
  const [loadingLocations, setLoadingLocations] = useState(initialLocations.length === 0);
  const [formData, setFormData] = useState<AccommodationSearchForm>(() => ({
    location: initialLocations[0] ?? '',
    checkIn: '',
    checkOut: '',
    guests: '2',
  }));

  useEffect(() => {
    clearStoredAccommodationDatesOnPageReload();
    const defaults = getDefaultAccommodationDates();
    setFormData((prev) => ({
      ...prev,
      checkIn: defaults.checkIn,
      checkOut: defaults.checkOut,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset to site defaults once on mount
  }, []);

  useEffect(() => {
    if (initialLocations.length > 0) {
      setLoadingLocations(false);
      return;
    }

    async function fetchLocations() {
      try {
        const response = await fetch('/api/properties/locations');
        const data = await response.json();
        if (data.locations && data.locations.length > 0) {
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

  return (
    <>
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

      <div className="z-10 relative">
        <div className="grid grid-cols-1 grid-rows-[minmax(0,1fr)] gap-12 md:px-8 md:pb-24 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-20 min-h-[calc(100vh-96px)] max-w-7xl mr-auto ml-auto pt-8 pr-6 pb-28 sm:pb-32 pl-6 gap-x-12 gap-y-12 items-center">
          <div className="col-span-7 flex flex-col justify-center items-start lg:items-center text-left lg:text-center" style={{ animation: 'fadeSlideIn 1.2s ease-out forwards' }}>
            <h1
              className="font-display drop-shadow-xl"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}
            >
              <span className="block text-2xl sm:text-3xl lg:text-[2.25rem] font-extralight italic text-white/95 tracking-[0.04em] leading-snug">
                Turn left and come right
              </span>
              <span className="mt-3 block text-lg sm:text-xl font-light uppercase tracking-[0.42em] text-white/80">
                with
              </span>
            </h1>

            <div className="mt-8" style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}>
              <Image
                src="/rsa-logo-white.png"
                alt="RSA Logo"
                width={552}
                height={166}
                sizes="(max-width: 640px) 80vw, 552px"
                className="opacity-90 h-auto w-full max-w-[min(552px,80vw)]"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center mt-10 gap-x-4 gap-y-4" style={{ animation: 'fadeSlideIn 1s ease-out 0.8s both' }}>
              <Link
                href="#accommodations"
                className={`inline-flex items-center justify-center gap-2 hover:bg-white/90 text-sm text-black tracking-tight bg-white rounded-xl pt-3 pr-5 pb-3 pl-5 ${glassShadow}`}
              >
                Explore Properties
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link
                href="/about"
                className={`inline-flex items-center justify-center gap-2 hover:bg-white/10 text-sm text-white/90 tracking-tight bg-white/5 border-white/15 border rounded-xl pt-3 pr-5 pb-3 pl-5 ${glassShadow}`}
              >
                Learn More
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          <div
            className="col-span-7 md:col-span-5 flex items-center justify-center w-full min-w-0"
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
    </>
  );
}

