"use client";

import { useState, useEffect, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play, ChevronRight, Search, Calendar, Users, MapPin, ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const router = useRouter();
  const checkInInputRef = useRef<HTMLInputElement>(null);
  const checkOutInputRef = useRef<HTMLInputElement>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [formData, setFormData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '2'
  });

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/properties/locations');
        const data = await response.json();
        if (data.locations && data.locations.length > 0) {
          setLocations(data.locations);
          // Set default location if available
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.location || !formData.checkIn || !formData.checkOut || !formData.guests) {
      alert('Please fill in all fields');
      return;
    }

    // Validate dates
    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      alert('Check-in date must be today or later');
      return;
    }

    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Build query params
    const params = new URLSearchParams({
      location: formData.location,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: formData.guests
    });

    // Redirect to accommodations page with query params
    router.push(`/stay-with-us?${params.toString()}`);
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = formData.checkIn ? new Date(formData.checkIn) : new Date();
  minCheckOut.setDate(minCheckOut.getDate() + 1);
  const minCheckOutDate = minCheckOut.toISOString().split('T')[0];

  // Function to open date picker
  const openDatePicker = (inputRef: React.RefObject<HTMLInputElement>) => {
    if (inputRef.current) {
      // Try using showPicker() if available (modern browsers)
      if ('showPicker' in inputRef.current && typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else {
        // Fallback: focus and click the input
        inputRef.current.focus();
        inputRef.current.click();
      }
    }
  };

  return (
    <>
      <div className="absolute inset-0">
        <Image
          src="/cpt-lions-head-1.jpg"
          alt=""
          fill
          sizes="100vw"
          className="pointer-events-none object-cover motion-safe:[animation:cloudDrift_5s_ease-out_forwards]"
          style={{
            maskImage: 'linear-gradient(to bottom, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent)',
          }}
          priority
        />
      </div>

      <div className="z-10 relative">
        <div className="grid grid-cols-1 grid-rows-[minmax(0,1fr)] gap-12 md:px-8 md:pb-24 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-20 min-h-[calc(100vh-96px)] max-w-7xl mr-auto ml-auto pt-8 pr-6 pb-16 pl-6 gap-x-12 gap-y-12 items-center">
          <div className="col-span-7 flex flex-col justify-center items-start lg:items-center text-left lg:text-center" style={{ animation: 'fadeSlideIn 1.2s ease-out forwards' }}>
            <h1
              className="sm:text-4xl lg:font-normal lg:text-5xl text-3xl font-medium text-white tracking-tighter drop-shadow-xl"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both', fontFamily: 'Manrope, sans-serif' }}
            >
              Turn left and come right
              <br className="hidden sm:block" />
              with
            </h1>

            <div className="mt-8" style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}>
              <Image
                src="/rsa-logo-white.png"
                alt="RSA Logo"
                width={552}
                height={166}
                className="opacity-90"
                priority
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center mt-10 gap-x-4 gap-y-4" style={{ animation: 'fadeSlideIn 1s ease-out 0.8s both' }}>
              <Link
                href="#accommodations"
                className="inline-flex items-center justify-center gap-2 hover:bg-white/90 text-sm text-black tracking-tight bg-white rounded-xl pt-3 pr-5 pb-3 pl-5 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]"
              >
                Explore Properties
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link
                href="#about"
                className="inline-flex items-center justify-center gap-2 hover:bg-white/10 text-sm text-white/90 tracking-tight bg-white/5 border-white/15 border rounded-xl pt-3 pr-5 pb-3 pl-5 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)]"
              >
                Learn More
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          <div className="col-span-7 md:col-span-5 flex items-center justify-center w-full">
            <div className="max-w-2xl border-white/10 border rounded-3xl pt-8 pr-8 pb-8 pl-8 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] backdrop-blur-xl bg-white/5" style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}>
              <p className="leading-relaxed text-lg font-normal text-white/90 tracking-tight mb-6">
                Accommodations<span className="text-white/60 mx-2">•</span>Tours & Experiences
              </p>
              
              {/* Search Form */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Check In Date */}
                  <div className="relative">
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
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent cursor-pointer [color-scheme:dark] hide-native-calendar-icon"
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
                  <div className="relative">
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
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer [color-scheme:dark] hide-native-calendar-icon"
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
    </>
  );
}

