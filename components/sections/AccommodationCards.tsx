"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AnimateOnScroll from '@/components/ui/AnimateOnScroll';
import ListingImage from '@/components/ui/ListingImage';
import Link from 'next/link';
import { DEFAULT_PROPERTY_IMAGE, MARKETING_IMAGES } from '@/lib/marketing-images';
import type { CachedPropertyRecord } from '@/lib/properties-data';
import {
  extractLocationFromAttributes,
  propertyMatchesLocationFilter,
  resolvePropertyListingLocation,
} from '@/lib/property-location';
import { extractAmenitiesFromAttributes } from '@/lib/property-amenities';
import { buildPropertyBookUrl, readAccommodationSearchParams } from '@/lib/accommodation-search';
import { MapPin, Users, Bed, ArrowRight, Loader2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyData {
  id?: string;
  type?: string;
  attributes?: {
    name?: string;
    nickname?: string;
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    beds?: number;
    maximum_capacity?: number;
    currency?: string;
    description?: string;
    check_in_time?: number;
    check_out_time?: number;
    property_slug?: string;
    time_zone?: string;
    created_at?: string;
  };
  relationships?: {
    photos?: {
      data?: Array<{ id: string; type: string }>;
    };
    amenities?: {
      data?: Array<{ id: string; type: string }>;
    };
  };
}

interface PropertyPhoto {
  id: string;
  property_id: string;
  photo_id: string;
  url: string;
  caption: string | null;
  position: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
}

type CachedProperty = CachedPropertyRecord & { data: PropertyData };

type AccommodationCardsVariant = 'dark' | 'light';

type AccommodationCardsLayout = 'default' | 'belowNav';

type AccommodationCardsContentProps = {
  variant?: AccommodationCardsVariant;
  layout?: AccommodationCardsLayout;
  initialProperties?: CachedPropertyRecord[];
};

function sectionPaddingClass(layout: AccommodationCardsLayout, isLight: boolean) {
  const surface = isLight ? 'bg-gray-50' : 'bg-transparent';
  if (layout === 'belowNav') {
    return `isolate relative scroll-mt-24 pt-0 pb-12 sm:pb-14 lg:pb-16 ${surface}`;
  }
  return `isolate py-12 sm:py-14 lg:py-16 relative scroll-mt-24 ${surface}`;
}

function AccommodationCardsContent({
  variant = 'dark',
  layout = 'default',
  initialProperties,
}: AccommodationCardsContentProps) {
  const isLight = variant === 'light';
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<CachedProperty[]>(
    (initialProperties as CachedProperty[]) ?? []
  );
  const [loading, setLoading] = useState(!initialProperties?.length);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMap, setAvailabilityMap] = useState<Map<string, boolean>>(new Map());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<Map<string, number>>(new Map());
  const [datePricingMap, setDatePricingMap] = useState<
    Map<string, { total: number; nightly: number; nights: number }>
  >(new Map());

  const {
    location: locationFilter,
    checkIn,
    checkOut,
    guests: guestsParam,
  } = readAccommodationSearchParams(searchParams);
  const guestsFilter = guestsParam ? parseInt(guestsParam, 10) : null;

  const listingSearchQuery = {
    location: locationFilter,
    checkIn,
    checkOut,
    guests: guestsParam || '2',
  };

  useEffect(() => {
    if (initialProperties?.length) {
      const initialPhotoIndices = new Map<string, number>();
      initialProperties.forEach((property) => {
        initialPhotoIndices.set(property.uplisting_id, 0);
      });
      setCurrentPhotoIndex(initialPhotoIndices);
      return;
    }

    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          setProperties([]);
          return;
        }

        const result = await response.json();

        if (result.properties) {
          setProperties(result.properties);

          const initialPhotoIndices = new Map<string, number>();
          result.properties.forEach((property: CachedProperty) => {
            initialPhotoIndices.set(property.uplisting_id, 0);
          });
          setCurrentPhotoIndex(initialPhotoIndices);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [initialProperties]);

  // Check availability for properties when dates are provided
  useEffect(() => {
    // Clear availability map immediately when search params change to prevent stale results
    setAvailabilityMap(new Map());
    
    if (!checkIn || !checkOut || properties.length === 0) {
      setCheckingAvailability(false);
      return;
    }

    async function checkAvailability() {
      setCheckingAvailability(true);
      try {
        const response = await fetch('/api/check-availability/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyIds: properties.map((p) => p.uplisting_id),
            startDate: checkIn,
            endDate: checkOut,
          }),
        });

        const availability = new Map<string, boolean>();
        if (response.ok) {
          const data = await response.json();
          const map = data.availability as Record<string, boolean> | undefined;
          for (const property of properties) {
            availability.set(
              property.uplisting_id,
              map?.[property.uplisting_id] !== false
            );
          }
        } else {
          for (const property of properties) {
            availability.set(property.uplisting_id, true);
          }
        }
        setAvailabilityMap(availability);
      } catch (error) {
        console.error('Error checking batch availability:', error);
        const availability = new Map<string, boolean>();
        for (const property of properties) {
          availability.set(property.uplisting_id, true);
        }
        setAvailabilityMap(availability);
      } finally {
        setCheckingAvailability(false);
      }
    }

    checkAvailability();
  }, [checkIn, checkOut, properties]);

  useEffect(() => {
    if (!checkIn || !checkOut || properties.length === 0) {
      setDatePricingMap(new Map());
      return;
    }

    let cancelled = false;
    async function fetchDatePricing() {
      const entries = await Promise.all(
        properties.map(async (property) => {
          try {
            const response = await fetch(
              `/api/get-pricing?propertyId=${property.uplisting_id}&checkInDate=${checkIn}&checkOutDate=${checkOut}`
            );
            if (!response.ok) return [property.uplisting_id, null] as const;
            const data = await response.json();
            return [
              property.uplisting_id,
              {
                total: Number(data.total) || 0,
                nightly: Number(data.averagePricePerNight) || Number(data.basePrice) || 0,
                nights: Number(data.numberOfNights) || 0,
              },
            ] as const;
          } catch {
            return [property.uplisting_id, null] as const;
          }
        })
      );

      if (cancelled) return;
      const next = new Map<string, { total: number; nightly: number; nights: number }>();
      for (const [propertyId, quote] of entries) {
        if (quote) next.set(propertyId, quote);
      }
      setDatePricingMap(next);
    }

    fetchDatePricing();
    return () => {
      cancelled = true;
    };
  }, [checkIn, checkOut, properties]);

  // Fallback accommodations if no data from DB
  const fallbackAccommodations = [
    {
      id: '1',
      title: "Cape Town Luxury Villa",
      location: "Camps Bay, Cape Town",
      latitude: null,
      longitude: null,
      price: "R2,500",
      priceUnit: "per night",
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      image: MARKETING_IMAGES.coastalVilla,
      photos: [{ id: '1', url: MARKETING_IMAGES.coastalVilla, is_primary: true }],
      amenities: ["WiFi", "Parking", "Pool", "Ocean View"],
      description: "Stunning oceanfront villa with panoramic views of the Atlantic Ocean. Perfect for families and groups seeking luxury and comfort. This beautifully designed property features spacious living areas, modern amenities, and direct access to pristine beaches. Wake up to breathtaking sunrises and enjoy world-class dining just steps away.",
      shortDescription: "Stunning oceanfront villa with panoramic views of the Atlantic Ocean. Perfect for families and groups seeking luxury and comfort..."
    },
    {
      id: '2',
      title: "Safari Lodge Retreat",
      location: "Kruger National Park",
      latitude: null,
      longitude: null,
      price: "R4,200",
      priceUnit: "per night",
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      image: MARKETING_IMAGES.safariLodge,
      photos: [{ id: '2', url: MARKETING_IMAGES.safariLodge, is_primary: true }],
      amenities: ["WiFi", "Parking", "Safari", "Game Drives"],
      description: "Authentic safari experience with luxury accommodations. Wake up to the sounds of the African bush and spot the Big Five. Our professionally guided game drives offer unforgettable wildlife encounters. Experience traditional African hospitality in a modern, comfortable setting with gourmet meals and premium amenities.",
      shortDescription: "Authentic safari experience with luxury accommodations. Wake up to the sounds of the African bush and spot the Big Five..."
    },
    {
      id: '3',
      title: "Wine Estate Villa",
      location: "Stellenbosch, Western Cape",
      latitude: null,
      longitude: null,
      price: "R3,800",
      priceUnit: "per night",
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      image: MARKETING_IMAGES.wineEstate,
      photos: [{ id: '3', url: MARKETING_IMAGES.wineEstate, is_primary: true }],
      amenities: ["WiFi", "Parking", "Wine Tasting", "Vineyard Views"],
      description: "Elegant villa on a working wine estate. Enjoy wine tastings, vineyard tours, and breathtaking mountain views. This historic property combines old-world charm with contemporary luxury. Indulge in award-winning wines, farm-to-table cuisine, and explore one of South Africa's most beautiful wine regions.",
      shortDescription: "Elegant villa on a working wine estate. Enjoy wine tastings, vineyard tours, and breathtaking mountain views..."
    }
  ];

  // Transform Supabase data to accommodation format and apply filters
  const allAccommodations = properties.length > 0 
    ? properties.map((property) => {
        const data = property.data;
        const attributes = data.attributes || {};
        
        // Use real photos from database, fallback to placeholder if none available
        let photos = property.photos || [];
        // Sort photos so primary photo is first
        if (photos.length > 0) {
          photos = [...photos].sort((a, b) => {
            // Primary photo first
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            // Then by position
            return (a.position || 0) - (b.position || 0);
          });
        }
        const primaryPhoto = photos.find(p => p.is_primary) || photos[0];
        const firstImage = primaryPhoto?.url || DEFAULT_PROPERTY_IMAGE;
        
        // Determine display price
        let pricePrefix = 'R';
        if (attributes.currency === 'USD') {
          pricePrefix = '$';
        } else if (attributes.currency && attributes.currency !== 'ZAR') {
          pricePrefix = attributes.currency;
        }

        let priceValue: string;

        const dateQuote = datePricingMap.get(property.uplisting_id);

        if (dateQuote && dateQuote.nightly > 0) {
          priceValue = dateQuote.nightly.toLocaleString('en-ZA', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
        } else if (property.pricing?.startingNightlyPrice != null && property.pricing.startingNightlyPrice > 0) {
          priceValue = property.pricing.startingNightlyPrice.toLocaleString('en-ZA', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
        } else if (property.pricing?.pricingEnabled && property.pricing.basePrice != null) {
          const base = property.pricing.basePrice;
          priceValue = base.toLocaleString('en-ZA', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });
        } else {
          // Fallback when no pricing configured yet
          priceValue = attributes.currency === 'USD' ? '85' : '1,500';
        }

        const price =
          dateQuote && dateQuote.nightly > 0
            ? `${pricePrefix}${priceValue}`
            : `From ${pricePrefix}${priceValue}`;
        
        const fullDescription = attributes.description || `${attributes.type || 'Beautiful property'} in Cape Town. Perfect for your African getaway.`;
        
        const locationFields = extractLocationFromAttributes(
          attributes as Record<string, unknown>
        );
        const propertyLocation = resolvePropertyListingLocation(
          attributes as Record<string, unknown>
        );
        const maxGuests = attributes.maximum_capacity || 2;
        
        return {
          id: property.uplisting_id,
          title: attributes.name || attributes.nickname || "Luxury Property",
          location: propertyLocation,
          latitude: locationFields.latitude,
          longitude: locationFields.longitude,
          price: price,
          priceUnit:
            dateQuote && dateQuote.nights > 0 ? `for ${dateQuote.nights} nights` : "per night",
          guests: maxGuests,
          bedrooms: attributes.bedrooms || 1,
          bathrooms: attributes.bathrooms || 1,
          image: firstImage,
          photos: photos.length > 0 ? photos : [{ id: property.uplisting_id, url: firstImage, is_primary: true }],
          amenities: extractAmenitiesFromAttributes(attributes as Record<string, unknown>),
          description: fullDescription,
          shortDescription: fullDescription.substring(0, 150) + "...",
          propertyId: property.uplisting_id // Keep property ID for availability checking
        };
      })
    : fallbackAccommodations.map((acc) => ({ ...acc, propertyId: acc.id }));

  // Apply filters
  let filteredAccommodations = allAccommodations;

  // Filter by location
  if (locationFilter) {
    filteredAccommodations = filteredAccommodations.filter((acc) => {
      const property = properties.find((p) => p.uplisting_id === acc.propertyId);
      const attributes = (property?.data as { attributes?: Record<string, unknown> })?.attributes;
      return propertyMatchesLocationFilter(attributes, locationFilter);
    });
  }

  // Filter by guest capacity
  if (guestsFilter) {
    filteredAccommodations = filteredAccommodations.filter(acc => 
      acc.guests >= guestsFilter
    );
  }

  // Filter by availability (only if dates are provided AND availability check is complete)
  if (checkIn && checkOut && availabilityMap.size > 0 && !checkingAvailability) {
    filteredAccommodations = filteredAccommodations.filter(acc => {
      if (!acc.propertyId) return true; // Fallback accommodations are always shown
      const isAvailable = availabilityMap.get(acc.propertyId);
      return isAvailable !== false; // Show if available or unknown
    });
  }

  const accommodations = filteredAccommodations;

  const getCurrentPhotoIndex = useCallback(
    (accommodationId: string) => currentPhotoIndex.get(accommodationId) || 0,
    [currentPhotoIndex]
  );

  const setPhotoIndex = (accommodationId: string, index: number) => {
    setCurrentPhotoIndex((prev) => {
      const next = new Map(prev);
      next.set(accommodationId, index);
      return next;
    });
  };

  const goToPreviousPhoto = (accommodation: { id: string; photos?: Array<{ id?: string; url?: string }> }, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentIndex = getCurrentPhotoIndex(accommodation.id);
    if (currentIndex > 0) {
      setPhotoIndex(accommodation.id, currentIndex - 1);
    }
  };

  const goToNextPhoto = (accommodation: { id: string; photos?: Array<{ id?: string; url?: string }> }, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const photos = accommodation.photos || [];
    const currentIndex = getCurrentPhotoIndex(accommodation.id);
    if (currentIndex < photos.length - 1) {
      setPhotoIndex(accommodation.id, currentIndex + 1);
    }
  };

  // Show loading state when fetching properties or checking availability
  if (loading || (checkIn && checkOut && checkingAvailability)) {
    return (
      <section id="accommodations" className={sectionPaddingClass(layout, isLight)}>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className={`h-8 w-8 animate-spin ${isLight ? 'text-right-stay-500' : 'text-right-stay-400'}`} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="accommodations" className={sectionPaddingClass(layout, isLight)}>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div
          className={`text-center ${
            layout === 'belowNav' ? 'mb-4 sm:mb-6 lg:mb-8' : 'mb-8 sm:mb-12 lg:mb-16'
          }`}
        >
          <AnimateOnScroll
            as="p"
            delay={0.05}
            duration={0.8}
            className={`text-xs font-medium uppercase tracking-[0.28em] mb-3 ${
              isLight ? 'text-right-stay-600' : 'text-right-stay-400/90'
            }`}
          >
            Curated Collection
          </AnimateOnScroll>
          <AnimateOnScroll
            as="h2"
            delay={0.12}
            duration={0.9}
            className={`font-display text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl mb-4 ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
          >
            Premium Stays
          </AnimateOnScroll>
          <AnimateOnScroll
            as="p"
            delay={0.2}
            duration={0.9}
            className={`text-sm sm:text-base leading-relaxed max-w-3xl mx-auto ${
              isLight ? 'text-gray-600' : 'text-white/60'
            }`}
          >
            {locationFilter || checkIn || guestsFilter ? (
              <>
                {accommodations.length > 0 
                  ? `Found ${accommodations.length} available propert${accommodations.length === 1 ? 'y' : 'ies'}${locationFilter ? ` in ${locationFilter}` : ''}${checkIn && checkOut ? ` for ${checkIn} to ${checkOut}` : ''}${guestsFilter ? ` for ${guestsFilter} guest${guestsFilter > 1 ? 's' : ''}` : ''}.`
                  : `No properties found matching your search criteria.${locationFilter ? ` Try a different location.` : ''}`}
              </>
            ) : (
              properties.length > 0 
                ? `Browse our ${properties.length} curated properties from our Uplisting collection.` 
                : "Discover our curated collection of luxury properties across South Africa. From coastal villas to safari lodges, each accommodation offers an unforgettable experience."
            )}
          </AnimateOnScroll>
        </div>

        <div className={`grid gap-6 lg:gap-8 ${
          accommodations.length === 1 
            ? 'grid-cols-1 max-w-md mx-auto' 
            : accommodations.length === 2 
            ? 'grid-cols-1 sm:grid-cols-2' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {accommodations.map((accommodation, index) => {
            const photos = accommodation.photos || [];
            const currentIndex = getCurrentPhotoIndex(accommodation.id);
            const currentPhoto = photos[currentIndex] || { url: accommodation.image, id: accommodation.id };
            const hasMultiplePhotos = photos.length > 1;

            const cardDelay = 0.08 + Math.min(index, 9) * 0.05;

            return (
            <AnimateOnScroll
              key={accommodation.id}
              as="article"
              delay={cardDelay}
              className={`accommodation-card-shimmer group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1 ${
                isLight
                  ? 'border border-gray-200/90 shadow-[0_2px_8px_rgba(15,40,15,0.06),0_8px_28px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.04] hover:border-gray-300 hover:shadow-[0_4px_12px_rgba(15,40,15,0.08),0_16px_36px_rgba(0,0,0,0.14)]'
                  : 'border border-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.08),0_10px_32px_rgba(0,0,0,0.16)] ring-1 ring-white/20 hover:border-white/55 hover:shadow-[0_4px_14px_rgba(0,0,0,0.1),0_18px_44px_rgba(0,0,0,0.22)]'
              }`}
            >
              <span className="accommodation-card-shimmer-edge" aria-hidden />
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <ListingImage
                  src={currentPhoto.url || accommodation.image}
                  alt={accommodation.title}
                  variant="card"
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  key={currentPhoto.id || currentIndex}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />

                {hasMultiplePhotos && (
                  <>
                    {currentIndex > 0 && (
                      <button
                        type="button"
                        onClick={(e) => goToPreviousPhoto(accommodation, e)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md opacity-90 transition-opacity duration-200 hover:bg-white hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
                      </button>
                    )}

                    {currentIndex < photos.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => goToNextPhoto(accommodation, e)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md opacity-90 transition-opacity duration-200 hover:bg-white hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <h3 className="text-lg font-bold text-right-stay-800 mb-1.5 line-clamp-2 leading-snug">
                  {accommodation.title}
                </h3>

                <div className="flex items-center gap-1.5 text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{accommodation.location}</span>
                </div>

                <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-500 transition-all duration-500 group-hover:text-gray-600">
                  {accommodation.shortDescription || accommodation.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Bed className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {accommodation.bedrooms} bed{accommodation.bedrooms !== 1 ? 's' : ''} • {accommodation.bathrooms} bath{accommodation.bathrooms !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>Up to {accommodation.guests} guest{accommodation.guests !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <div className="mb-4">
                    <div className="text-xl font-bold text-gray-900">{accommodation.price}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{accommodation.priceUnit}</div>
                  </div>

                  <Link
                    href={buildPropertyBookUrl(accommodation.id, listingSearchQuery)}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-right-stay-500 px-4 py-3 font-semibold text-white transition-all duration-300 hover:gap-3 hover:bg-right-stay-600"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              <div
                className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-right-stay-500/0 transition-all duration-500 group-hover:ring-right-stay-400/35"
                aria-hidden
              />
            </AnimateOnScroll>
            );
          })}
        </div>

        {/* View All Button */}
        {!isLight && (
          <div className="text-center mt-8 sm:mt-10 lg:mt-12">
            <Link
              href="/accommodations"
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-2xl hover:bg-gray-800 transition-colors duration-200 min-h-11"
            >
              View All Accommodations
              <Calendar className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function AccommodationCardsFallback({
  variant = 'dark',
  layout = 'default',
}: {
  variant?: AccommodationCardsVariant;
  layout?: AccommodationCardsLayout;
}) {
  const isLight = variant === 'light';
  return (
    <section id="accommodations" className={sectionPaddingClass(layout, isLight)}>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-right-stay-400 animate-spin" />
        </div>
      </div>
    </section>
  );
}

type AccommodationCardsProps = {
  variant?: AccommodationCardsVariant;
  layout?: AccommodationCardsLayout;
  initialProperties?: CachedPropertyRecord[];
};

export default function AccommodationCards({
  variant = 'dark',
  layout = 'default',
  initialProperties,
}: AccommodationCardsProps) {
  return (
    <Suspense fallback={<AccommodationCardsFallback variant={variant} layout={layout} />}>
      <AccommodationCardsContent
        variant={variant}
        layout={layout}
        initialProperties={initialProperties}
      />
    </Suspense>
  );
}
