"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play, ChevronRight, Search, Calendar, Users, MapPin } from 'lucide-react';

export default function HeroSection() {
  return (
    <>
      <Image
        src="/cpt-lions-head-1.jpg"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover"
        style={{ 
          maskImage: 'linear-gradient(to bottom, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent)'
        }}
        priority
      />

      <div className="z-10 relative">
        <div className="grid grid-cols-1 grid-rows-[minmax(0,1fr)] gap-12 md:px-8 md:pb-24 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-20 min-h-[calc(100vh-96px)] max-w-7xl mr-auto ml-auto pt-8 pr-6 pb-16 pl-6 gap-x-12 gap-y-12 items-center">
          <div className="col-span-7 flex flex-col justify-center" style={{ animation: 'fadeSlideIn 1.2s ease-out forwards' }}>
            <div className="mb-8" style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both' }}>
              <Image
                src="/rsa-logo-white.png"
                alt="RSA Logo"
                width={552}
                height={166}
                className="opacity-90"
                priority
              />
            </div>

            <h1
              className="sm:text-6xl lg:font-normal lg:text-8xl text-5xl font-medium text-white tracking-tighter drop-shadow-xl"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both', fontFamily: 'Manrope, sans-serif' }}
            >
              TURN LEFT AND COME RIGHT
              <br className="hidden sm:block" />
              WITH
            </h1>

            <p
              className="leading-relaxed text-2xl text-white/90 max-w-2xl mt-6 font-medium"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}
            >
              Right Stay Africa
            </p>

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

          <div className="col-span-7 md:col-span-5 flex items-center justify-center w-full" style={{ animation: 'fadeSlideIn 1s ease-out 0.9s both' }}>
            <div className="max-w-2xl border-white/10 border rounded-3xl pt-8 pr-8 pb-8 pl-8 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] backdrop-blur-xl bg-white/5">
              <p className="leading-relaxed text-lg font-normal text-white/90 tracking-tight mb-6">
                Accommodations<span className="text-white/60 mx-2">•</span>Tours & Experiences
              </p>
              
              {/* Search Form */}
              <form className="space-y-4">
                {/* Location Input */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                  />
                </div>

                {/* Date and Guest Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <input
                      type="date"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                    <select className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent appearance-none">
                      <option value="" className="bg-gray-800 text-white">Guests</option>
                      <option value="1" className="bg-gray-800 text-white">1 Guest</option>
                      <option value="2" className="bg-gray-800 text-white">2 Guests</option>
                      <option value="3" className="bg-gray-800 text-white">3 Guests</option>
                      <option value="4" className="bg-gray-800 text-white">4+ Guests</option>
                    </select>
                  </div>
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

