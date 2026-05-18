"use client";

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function SecondHero() {
  useScrollAnimation();

  return (
    <section className="isolate overflow-hidden pt-12 pb-24 sm:pt-16 sm:pb-24 relative bg-white">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center">
          <h2 
            className="sm:text-6xl lg:text-7xl text-5xl font-medium text-black tracking-tight animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both', fontFamily: 'Manrope, sans-serif' }}
          >
            Come Right.
          </h2>
          
          <p 
            className="sm:text-xl text-lg leading-relaxed text-gray-700 max-w-4xl mx-auto mt-8 animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.3s both' }}
          >
            More punch, less fluff
          </p>
          
          <p 
            className="sm:text-xl text-lg leading-relaxed text-gray-700 max-w-4xl mx-auto mt-6 animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.5s both' }}
          >
            End-to-end asset management, premium stays and destination experiences engineered for performance and guest satisfaction.
          </p>

          <p 
            className="sm:text-xl text-lg leading-relaxed text-gray-700 max-w-4xl mx-auto mt-6 animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.7s both' }}
          >
            Built right. Managed right. Experienced right.
          </p>
        </div>

      </div>
    </section>
  );
}
