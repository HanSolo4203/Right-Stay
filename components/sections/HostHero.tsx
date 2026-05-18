"use client";

import HeroBackgroundImage from '@/components/ui/HeroBackgroundImage';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

export default function HostHero() {
  return (
    <>
      <div className="absolute inset-0">
        <HeroBackgroundImage
          src="/cpt-lions-head-1.jpg"
          style={{
            maskImage: 'linear-gradient(to bottom, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent)',
          }}
        />
      </div>

      <div className="z-10 relative">
        <div className="grid grid-cols-1 grid-rows-[minmax(0,1fr)] gap-12 md:px-8 md:pb-24 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-20 min-h-[calc(100vh-96px)] max-w-7xl mr-auto ml-auto pt-8 pr-6 pb-16 pl-6 gap-x-12 gap-y-12 items-center">
          <div className="col-span-7 flex flex-col justify-center" style={{ animation: 'fadeSlideIn 1.2s ease-out forwards' }}>
            <h1
              className="sm:text-6xl lg:font-normal lg:text-8xl text-5xl font-medium text-white tracking-tighter drop-shadow-xl"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both', fontFamily: 'Manrope, sans-serif' }}
            >
              Host With Us
            </h1>

            <p
              className="leading-relaxed text-3xl text-white/90 max-w-2xl mt-6 font-medium"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}
            >
              A Smarter Way to Host. A Better Way to Earn.
            </p>

            <p
              className="leading-relaxed text-lg text-white/80 max-w-2xl mt-4"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.6s both' }}
            >
              Maximize your property&apos;s earning potential with Right Stay Africa. We handle the complexity of multi-channel distribution, dynamic pricing, and guest management so you can focus on what matters most—delivering exceptional experiences.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center mt-10 gap-x-4 gap-y-4" style={{ animation: 'fadeSlideIn 1s ease-out 0.8s both' }}>
              <Link
                href="#earnings-estimator"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-colors duration-200 shadow-xl"
              >
                List My Property
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#consultation"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/20 transition-colors duration-200 border border-white/20"
              >
                <Calendar className="h-5 w-5" />
                Book a Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
