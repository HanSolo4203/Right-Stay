"use client";

import { useState, useEffect, FormEvent, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/sections/Header';
import AccommodationCards from '@/components/sections/AccommodationCards';
import Footer from '@/components/sections/Footer';
import Link from 'next/link';
import HeroBackgroundImage from '@/components/ui/HeroBackgroundImage';
import { ArrowLeft, Search, Calendar, Users, MapPin, ChevronDown, ChevronRight } from 'lucide-react';

function StayWithUsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkInInputRef = useRef<HTMLInputElement>(null);
  const checkOutInputRef = useRef<HTMLInputElement>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);

  // Get search filters from URL
  const locationFilter = searchParams?.get('location') || '';
  const checkIn = searchParams?.get('checkIn') || '';
  const checkOut = searchParams?.get('checkOut') || '';
  const guestsFilter = searchParams?.get('guests') || '2';

  const [formData, setFormData] = useState({
    location: locationFilter,
    checkIn: checkIn,
    checkOut: checkOut,
    guests: guestsFilter
  });

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/properties/locations');
        const data = await response.json();
        if (data.locations && data.locations.length > 0) {
          setLocations(data.locations);
          if (data.locations.length > 0 && !formData.location) {
            setFormData(prev => ({ ...prev, location: data.locations[0] }));
          }
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoadingLocations(false);
      }
    }

    fetchLocations();
  }, [formData.location]);

  useEffect(() => {
    setFormData({
      location: locationFilter,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guestsFilter
    });
  }, [locationFilter, checkIn, checkOut, guestsFilter]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.location || !formData.checkIn || !formData.checkOut || !formData.guests) {
      alert('Please fill in all fields');
      return;
    }

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      alert('Check-in date must be today or later');
      return;
    }

    if (checkOutDate <= checkInDate) {
      alert('Check-out date must be after check-in date');
      return;
    }

    const params = new URLSearchParams({
      location: formData.location,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: formData.guests
    });

    router.push(`/stay-with-us?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = formData.checkIn ? new Date(formData.checkIn) : new Date();
  minCheckOut.setDate(minCheckOut.getDate() + 1);
  const minCheckOutDate = minCheckOut.toISOString().split('T')[0];

  const openDatePicker = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      if ('showPicker' in inputRef.current && typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
        inputRef.current.click();
      }
    }
  };

  return (
    <>
      <section className="isolate min-h-[600px] overflow-hidden relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <HeroBackgroundImage
            src="/cpt-lions-head-1.jpg"
            priority
            className="pointer-events-none object-cover motion-safe:[animation:cloudDrift_5s_ease-out_forwards]"
            style={{
              maskImage: 'linear-gradient(to bottom, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent)',
            }}
          />
        </div>

        <Header />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Side - Title and Description */}
            <div className="lg:col-span-7" style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
              <h1
                className="sm:text-6xl lg:text-7xl text-5xl font-medium text-white tracking-tight mb-6"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Premium Accommodations
              </h1>
              <p className="sm:text-xl text-lg leading-relaxed text-white/90 max-w-3xl">
                Browse our carefully curated collection of luxury properties across South Africa. Each accommodation is verified for quality, comfort, and exceptional experiences.
              </p>
            </div>

            {/* Right Side - Search Card */}
            <div className="lg:col-span-5 flex items-center justify-center w-full" style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}>
              <div className="w-full max-w-2xl min-w-0 border-white/10 border rounded-3xl p-4 sm:p-8 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] backdrop-blur-xl bg-white/5 overflow-hidden">
                <p className="leading-relaxed text-lg font-normal text-white/90 tracking-tight mb-6">
                  Accommodations<span className="text-white/60 mx-2">•</span>Tours & Experiences
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Location Dropdown */}
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      required
                      className="w-full pl-12 pr-10 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent appearance-none cursor-pointer"
                      style={{ color: formData.location ? 'white' : 'rgba(255, 255, 255, 0.6)' }}
                    >
                      <option value="" className="bg-gray-800 text-white">
                        {loadingLocations ? 'Loading locations...' : 'Where are you going?'}
                      </option>
                      {locations.map((location) => (
                        <option key={location} value={location} className="bg-gray-800 text-white">
                          {location}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
                  </div>

                  {/* Date and Guest Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                    {/* Check In Date */}
                    <div className="relative min-w-0 overflow-hidden">
                      <Calendar 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 z-10 cursor-pointer hover:text-white/80 transition-colors" 
                        onClick={() => openDatePicker(checkInInputRef)}
                      />
                      <input
                        ref={checkInInputRef}
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                        min={today}
                        required
                        className="w-full min-w-0 max-w-full box-border pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent cursor-pointer [color-scheme:dark] hide-native-calendar-icon"
                        style={{ 
                          color: formData.checkIn ? 'white' : 'transparent',
                        }}
                      />
                      {!formData.checkIn && (
                        <span className="absolute left-12 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none select-none">
                          Check in date
                        </span>
                      )}
                    </div>
                    {/* Check Out Date */}
                    <div className="relative min-w-0 overflow-hidden">
                      <Calendar 
                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 z-10 transition-colors ${!formData.checkIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-white/80'}`}
                        onClick={() => {
                          if (formData.checkIn) {
                            openDatePicker(checkOutInputRef);
                          }
                        }}
                      />
                      <input
                        ref={checkOutInputRef}
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                        min={formData.checkIn ? minCheckOutDate : today}
                        required
                        disabled={!formData.checkIn}
                        className="w-full min-w-0 max-w-full box-border pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer [color-scheme:dark] hide-native-calendar-icon"
                        style={{ 
                          color: formData.checkOut ? 'white' : 'transparent',
                        }}
                      />
                      {!formData.checkOut && (
                        <span className="absolute left-12 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none select-none">
                          Checkout date
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Guests Input */}
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
                    <select
                      value={formData.guests}
                      onChange={(e) => setFormData(prev => ({ ...prev, guests: e.target.value }))}
                      required
                      className="w-full pl-12 pr-10 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent appearance-none cursor-pointer"
                      style={{ color: formData.guests ? 'white' : 'rgba(255, 255, 255, 0.6)' }}
                    >
                      <option value="" className="bg-gray-800 text-white">Guests</option>
                      <option value="1" className="bg-gray-800 text-white">1 Guest</option>
                      <option value="2" className="bg-gray-800 text-white">2 Guests</option>
                      <option value="3" className="bg-gray-800 text-white">3 Guests</option>
                      <option value="4" className="bg-gray-800 text-white">4 Guests</option>
                      <option value="5" className="bg-gray-800 text-white">5 Guests</option>
                      <option value="6" className="bg-gray-800 text-white">6+ Guests</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="w-full bg-white text-black font-semibold py-4 px-6 rounded-2xl hover:bg-white/90 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Search className="h-5 w-5" />
                    Search Accommodations
                  </button>
                </form>

                {/* Quick Filter Buttons */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Weekend Getaways', 'Family Friendly', 'Pet Friendly', 'Luxury Stays'].map((filter) => (
                    <button
                      key={filter}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors duration-200"
                    >
                      <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} /> {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
      </section>
      <Suspense fallback={<div className="py-16 text-center">Loading accommodations...</div>}>
        <AccommodationCards />
      </Suspense>
      <Footer />
    </>
  );
}

export default function StayWithUsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <StayWithUsContent />
    </Suspense>
  );
}
