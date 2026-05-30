"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import Link from 'next/link';
import ListingImage from '@/components/ui/ListingImage';
import { formatDateForDisplay } from '@/lib/date-utils';
import {
  calculateNightsBetween,
  DEFAULT_MINIMUM_STAY_NIGHTS,
  getNextAvailableNightlyPrice,
} from '@/lib/pricing';
import {
  buildStayWithUsUrl,
  clearStoredAccommodationDates,
  getStoredAccommodationDates,
  isValidAccommodationDateRange,
  persistAccommodationDatesIfValid,
} from '@/lib/accommodation-search';
import {
  extractLocationFromAttributes,
  hasValidMapCoordinates,
  inferLocationDisplayFromText,
} from '@/lib/property-location';
import { extractAmenitiesFromAttributes } from '@/lib/property-amenities';
import PropertyAmenitiesSection from '@/components/property/PropertyAmenitiesSection';
import PropertyCheckInOutSection from '@/components/property/PropertyCheckInOutSection';
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  MapPin,
  Users,
  Mail,
  Phone,
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  Grid,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center rounded-2xl border border-right-stay-200/60 bg-right-stay-50/40 md:h-[420px]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-right-stay-200 border-t-right-stay-500"
        aria-hidden="true"
      />
    </div>
  ),
});

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
    location_address?: string;
    location_display?: string;
    latitude?: number;
    longitude?: number;
    amenities?: string[];
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
}

interface Property {
  id: string;
  uplisting_id: string;
  data: PropertyData;
  photos?: PropertyPhoto[];
  pricing?: {
    propertyId: string;
    minPrice: number | null;
    basePrice: number | null;
    maxPrice: number | null;
    pricingEnabled: boolean;
    minimumStayNights?: number;
    startingNightlyPrice?: number;
  } | null;
}

interface BookingFormData {
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  specialRequests: string;
}

interface PricingBreakdown {
  numberOfNights: number;
  nightlyPrices?: { date: string; price: number }[];
  basePrice: number;
  averagePricePerNight?: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  usingDefaultPricing?: boolean;
}

interface CalendarDataState {
  dailyPrices: Record<string, number>;
  blockedDates: string[];
  pricing: {
    pricingEnabled: boolean;
    minPrice: number | null;
    basePrice: number | null;
    maxPrice: number | null;
  };
}

export default function BookingPageClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = params?.id as string;

  const searchLocation = searchParams?.get('location') || '';
  const searchCheckIn = searchParams?.get('checkIn') || '';
  const searchCheckOut = searchParams?.get('checkOut') || '';
  const searchGuests = searchParams?.get('guests') || '';

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<BookingFormData>({
    checkInDate: '',
    checkOutDate: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 1,
    specialRequests: ''
  });

  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [minimumStayError, setMinimumStayError] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarDataState>({
    dailyPrices: {},
    blockedDates: [],
    pricing: {
      pricingEnabled: false,
      minPrice: null,
      basePrice: null,
      maxPrice: null,
    },
  });
  const datesPrefilledRef = useRef(false);

  const accommodationsReturnHref = useMemo(() => {
    const stored =
      typeof window !== 'undefined' ? getStoredAccommodationDates() : null;
    return buildStayWithUsUrl({
      location: searchLocation || stored?.location || '',
      checkIn: formData.checkInDate || searchCheckIn || stored?.checkIn || '',
      checkOut: formData.checkOutDate || searchCheckOut || stored?.checkOut || '',
      guests:
        String(formData.numberOfGuests) ||
        searchGuests ||
        stored?.guests ||
        '2',
    });
  }, [
    formData.checkInDate,
    formData.checkOutDate,
    formData.numberOfGuests,
    searchLocation,
    searchCheckIn,
    searchCheckOut,
    searchGuests,
  ]);

  // Fetch property details
  useEffect(() => {
    async function fetchProperty() {
      try {
        const response = await fetch(`/api/properties?id=${propertyId}`);
        const result = await response.json();
        
        if (result.property) {
          setProperty(result.property);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    }

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  useEffect(() => {
    if (!property || datesPrefilledRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const urlCheckIn = params.get('checkIn')?.trim() || '';
    const urlCheckOut = params.get('checkOut')?.trim() || '';
    const stored = getStoredAccommodationDates();

    const checkIn = urlCheckIn || stored?.checkIn || '';
    const checkOut = urlCheckOut || stored?.checkOut || '';

    if (!isValidAccommodationDateRange(checkIn, checkOut)) {
      datesPrefilledRef.current = true;
      return;
    }

    const minimumStay =
      property.pricing?.minimumStayNights ?? DEFAULT_MINIMUM_STAY_NIGHTS;
    const nights = calculateNightsBetween(checkIn, checkOut);
    if (nights < minimumStay) {
      datesPrefilledRef.current = true;
      return;
    }

    const guestCount = stored?.guests
      ? Math.max(1, parseInt(stored.guests, 10) || 1)
      : undefined;

    setFormData((prev) => ({
      ...prev,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      ...(guestCount != null ? { numberOfGuests: guestCount } : {}),
    }));

    const locationFromUrl = params.get('location')?.trim() || stored?.location || '';

    persistAccommodationDatesIfValid(
      checkIn,
      checkOut,
      stored?.guests ?? String(guestCount ?? ''),
      locationFromUrl || undefined
    );

    datesPrefilledRef.current = true;
  }, [property, propertyId]);

  const minimumStayNights =
    property?.pricing?.minimumStayNights ?? DEFAULT_MINIMUM_STAY_NIGHTS;

  // Calculate pricing and check availability when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const nights = calculateNightsBetween(formData.checkInDate, formData.checkOutDate);
      if (nights > 0 && nights < minimumStayNights) {
        setMinimumStayError(
          `This property has a minimum stay of ${minimumStayNights} nights.`
        );
      } else {
        setMinimumStayError(null);
      }
      calculatePricing();
      checkAvailability();
    } else {
      setPricing(null);
      setAvailabilityError(null);
      setMinimumStayError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.checkInDate, formData.checkOutDate, minimumStayNights]);

  const calculatePricing = async () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      setPricing(null);
      return;
    }

    try {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );

      const response = await fetch(
        `/api/get-pricing?propertyId=${propertyId}&checkInDate=${formData.checkInDate}&checkOutDate=${formData.checkOutDate}`
      );

      if (response.ok) {
        const pricingData = await response.json();
        setPricing({
          numberOfNights: pricingData.numberOfNights,
          nightlyPrices: pricingData.nightlyPrices,
          basePrice: pricingData.basePrice,
          averagePricePerNight: pricingData.averagePricePerNight,
          cleaningFee: pricingData.cleaningFee,
          serviceFee: pricingData.serviceFee,
          total: pricingData.total,
          usingDefaultPricing: pricingData.usingDefaultPricing,
        });
      } else {
        // Fallback to simple default pricing when external pricing fails
        const nightlyBase = 1500;
        const basePrice = nightlyBase * nights;
        const cleaningFee = 500;
        const serviceFee = basePrice * 0.12;

        setPricing({
          numberOfNights: nights,
          basePrice,
          cleaningFee,
          serviceFee,
          total: basePrice + cleaningFee + serviceFee,
          usingDefaultPricing: true,
        });
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      // Fallback to simple default pricing on error
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      const nightlyBase = 1500;
      const basePrice = nightlyBase * nights;
      const cleaningFee = 500;
      const serviceFee = basePrice * 0.12;

      setPricing({
        numberOfNights: nights,
        basePrice,
        cleaningFee,
        serviceFee,
        total: basePrice + cleaningFee + serviceFee,
        usingDefaultPricing: true
      });
    }
  };

  const checkAvailability = async () => {
    if (!formData.checkInDate || !formData.checkOutDate) return;
    
    setCheckingAvailability(true);
    setAvailabilityError(null);
    
    try {
      const response = await fetch(
        `/api/check-availability?propertyId=${propertyId}&startDate=${formData.checkInDate}&endDate=${formData.checkOutDate}`
      );
      const result = await response.json();
      
      if (!result.available) {
        setAvailabilityError(
          `Selected dates are not available. ${result.blockedDates.length} date(s) are already booked.`
        );
        setPricing(null);
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      // Don't block the booking if availability check fails
      // setAvailabilityError('Unable to verify availability. Please contact us to confirm.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validation
    if (!formData.checkInDate || !formData.checkOutDate) {
      setError('Please select check-in and check-out dates');
      setSubmitting(false);
      return;
    }

    if (!formData.guestName || !formData.guestEmail) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    if (!pricing || pricing.numberOfNights <= 0) {
      setError('Invalid date selection');
      setSubmitting(false);
      return;
    }

    try {
      // Here you would submit the booking to your backend
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          ...formData,
          pricing
        }),
      });

      if (response.ok) {
        setSuccess(true);
        // Redirect to confirmation page after 2 seconds
        setTimeout(() => {
          router.push('/booking-confirmation');
        }, 2000);
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('An error occurred while creating your booking');
    } finally {
      setSubmitting(false);
    }
  };

  const nightlyPricesForDisplay = pricing?.nightlyPrices ?? [];
  const accommodationSubtotal =
    nightlyPricesForDisplay.length > 0
      ? nightlyPricesForDisplay.reduce((sum, night) => sum + night.price, 0)
      : (pricing?.basePrice ?? 0);
  const calculatedAvgPerNight =
    pricing && pricing.numberOfNights > 0
      ? Math.round(accommodationSubtotal / pricing.numberOfNights)
      : null;

  if (loading) {
    return (
      <>
        <section className="isolate min-h-screen overflow-hidden relative bg-gray-50">
          <Header />
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-right-stay-500" />
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (error && !property) {
    return (
      <>
        <section className="isolate min-h-screen overflow-hidden relative bg-gray-50">
          <Header />
          <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 py-24">
            <Link
              href={accommodationsReturnHref}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Accommodations
            </Link>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const propertyData = property?.data?.attributes;
  const propertyAmenities = extractAmenitiesFromAttributes(
    propertyData as Record<string, unknown> | undefined
  );
  const propertyLocation = extractLocationFromAttributes(propertyData);
  const locationDisplayLabel =
    propertyLocation.location_display?.trim() ||
    inferLocationDisplayFromText(propertyData?.description, propertyData?.name || propertyData?.nickname);
  const showPropertyMap = hasValidMapCoordinates(
    propertyLocation.latitude,
    propertyLocation.longitude
  );
  let photos = property?.photos || [];
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
  const propertyImage = primaryPhoto?.url || "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg";
  
  // Get first 5 photos for the gallery grid
  const galleryPhotos = photos.slice(0, 5);
  const hasMorePhotos = photos.length > 5;
  const mainPhoto = photos[selectedPhotoIndex] || photos[0] || { url: propertyImage };

  const nightlyBasePrice =
    pricing?.averagePricePerNight ??
    getNextAvailableNightlyPrice({
      dailyPrices: calendarData.dailyPrices,
      blockedDates: calendarData.blockedDates,
      pricing: {
        ...(calendarData.pricing.pricingEnabled ? calendarData.pricing : property?.pricing),
        startingNightlyPrice: property?.pricing?.startingNightlyPrice,
      },
    });

  const propertyStats = [
    {
      icon: Users,
      label: `${propertyData?.maximum_capacity || 2} guest${(propertyData?.maximum_capacity || 2) === 1 ? '' : 's'}`,
    },
    {
      icon: Bed,
      label: `${propertyData?.bedrooms || 1} bed${(propertyData?.bedrooms || 1) === 1 ? '' : 's'}`,
    },
    {
      icon: Bath,
      label: `${propertyData?.bathrooms || 1} bath${(propertyData?.bathrooms || 1) === 1 ? '' : 's'}`,
    },
    {
      label: propertyData?.type || 'Entire place',
    },
  ];

  return (
    <>
      <section className="isolate min-h-screen overflow-x-hidden relative bg-white">
        <Header />

        <div className="relative z-10 bg-white">
          {success && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pt-4">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-1">Request received</h3>
                  <p className="text-green-700">
                    Thank you. Your booking request has been received. This is not yet a confirmed booking. Our team will review availability and contact you shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {photos.length > 0 ? (
            <>
              {/* Mobile hero gallery */}
              <div className="relative md:hidden">
                <div
                  className="group relative aspect-[5/4] w-full cursor-pointer bg-gray-100"
                  onClick={() => setShowPhotoModal(true)}
                >
                  <ListingImage
                    src={mainPhoto.url}
                    alt={propertyData?.name || 'Property'}
                    variant="modalMain"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/30"
                    aria-hidden
                  />

                  <Link
                    href={accommodationsReturnHref}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-sm font-medium text-gray-900 shadow-md transition hover:bg-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Link>

                  <div
                    className="absolute right-4 top-4 z-10 flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="rounded-full bg-white/95 p-2.5 text-gray-800 shadow-md transition hover:bg-white"
                      aria-label="Share property"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-white/95 p-2.5 text-gray-800 shadow-md transition hover:bg-white"
                      aria-label="Save property"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                        }}
                        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-900" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-900" />
                      </button>
                    </>
                  )}

                  <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between gap-3">
                    {photos.length > 1 ? (
                      <span className="rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                        {selectedPhotoIndex + 1} / {photos.length}
                      </span>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPhotoModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-sm font-medium text-gray-900 shadow-md transition hover:bg-white"
                    >
                      <Grid className="h-4 w-4" />
                      All photos
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop gallery */}
              <div className="mx-auto hidden max-w-7xl px-4 sm:px-6 md:block md:px-8 md:pt-6 md:mb-8">
                <Link
                  href={accommodationsReturnHref}
                  className="mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Accommodations
                </Link>
                <div className="grid h-[600px] grid-cols-4 gap-2 overflow-hidden rounded-2xl">
                  <div
                    className="group relative col-span-2 cursor-pointer"
                    onClick={() => setShowPhotoModal(true)}
                  >
                    <ListingImage
                      src={mainPhoto.url}
                      alt={propertyData?.name || 'Property'}
                      variant="modalMain"
                      fill
                      className="object-cover"
                      priority
                    />
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow-lg transition-all hover:bg-white group-hover:opacity-100"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft className="h-5 w-5 text-gray-900" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 opacity-0 shadow-lg transition-all hover:bg-white group-hover:opacity-100"
                          aria-label="Next photo"
                        >
                          <ChevronRight className="h-5 w-5 text-gray-900" />
                        </button>
                      </>
                    )}
                  </div>

                  {photos.length > 1 && (
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      {galleryPhotos.slice(1, 5).map((photo, index) => {
                        const isLastVisible = index === galleryPhotos.slice(1, 5).length - 1;
                        const showAllButton = isLastVisible && hasMorePhotos;

                        return (
                          <div
                            key={photo.id}
                            className={`relative cursor-pointer group ${
                              index === 0 && galleryPhotos.length > 2 ? 'row-span-2' : ''
                            }`}
                            onClick={() => {
                              setSelectedPhotoIndex(index + 1);
                              setShowPhotoModal(true);
                            }}
                          >
                            <ListingImage
                              src={photo.url}
                              alt={`${propertyData?.name || 'Property'} - Photo ${index + 2}`}
                              variant="modalTile"
                              fill
                              className="object-cover"
                              loading="lazy"
                            />
                            {showAllButton && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPhotoModal(true);
                                  }}
                                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-50"
                                >
                                  <Grid className="h-4 w-4" />
                                  Show all {photos.length} photos
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 md:pt-6 md:mb-8">
              <Link
                href={accommodationsReturnHref}
                className="mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Accommodations
              </Link>
              <div className="relative h-[280px] overflow-hidden rounded-none bg-gray-200 sm:h-[400px] sm:rounded-2xl md:h-[600px]">
                <ListingImage
                  src={propertyImage}
                  alt={propertyData?.name || 'Property'}
                  variant="modalMain"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}

          {/* Property title and meta */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 mb-6 pt-5 md:pt-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-medium leading-tight tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
                  {propertyData?.name || propertyData?.nickname}
                </h1>

                {locationDisplayLabel && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 shrink-0 text-right-stay-600" />
                    <span>{locationDisplayLabel}</span>
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {propertyStats.map((stat) => (
                    <span
                      key={stat.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                    >
                      {stat.icon && <stat.icon className="h-3.5 w-3.5 text-gray-500" aria-hidden />}
                      {stat.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hidden shrink-0 items-center gap-2 md:flex md:gap-4">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Share</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100"
                >
                  <Heart className="h-5 w-5" />
                  <span className="text-sm font-medium">Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 pb-16 sm:pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Property Details and Booking Form - Left Side */}
            <div className="lg:col-span-3 space-y-8">
              {/* Property Description */}
              <div className="border-b border-gray-200 pb-8">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {propertyData?.description || "A beautiful property perfect for your stay."}
                </p>
              </div>

              {/* Booking Form */}
              <div>
                <h2 
                  className="text-2xl font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Where you&apos;ll stay
                </h2>

                {showPropertyMap &&
                propertyLocation.latitude != null &&
                propertyLocation.longitude != null ? (
                  <PropertyMap
                    latitude={propertyLocation.latitude}
                    longitude={propertyLocation.longitude}
                    label={locationDisplayLabel}
                  />
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 text-center text-sm text-gray-500">
                    Location map will appear once the property address is set in admin.
                  </div>
                )}

                {propertyAmenities.length > 0 && (
                  <PropertyAmenitiesSection
                    amenities={propertyAmenities}
                    variant="light"
                    className="mt-10 border-t border-gray-200 pt-10"
                  />
                )}

                <PropertyCheckInOutSection
                  attributes={propertyData}
                  variant="light"
                  className={`${
                    propertyAmenities.length > 0
                      ? 'mt-10'
                      : 'mt-10 border-t border-gray-200 pt-10'
                  }`}
                />
              </div>
            </div>

            {/* Booking Sidebar - Right Side (Airbnb Style) */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sticky top-8">
                {/* Price and Dates Section */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-between mb-6">
                    {pricing ? (
                      <>
                        <div>
                          <div className="text-2xl font-semibold text-gray-900">
                            R{calculatedAvgPerNight?.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">per night</div>
                        </div>
                        {pricing.numberOfNights > 0 && (
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              R{Math.round(pricing.total).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">for {pricing.numberOfNights} {pricing.numberOfNights === 1 ? 'night' : 'nights'}</div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        <div className="text-2xl font-semibold text-gray-900">
                          R{Math.round(nightlyBasePrice).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">per night</div>
                      </div>
                    )}
                  </div>

                  {/* Airbnb-style Date + Guest summary */}
                  <div className="border border-gray-300 rounded-xl overflow-hidden mb-4 bg-white">
                    <div className="grid grid-cols-2 border-b border-gray-300">
                      <div className="p-3 border-r border-gray-300">
                        <label className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase block">Check-in</label>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {formData.checkInDate || 'Add date'}
                        </div>
                      </div>
                      <div className="p-3">
                        <label className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase block">Checkout</label>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {formData.checkOutDate || 'Add date'}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-gray-300">
                      <label className="text-[10px] font-semibold tracking-wide text-gray-500 uppercase block">Guests</label>
                      <select
                        value={formData.numberOfGuests}
                        onChange={(e) => {
                          setFormData((prev) => {
                            const next = {
                              ...prev,
                              numberOfGuests: parseInt(e.target.value, 10),
                            };
                            persistAccommodationDatesIfValid(
                              next.checkInDate,
                              next.checkOutDate,
                              String(next.numberOfGuests),
                              searchLocation || undefined
                            );
                            return next;
                          });
                        }}
                        className="mt-1 w-full text-sm font-medium text-gray-900 bg-white focus:outline-none"
                      >
                        {Array.from({ length: propertyData?.maximum_capacity || 10 }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calendar Preview */}
                  <div className="mb-6">
                    <AvailabilityCalendar
                      propertyId={propertyId}
                      selectedCheckIn={formData.checkInDate}
                      selectedCheckOut={formData.checkOutDate}
                      onCalendarDataChange={setCalendarData}
                      onDateSelect={(checkIn, checkOut) => {
                        setFormData((prev) => {
                          const next = {
                            ...prev,
                            checkInDate: checkIn || '',
                            checkOutDate: checkOut || '',
                          };
                          persistAccommodationDatesIfValid(
                            next.checkInDate,
                            next.checkOutDate,
                            String(next.numberOfGuests),
                            searchLocation || undefined
                          );
                          return next;
                        });
                      }}
                    />
                    {formData.checkInDate && (
                      <button
                        type="button"
                        onClick={() => {
                          clearStoredAccommodationDates();
                          setFormData((prev) => ({
                            ...prev,
                            checkInDate: '',
                            checkOutDate: '',
                          }));
                        }}
                        className="mt-3 w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Clear dates
                      </button>
                    )}
                  </div>
                </div>

                {/* Pricing Breakdown (below calendar so date selection does not shift layout) */}
                {pricing && (
                  <>
                    {nightlyPricesForDisplay.length > 0 && (
                      <div className="border-t border-gray-200 pt-6">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                            How your nightly rate is calculated
                          </p>
                          <ul className="space-y-1.5">
                            {nightlyPricesForDisplay.map((night) => (
                              <li key={night.date} className="flex justify-between text-gray-700">
                                <span>{formatDateForDisplay(night.date)}</span>
                                <span className="font-medium tabular-nums">
                                  R{Math.round(night.price).toLocaleString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 space-y-1 border-t border-gray-200 pt-2 text-gray-700">
                            <div className="flex justify-between">
                              <span>Total for selected nights</span>
                              <span className="font-medium tabular-nums">
                                R{Math.round(accommodationSubtotal).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>
                                ÷ {pricing.numberOfNights}{' '}
                                {pricing.numberOfNights === 1 ? 'night' : 'nights'}
                              </span>
                              <span className="font-semibold text-gray-900 tabular-nums">
                                R{calculatedAvgPerNight?.toLocaleString()} per night
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div
                      className={`space-y-3 ${
                        nightlyPricesForDisplay.length > 0 ? 'pt-4' : 'border-t border-gray-200 pt-6'
                      }`}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 underline">
                          R{calculatedAvgPerNight?.toLocaleString()} × {pricing.numberOfNights}{' '}
                          {pricing.numberOfNights === 1 ? 'night' : 'nights'}
                        </span>
                        <span className="text-gray-900 tabular-nums">
                          R{Math.round(accommodationSubtotal).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 underline">Cleaning fee</span>
                        <span className="text-gray-900">R{pricing.cleaningFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 underline">Service fee</span>
                        <span className="text-gray-900">R{Math.round(pricing.serviceFee).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-900">Total (ZAR)</span>
                          <span className="font-semibold text-gray-900">
                            R{Math.round(pricing.total).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Guest Information Form (Collapsible or in separate section) */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="guestName"
                        name="guestName"
                        required
                        value={formData.guestName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-right-stay-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="guestEmail"
                        name="guestEmail"
                        required
                        value={formData.guestEmail}
                        onChange={handleInputChange}
                        placeholder="Email for booking confirmation"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-right-stay-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="guestPhone"
                        name="guestPhone"
                        value={formData.guestPhone}
                        onChange={handleInputChange}
                        placeholder="Mobile number (optional)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-right-stay-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        id="specialRequests"
                        name="specialRequests"
                        rows={3}
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        placeholder="Early check-in, accessibility needs, etc."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-right-stay-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      success ||
                      !pricing ||
                      checkingAvailability ||
                      !!availabilityError ||
                      !!minimumStayError ||
                      !formData.checkInDate ||
                      !formData.checkOutDate ||
                      !formData.guestName ||
                      !formData.guestEmail
                    }
                    className="w-full bg-right-stay-500 text-white font-semibold py-4 px-6 rounded-xl hover:bg-right-stay-600 transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {checkingAvailability ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Checking Availability...
                      </>
                    ) : submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Booking Confirmed
                      </>
                    ) : (
                      <>Reserve</>
                    )}
                  </button>

                  {minimumStayError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
                      {minimumStayError}
                    </div>
                  )}

                  {availabilityError && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
                      {availabilityError}
                    </div>
                  )}

                  {error && !success && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
                      {error}
                    </div>
                  )}

                  <p className="text-center text-sm text-gray-600 mt-4">
                    You won&apos;t be charged yet
                  </p>
                </div>

                {/* Cancellation Policy */}
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="bg-right-stay-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      Free Cancellation
                    </h4>
                    <p className="text-xs text-gray-600">
                      Cancel up to 48 hours before check-in for a full refund.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Photo Modal */}
        {showPhotoModal && photos.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={() => setShowPhotoModal(false)}>
            <div className="relative w-full max-w-7xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                aria-label="Close modal"
              >
                <X className="h-6 w-6 text-gray-900" />
              </button>
              
              {/* Main Photo Display */}
              <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-4">
                {photos[selectedPhotoIndex] && (
                  <ListingImage
                    src={photos[selectedPhotoIndex].url}
                    alt={`${propertyData?.name || "Property"} - Photo ${selectedPhotoIndex + 1}`}
                    variant="lightbox"
                    fill
                    className="object-contain"
                    priority
                  />
                )}
                
                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-900" />
                    </button>
                    <button
                      onClick={() => setSelectedPhotoIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-900" />
                    </button>
                  </>
                )}

                {/* Photo Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                  {selectedPhotoIndex + 1} / {photos.length}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedPhotoIndex
                        ? 'border-white ring-2 ring-white'
                        : 'border-transparent hover:border-white/50'
                    }`}
                  >
                    <ListingImage
                      src={photo.url}
                      alt={`Thumbnail ${index + 1}`}
                      variant="thumbnail"
                      sizes="96px"
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}

