"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { parseLocalDatePlusOne } from '@/lib/date-utils';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

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

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

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

  // Calculate pricing and check availability when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      calculatePricing();
      checkAvailability();
    } else {
      setPricing(null);
      setAvailabilityError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.checkInDate, formData.checkOutDate]);

  const calculatePricing = async () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      setPricing(null);
      return;
    }

    try {
      // Fetch pricing from API using PriceLabs data
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
          usingDefaultPricing: pricingData.usingDefaultPricing
        });
      } else {
        // Fallback to default pricing
        const checkIn = new Date(formData.checkInDate);
        const checkOut = new Date(formData.checkOutDate);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const basePrice = 1500 * nights;
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
    } catch (error) {
      console.error('Error fetching pricing:', error);
      // Fallback to default pricing on error
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const basePrice = 1500 * nights;
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

  if (loading) {
    return (
      <>
        <section className="isolate min-h-screen overflow-hidden relative bg-gray-50">
          <Header />
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
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
              href="/accommodations"
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
  const primaryPhoto = property?.photos?.find(p => p.is_primary) || property?.photos?.[0];
  const propertyImage = primaryPhoto?.url || "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg";

  return (
    <>
      <section className="isolate min-h-screen overflow-hidden relative bg-gray-50">
        <Header />
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 py-12">
          <Link
            href="/accommodations"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Accommodations
          </Link>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">Booking Submitted!</h3>
                <p className="text-green-700">Your booking request has been submitted successfully. Redirecting to confirmation page...</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-lg p-8">
                <h1 
                  className="text-4xl font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Complete Your Booking
                </h1>
                <p className="text-gray-600 mb-8">
                  Fill in your details and select your dates to book {propertyData?.name || propertyData?.nickname}
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Date Selection with Calendar */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Select Your Dates
                    </h2>
                    <AvailabilityCalendar
                      propertyId={propertyId}
                      selectedCheckIn={formData.checkInDate}
                      selectedCheckOut={formData.checkOutDate}
                      onDateSelect={(checkIn, checkOut) => {
                        setFormData(prev => ({
                          ...prev,
                          checkInDate: checkIn || '',
                          checkOutDate: checkOut || ''
                        }));
                      }}
                    />
                  </div>

                  {/* Guest Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Guest Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="guestName"
                          name="guestName"
                          required
                          value={formData.guestName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="guestEmail"
                            name="guestEmail"
                            required
                            value={formData.guestEmail}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="guestPhone"
                            name="guestPhone"
                            value={formData.guestPhone}
                            onChange={handleInputChange}
                            placeholder="+27 12 345 6789"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Guests *
                        </label>
                        <input
                          type="number"
                          id="numberOfGuests"
                          name="numberOfGuests"
                          required
                          min="1"
                          max={propertyData?.maximum_capacity || 10}
                          value={formData.numberOfGuests}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Maximum capacity: {propertyData?.maximum_capacity || 10} guests
                        </p>
                      </div>
                      <div>
                        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
                          Special Requests (Optional)
                        </label>
                        <textarea
                          id="specialRequests"
                          name="specialRequests"
                          rows={4}
                          value={formData.specialRequests}
                          onChange={handleInputChange}
                          placeholder="Any special requirements or requests..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {availabilityError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 font-medium mb-1">Dates Not Available</p>
                        <p className="text-yellow-700 text-sm">{availabilityError}</p>
                      </div>
                    </div>
                  )}

                  {error && !success && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || success || !pricing || checkingAvailability || !!availabilityError}
                    className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                      <>
                        <CreditCard className="h-5 w-5" />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-8">
                {/* Property Details */}
                <div className="mb-6">
                  {propertyImage && (
                    <div className="relative h-48 mb-4 rounded-2xl overflow-hidden">
                      <Image
                        src={propertyImage}
                        alt={propertyData?.name || "Property"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {propertyData?.name || propertyData?.nickname}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {propertyData?.type || 'Luxury Property'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{propertyData?.maximum_capacity || 2} guests</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{propertyData?.bedrooms || 1} beds</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                  
                  {pricing ? (
                    <div className="space-y-3">
                      {/* Nightly Breakdown */}
                      {pricing.nightlyPrices && pricing.nightlyPrices.length > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600 font-medium">
                              {pricing.numberOfNights} {pricing.numberOfNights === 1 ? 'night' : 'nights'}
                            </span>
                            <span className="text-gray-900 font-medium">
                              R{pricing.basePrice.toLocaleString()}
                            </span>
                          </div>
                          {/* Show detailed nightly prices for short stays */}
                          {pricing.nightlyPrices.length <= 7 && (
                            <div className="space-y-1 pl-2 border-l-2 border-gray-200">
                              {pricing.nightlyPrices.map((night, index) => {
                                // Parse date as local and add 1 day for display
                                const date = parseLocalDatePlusOne(night.date);
                                
                                return (
                                  <div key={night.date} className="flex justify-between text-xs text-gray-500">
                                    <span>
                                      {date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <span>R{night.price.toLocaleString()}</span>
                                  </div>
                                );
                              })}
                              {/* Show checkout date as reference (no price) */}
                              {formData.checkOutDate && (
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>
                                    {parseLocalDatePlusOne(formData.checkOutDate).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="text-gray-400 italic">Check-out</span>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Show average for longer stays */}
                          {pricing.nightlyPrices.length > 7 && pricing.averagePricePerNight && (
                            <div className="text-xs text-gray-500 pl-2">
                              Average: R{Math.round(pricing.averagePricePerNight).toLocaleString()} per night
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Fallback if no nightly breakdown */}
                      {(!pricing.nightlyPrices || pricing.nightlyPrices.length === 0) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Accommodation ({pricing.numberOfNights} {pricing.numberOfNights === 1 ? 'night' : 'nights'})
                          </span>
                          <span className="text-gray-900 font-medium">
                            R{pricing.basePrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cleaning fee</span>
                        <span className="text-gray-900 font-medium">
                          R{pricing.cleaningFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service fee (12%)</span>
                        <span className="text-gray-900 font-medium">
                          R{Math.round(pricing.serviceFee).toLocaleString()}
                        </span>
                      </div>
                      
                      {pricing.usingDefaultPricing && (
                        <div className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                          Using estimated pricing
                        </div>
                      )}
                      
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between">
                          <span className="text-base font-semibold text-gray-900">Total</span>
                          <span className="text-xl font-bold text-gray-900">
                            R{Math.round(pricing.total).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        Select dates to see pricing
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="bg-blue-50 rounded-xl p-4">
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
      </section>
      <Footer />
    </>
  );
}

