"use client";

import HeroBackgroundImage from '@/components/ui/HeroBackgroundImage';
import HeroPremiumFadeOverlay from '@/components/ui/HeroPremiumFadeOverlay';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

export default function HostHero() {
  return (
    <>
      <div className="absolute inset-0">
        <HeroBackgroundImage
          src="/cpt-lions-head-1.jpg"
          style={{
            maskImage:
              'linear-gradient(to bottom, black 48%, rgba(0,0,0,0.75) 68%, rgba(0,0,0,0.25) 86%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 48%, rgba(0,0,0,0.75) 68%, rgba(0,0,0,0.25) 86%, transparent 100%)',
          }}
        />
      </div>

      <div className="z-10 relative">
        <div className="grid grid-cols-1 grid-rows-[minmax(0,1fr)] gap-12 md:px-8 md:pb-24 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-20 min-h-[calc(100vh-96px)] max-w-7xl mr-auto ml-auto pt-8 pr-6 pb-16 pl-6 gap-x-12 gap-y-12 items-center">
          <div className="col-span-7 flex flex-col justify-center" style={{ animation: 'fadeSlideIn 1.2s ease-out forwards' }}>
            <p
              className="text-sm uppercase tracking-[0.28em] text-white/70 font-medium mb-4"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.15s both' }}
            >
              Property & Asset Management
            </p>
            <h1
              className="sm:text-6xl lg:font-normal lg:text-7xl text-5xl font-medium text-white tracking-tight drop-shadow-xl"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both', fontFamily: 'Manrope, sans-serif' }}
            >
              Partner With Right Stay Africa
            </h1>

            <p
              className="leading-relaxed text-2xl sm:text-3xl text-white/90 max-w-2xl mt-6 font-medium"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}
            >
              Your property. Our expertise. Exceptional returns.
            </p>

            <p
              className="leading-relaxed text-lg text-white/80 max-w-2xl mt-4"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.6s both' }}
            >
              We are a full-service property and asset management partner for owners across Africa — handling distribution, pricing, guest care, maintenance and transparent reporting so you can invest with confidence.
            </p>

            <div
              className="flex flex-col sm:flex-row sm:items-center mt-10 gap-x-4 gap-y-4"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.8s both' }}
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-colors duration-200 shadow-xl"
              >
                List My Property
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/20 transition-colors duration-200 border border-white/20"
              >
                <Calendar className="h-5 w-5" />
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      <HeroPremiumFadeOverlay />
    </>
  );
}
