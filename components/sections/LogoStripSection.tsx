"use client";

import Image from 'next/image';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function LogoStripSection() {
  useScrollAnimation();

  const platforms = [
    {
      name: 'Airbnb',
      logo: (
        <svg viewBox="0 0 448 512" className="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M224 373.12c-25.24-31.67-40.61-59.46-45-83.18-22.55-88 112.61-88 90.06 0-5.5 24.18-20.29 52-45 83.18zm138.15 73.23c-42.06 18.31-83.67-10.88-119.3-50.47 103.9-130.07 46.11-200-18.85-200-54.92 0-85.16 46.51-73.28 100.5 6.93 29.19 25.23 62.39 54.43 99.5-32.53 36.05-60.55 52.69-85.15 54.92-50 7.58-194.42 49.05-178.78-192 0-95.38 54.16-150 99.92-150 44.8 0 80.93 33.13 100.63 90.15 9.74 27.38 15.88 56.12 18.2 85.58h19.12c-2.35-32.58-7.88-64.48-18.54-96-19.57-65.39-68.35-90-117.41-90C37.17 192 0 235.5 0 320c0 84.58 37.17 128 93.21 128 49.06 0 97.84-24.61 117.41-90 10.66-31.52 16.19-63.42 18.54-96h19.12c-2.32 29.46-8.46 58.2-18.2 85.58-19.7 57.02-55.83 90.15-100.63 90.15-45.76 0-99.92-54.62-99.92-150 0-241.05 128.78-199.58 178.78-192 24.6 2.23 52.62 18.87 85.15 54.92 29.2-37.11 47.5-70.31 54.43-99.5 11.88-53.99-18.36-100.5-73.28-100.5-64.96 0-122.75 69.93-18.85 200 35.63 39.59 77.24 68.78 119.3 50.47z"/>
        </svg>
      ),
    },
    {
      name: 'Booking.com',
      logo: (
        <svg viewBox="0 0 200 60" className="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="200" height="60" rx="8" fill="#003580"/>
          <text x="100" y="38" fontSize="18" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">Booking.com</text>
        </svg>
      ),
    },
    {
      name: 'VRBO',
      logo: (
        <svg viewBox="0 0 200 60" className="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="200" height="60" rx="8" fill="#00A699"/>
          <text x="100" y="38" fontSize="24" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">VRBO</text>
        </svg>
      ),
    },
    {
      name: 'Expedia',
      logo: (
        <svg viewBox="0 0 200 60" className="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="200" height="60" rx="8" fill="#FFB800"/>
          <text x="100" y="38" fontSize="20" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">Expedia</text>
        </svg>
      ),
    },
    {
      name: 'Right Stay Direct',
      logo: (
        <svg viewBox="0 0 200 60" className="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="200" height="60" rx="8" fill="#337E2F"/>
          <text x="100" y="38" fontSize="14" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">Right Stay Direct</text>
        </svg>
      ),
    },
  ];

  return (
    <section className="isolate overflow-hidden py-16 relative bg-gray-50">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 
            className="sm:text-4xl lg:text-5xl text-3xl font-medium text-gray-900 tracking-tight animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both', fontFamily: 'Manrope, sans-serif' }}
          >
            Connected to the World&apos;s Leading Booking Platforms
          </h2>
          <p className="text-sm text-gray-600 mt-4 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}>
            API Connected
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center mb-12">
          {platforms.map((platform, index) => (
            <div
              key={platform.name}
              className="flex items-center justify-center h-20 w-full animate-on-scroll grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
              style={{ animation: `fadeSlideIn 1s ease-out ${0.3 + index * 0.1}s both` }}
            >
              <div className="w-full h-12 text-gray-600 hover:text-gray-900 flex items-center justify-center">
                {platform.logo}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 pt-8 border-t border-gray-200 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.6s both' }}>
          <div className="text-lg font-semibold text-gray-700">Dynamic Pricing Powered by</div>
          <div className="h-12 w-40 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer">
            <svg viewBox="0 0 200 60" className="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="200" height="60" rx="8" fill="#1a1a1a"/>
              <text x="100" y="38" fontSize="18" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">PriceLabs</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
