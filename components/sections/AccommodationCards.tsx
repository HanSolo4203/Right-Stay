"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Star, MapPin, Users, Calendar, Wifi, Car, Coffee, Shield, Eye, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import QuickViewModal from '@/components/QuickViewModal';
import { listingImageSrc } from '@/lib/listing-image';

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

interface CachedProperty {
  id: string;
  uplisting_id: string;
  data: PropertyData;
  last_synced: string;
  created_at: string;
  updated_at: string;
  photos?: PropertyPhoto[];
  pricing?: {
    propertyId: string;
    minPrice: number | null;
    basePrice: number | null;
    maxPrice: number | null;
    pricingEnabled: boolean;
  } | null;
}

export default function AccommodationCards() {
  useScrollAnimation();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<CachedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [quickViewProperty, setQuickViewProperty] = useState<any | null>(null);
  const [availabilityMap, setAvailabilityMap] = useState<Map<string, boolean>>(new Map());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<Map<string, number>>(new Map());
  const [touchStart, setTouchStart] = useState<Map<string, number>>(new Map());
  const [touchEnd, setTouchEnd] = useState<Map<string, number>>(new Map());
  const [datePricingMap, setDatePricingMap] = useState<
    Map<string, { total: number; nightly: number; nights: number }>
  >(new Map());

  // Get search filters from URL
  const locationFilter = searchParams?.get('location') || '';
  const checkIn = searchParams?.get('checkIn') || '';
  const checkOut = searchParams?.get('checkOut') || '';
  const guestsFilter = searchParams?.get('guests') ? parseInt(searchParams.get('guests')!) : null;

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties');
        
        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('Response is not JSON, content-type:', contentType);
          // If not JSON, likely an error page, so use fallback data
          setProperties([]);
          return;
        }
        
        const result = await response.json();
        
        console.log('API Response:', result);
        
        if (result.properties) {
          console.log('Properties found:', result.properties.length);
          setProperties(result.properties);
          
          // Initialize photo indices to 0 (primary photos will be sorted to first position)
          const initialPhotoIndices = new Map<string, number>();
          result.properties.forEach((property: CachedProperty) => {
            initialPhotoIndices.set(property.uplisting_id, 0);
          });
          setCurrentPhotoIndex(initialPhotoIndices);
        } else if (result.error) {
          console.error('API returned error:', result.error);
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
  }, []);

  // Check availability for properties when dates are provided
  useEffect(() => {
    // Clear availability map immediately when search params change to prevent stale results
    setAvailabilityMap(new Map());
    
    if (!checkIn || !checkOut || properties.length === 0) {
      setCheckingAvailability(false);
      return;
    }

    async function checkAvailability() {
      setCheckingAvailability(true); // Set loading state
      const availability = new Map<string, boolean>();
      const checkPromises = properties.map(async (property) => {
        try {
          const response = await fetch(
            `/api/check-availability?propertyId=${property.uplisting_id}&startDate=${checkIn}&endDate=${checkOut}`
          );
          if (response.ok) {
            const data = await response.json();
            availability.set(property.uplisting_id, data.available);
          } else {
            // If check fails, assume available (don't hide properties due to API errors)
            availability.set(property.uplisting_id, true);
          }
        } catch (error) {
          console.error(`Error checking availability for ${property.uplisting_id}:`, error);
          // On error, assume available (don't hide properties due to API errors)
          availability.set(property.uplisting_id, true);
        }
      });

      await Promise.all(checkPromises);
      setAvailabilityMap(availability);
      setCheckingAvailability(false); // Clear loading state
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
      price: "R2,500",
      priceUnit: "per night",
      rating: 4.9,
      reviews: 127,
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      image: "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg",
      photos: [{ id: '1', url: "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg", is_primary: true }],
      amenities: ["WiFi", "Parking", "Pool", "Ocean View"],
      description: "Stunning oceanfront villa with panoramic views of the Atlantic Ocean. Perfect for families and groups seeking luxury and comfort. This beautifully designed property features spacious living areas, modern amenities, and direct access to pristine beaches. Wake up to breathtaking sunrises and enjoy world-class dining just steps away.",
      shortDescription: "Stunning oceanfront villa with panoramic views of the Atlantic Ocean. Perfect for families and groups seeking luxury and comfort..."
    },
    {
      id: '2',
      title: "Safari Lodge Retreat",
      location: "Kruger National Park",
      price: "R4,200",
      priceUnit: "per night",
      rating: 4.8,
      reviews: 89,
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      image: "/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_3840w_1.jpg",
      photos: [{ id: '2', url: "/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_3840w_1.jpg", is_primary: true }],
      amenities: ["WiFi", "Parking", "Safari", "Game Drives"],
      description: "Authentic safari experience with luxury accommodations. Wake up to the sounds of the African bush and spot the Big Five. Our professionally guided game drives offer unforgettable wildlife encounters. Experience traditional African hospitality in a modern, comfortable setting with gourmet meals and premium amenities.",
      shortDescription: "Authentic safari experience with luxury accommodations. Wake up to the sounds of the African bush and spot the Big Five..."
    },
    {
      id: '3',
      title: "Wine Estate Villa",
      location: "Stellenbosch, Western Cape",
      price: "R3,800",
      priceUnit: "per night",
      rating: 4.9,
      reviews: 156,
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      image: "/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg",
      photos: [{ id: '3', url: "/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg", is_primary: true }],
      amenities: ["WiFi", "Parking", "Wine Tasting", "Vineyard Views"],
      description: "Elegant villa on a working wine estate. Enjoy wine tastings, vineyard tours, and breathtaking mountain views. This historic property combines old-world charm with contemporary luxury. Indulge in award-winning wines, farm-to-table cuisine, and explore one of South Africa's most beautiful wine regions.",
      shortDescription: "Elegant villa on a working wine estate. Enjoy wine tastings, vineyard tours, and breathtaking mountain views..."
    }
  ];

  // Helper function to extract location from property
  const extractLocation = (property: CachedProperty): string => {
    const data = property.data;
    const attributes = data?.attributes || {};
    const description = attributes.description || '';
    const name = attributes.name || attributes.nickname || '';
    
    // Try to extract location from description or name
    const locationPatterns = [
      /Cape Town/gi,
      /Kruger/gi,
      /Stellenbosch/gi,
      /Johannesburg/gi,
      /Durban/gi,
      /Pretoria/gi,
    ];
    
    for (const pattern of locationPatterns) {
      const match = description.match(pattern) || name.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    // Default to Cape Town
    return 'Cape Town';
  };

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
        const firstImage = primaryPhoto?.url || "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg";
        
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
        } else if (property.pricing?.pricingEnabled && property.pricing.basePrice != null) {
          // Use dynamic pricing base price
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
          dateQuote && dateQuote.total > 0
            ? `${pricePrefix}${Math.round(dateQuote.total).toLocaleString('en-ZA')}`
            : `From ${pricePrefix}${priceValue}`;
        
        const fullDescription = attributes.description || `${attributes.type || 'Beautiful property'} in Cape Town. Perfect for your African getaway.`;
        
        const propertyLocation = extractLocation(property);
        const maxGuests = attributes.maximum_capacity || 2;
        
        return {
          id: property.uplisting_id,
          title: attributes.name || attributes.nickname || "Luxury Property",
          location: propertyLocation,
          price: price,
          priceUnit:
            dateQuote && dateQuote.nights > 0 ? `for ${dateQuote.nights} nights` : "per night",
          rating: 4.8,
          reviews: Math.floor(Math.random() * 100) + 50,
          guests: maxGuests,
          bedrooms: attributes.bedrooms || 1,
          bathrooms: attributes.bathrooms || 1,
          image: firstImage,
          photos: photos.length > 0 ? photos : [{ id: property.uplisting_id, url: firstImage, is_primary: true }],
          amenities: ["WiFi", "Parking", "Air Conditioning", "Kitchen"],
          description: fullDescription,
          shortDescription: fullDescription.substring(0, 150) + "...",
          propertyId: property.uplisting_id // Keep property ID for availability checking
        };
      })
    : fallbackAccommodations.map(acc => ({ ...acc, propertyId: acc.id || null }));

  // Apply filters
  let filteredAccommodations = allAccommodations;

  // Filter by location
  if (locationFilter) {
    filteredAccommodations = filteredAccommodations.filter(acc => 
      acc.location.toLowerCase().includes(locationFilter.toLowerCase())
    );
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

  // Photo navigation functions
  const getCurrentPhotoIndex = useCallback((accommodationId: string) => {
    return currentPhotoIndex.get(accommodationId) || 0;
  }, [currentPhotoIndex]);

  const setPhotoIndex = (accommodationId: string, index: number) => {
    setCurrentPhotoIndex(prev => {
      const newMap = new Map(prev);
      newMap.set(accommodationId, index);
      return newMap;
    });
  };

  const goToPreviousPhoto = (accommodation: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const currentIndex = getCurrentPhotoIndex(accommodation.id);
    const photos = accommodation.photos || [];
    if (photos.length > 0 && currentIndex > 0) {
      setPhotoIndex(accommodation.id, currentIndex - 1);
    }
  };

  const goToNextPhoto = (accommodation: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const currentIndex = getCurrentPhotoIndex(accommodation.id);
    const photos = accommodation.photos || [];
    if (photos.length > 0 && currentIndex < photos.length - 1) {
      setPhotoIndex(accommodation.id, currentIndex + 1);
    }
  };

  const goToPhoto = (accommodation: any, index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPhotoIndex(accommodation.id, index);
  };

  // Swipe gesture handlers
  const minSwipeDistance = 50;

  const onTouchStart = (accommodationId: string, e: React.TouchEvent) => {
    setTouchEnd(prev => {
      const newMap = new Map(prev);
      newMap.delete(accommodationId);
      return newMap;
    });
    setTouchStart(prev => {
      const newMap = new Map(prev);
      newMap.set(accommodationId, e.targetTouches[0].clientX);
      return newMap;
    });
  };

  const onTouchMove = (accommodationId: string, e: React.TouchEvent) => {
    setTouchEnd(prev => {
      const newMap = new Map(prev);
      newMap.set(accommodationId, e.targetTouches[0].clientX);
      return newMap;
    });
  };

  const onTouchEnd = (accommodation: any) => {
    const start = touchStart.get(accommodation.id);
    const end = touchEnd.get(accommodation.id);
    
    if (start === undefined || end === undefined) return;
    
    const distance = start - end;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextPhoto(accommodation);
    } else if (isRightSwipe) {
      goToPreviousPhoto(accommodation);
    }

    // Clean up
    setTouchStart(prev => {
      const newMap = new Map(prev);
      newMap.delete(accommodation.id);
      return newMap;
    });
    setTouchEnd(prev => {
      const newMap = new Map(prev);
      newMap.delete(accommodation.id);
      return newMap;
    });
  };

  // Keyboard navigation - only for single property view
  useEffect(() => {
    if (accommodations.length !== 1) return;
    
    const visibleAccommodation = accommodations[0];
    if (!visibleAccommodation) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIndex = getCurrentPhotoIndex(visibleAccommodation.id);
        const photos = visibleAccommodation.photos || [];
        if (photos.length > 0 && currentIndex > 0) {
          setPhotoIndex(visibleAccommodation.id, currentIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIndex = getCurrentPhotoIndex(visibleAccommodation.id);
        const photos = visibleAccommodation.photos || [];
        if (photos.length > 0 && currentIndex < photos.length - 1) {
          setPhotoIndex(visibleAccommodation.id, currentIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [accommodations, getCurrentPhotoIndex]);

  // Show loading state when fetching properties or checking availability
  if (loading || (checkIn && checkOut && checkingAvailability)) {
    return (
      <section className="isolate py-16 sm:py-20 lg:py-24 relative bg-gray-50">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-right-stay-500 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  console.log('Rendering AccommodationCards with:', { 
    properties: properties.length, 
    loading, 
    accommodations: accommodations.length,
    accommodationsData: accommodations
  });

  return (
    <section className="isolate py-16 sm:py-20 lg:py-24 relative bg-gray-50">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <p 
            className="text-sm sm:text-base leading-relaxed text-gray-600 max-w-3xl mx-auto"
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
          </p>
        </div>

        <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${
          accommodations.length === 1 
            ? 'grid-cols-1' 
            : accommodations.length === 2 
            ? 'grid-cols-1 sm:grid-cols-2' 
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {accommodations.map((accommodation, index) => (
            <div
              key={accommodation.id}
              className={`group rounded-3xl border border-gray-200 bg-white shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] hover:shadow-[0_4px_6px_rgba(0,_0,_0,_0.1),_0_10px_15px_rgba(0,_0,_0,_0.1)] transition-all duration-300 overflow-hidden ${
                accommodations.length === 1 
                  ? 'flex flex-row h-auto' 
                  : 'flex flex-col h-full'
              }`}
            >
              {/* Photo Gallery */}
              <div 
                className={`relative overflow-hidden ${
                  accommodations.length === 1
                    ? 'w-1/2 h-auto min-h-[400px] rounded-l-3xl'
                    : 'h-32 sm:h-48 lg:h-64 rounded-t-3xl'
                }`}
                onTouchStart={(e) => onTouchStart(accommodation.id, e)}
                onTouchMove={(e) => onTouchMove(accommodation.id, e)}
                onTouchEnd={() => onTouchEnd(accommodation)}
              >
                {(() => {
                  const photos = accommodation.photos || [];
                  const currentIndex = getCurrentPhotoIndex(accommodation.id);
                  const currentPhoto = photos[currentIndex] || { url: accommodation.image, id: accommodation.id };
                  const hasMultiplePhotos = photos.length > 1;

                  return (
                    <>
                      {/* Main Image */}
                      <div 
                        className="relative w-full h-full cursor-pointer"
                        onClick={() => setQuickViewProperty(accommodation)}
                      >
                        <Image
                          src={listingImageSrc(
                            currentPhoto.url || accommodation.image,
                            'card'
                          )}
                          alt={accommodation.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-opacity duration-300"
                          key={currentPhoto.id}
                          priority={index < 6}
                          quality={78}
                        />
                        
                        {/* Rating Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-semibold text-gray-900">{accommodation.rating}</span>
                          </div>
                        </div>

                        {/* Guest Count Badge */}
                        <div className="absolute bottom-4 left-4 z-10">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">{accommodation.guests} guests</span>
                          </div>
                        </div>

                        {/* Photo Counter */}
                        {hasMultiplePhotos && (
                          <div className="absolute top-4 left-4 z-10">
                            <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                              <span className="text-sm font-medium text-white">
                                {currentIndex + 1} / {photos.length}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Navigation Arrows */}
                        {hasMultiplePhotos && (
                          <>
                            {/* Left Arrow */}
                            {currentIndex > 0 && (
                              <button
                                onClick={(e) => goToPreviousPhoto(accommodation, e)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-200 touch-manipulation"
                                aria-label="Previous photo"
                              >
                                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
                              </button>
                            )}

                            {/* Right Arrow */}
                            {currentIndex < photos.length - 1 && (
                              <button
                                onClick={(e) => goToNextPhoto(accommodation, e)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all duration-200 touch-manipulation"
                                aria-label="Next photo"
                              >
                                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Thumbnail Strip */}
                      {hasMultiplePhotos && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-3 z-10">
                          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
                            {photos.map((photo: any, thumbIndex: number) => (
                              <button
                                key={photo.id || thumbIndex}
                                onClick={(e) => goToPhoto(accommodation, thumbIndex, e)}
                                className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                                  thumbIndex === currentIndex
                                    ? 'border-white scale-110'
                                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                                }`}
                                aria-label={`Go to photo ${thumbIndex + 1}`}
                              >
                                <Image
                                  src={listingImageSrc(
                                    photo.url || accommodation.image,
                                    'thumbnail'
                                  )}
                                  alt={`${accommodation.title} - Photo ${thumbIndex + 1}`}
                                  fill
                                  sizes="64px"
                                  className="object-cover"
                                  quality={65}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Content */}
              <div className={`p-3 sm:p-5 lg:p-6 flex flex-col ${
                accommodations.length === 1 ? 'w-1/2 flex-1 rounded-r-3xl' : 'flex-1'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 group-hover:text-right-stay-500 transition-colors">
                      {accommodation.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{accommodation.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{accommodation.price}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{accommodation.priceUnit}</div>
                  </div>
                </div>

                <p className={`text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 ${
                  accommodations.length === 1 ? 'line-clamp-4' : 'line-clamp-2'
                }`}>
                  {accommodation.shortDescription || accommodation.description}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {accommodation.amenities.map((amenity, amenityIndex) => (
                    <span
                      key={amenityIndex}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
                    >
                      {amenity === "WiFi" && <Wifi className="h-3 w-3" />}
                      {amenity === "Parking" && <Car className="h-3 w-3" />}
                      {amenity === "Pool" && <Shield className="h-3 w-3" />}
                      {amenity === "Ocean View" && <MapPin className="h-3 w-3" />}
                      {amenity === "Safari" && <Shield className="h-3 w-3" />}
                      {amenity === "Game Drives" && <Car className="h-3 w-3" />}
                      {amenity === "Wine Tasting" && <Coffee className="h-3 w-3" />}
                      {amenity === "Vineyard Views" && <MapPin className="h-3 w-3" />}
                      {amenity === "Beach Access" && <MapPin className="h-3 w-3" />}
                      {amenity === "Whale Watching" && <Shield className="h-3 w-3" />}
                      {amenity === "Hiking" && <MapPin className="h-3 w-3" />}
                      {amenity === "Mountain Views" && <MapPin className="h-3 w-3" />}
                      {amenity === "Gym" && <Shield className="h-3 w-3" />}
                      {amenity === "City Views" && <MapPin className="h-3 w-3" />}
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Reviews */}
                <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900">{accommodation.rating}</span>
                  <span className="text-xs sm:text-sm text-gray-600">({accommodation.reviews} reviews)</span>
                  </div>
                <div className="text-xs sm:text-sm text-gray-600">
                    {accommodation.bedrooms} bed • {accommodation.bathrooms} bath
                  </div>
                </div>

                {/* Action Buttons - pushed to bottom */}
                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => setQuickViewProperty(accommodation)}
                    className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-2xl hover:border-right-stay-500 hover:text-right-stay-500 hover:bg-right-stay-50 transition-all duration-200 flex items-center justify-center gap-2 min-h-11"
                  >
                    <Eye className="h-4 w-4" />
                    Quick View
                  </button>
                  <Link
                    href={`/accommodations/${accommodation.id}/book`}
                    className="w-full bg-right-stay-500 text-white font-semibold py-3 px-4 rounded-2xl hover:bg-right-stay-600 transition-colors duration-200 flex items-center justify-center gap-2 min-h-11"
                  >
                    <Calendar className="h-4 w-4" />
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <Link
            href="/accommodations"
            className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-2xl hover:bg-gray-800 transition-colors duration-200 min-h-11"
          >
            View All Accommodations
            <Calendar className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProperty && (
        <QuickViewModal
          isOpen={!!quickViewProperty}
          onClose={() => setQuickViewProperty(null)}
          property={quickViewProperty}
        />
      )}
    </section>
  );
}
