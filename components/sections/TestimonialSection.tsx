"use client";

import Image from 'next/image';
import { Quote, User, Activity, Brain, Waves } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function TestimonialSection() {
  useScrollAnimation();

  return (
    <section className="isolate overflow-hidden h-screen relative">
      <Image
        src="/images/6b428a64-0de1-4837-bab2-9729ce2e28c2_3840w_1.jpg"
        alt="Atmospheric mountain landscape"
        fill
        sizes="100vw"
        className="pointer-events-none object-cover"
      />
      <div className="z-10 flex h-full relative items-center">
        <div className="md:px-8 text-center max-w-4xl mr-auto ml-auto pr-6 pl-6">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase ring-white/10 ring-1 animate-on-scroll text-white/70 tracking-[0.18em] bg-white/5 rounded-full pt-1 pr-3 pb-1 pl-3" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.1s both' }}>
            <Quote className="h-3.5 w-3.5" strokeWidth={2} />
            Guest Review
          </span>

          <p className="sm:text-4xl md:text-5xl animate-on-scroll text-3xl font-medium text-white tracking-tight mt-6 drop-shadow-xl" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.2s both', fontFamily: 'Manrope, sans-serif' }}>
            &quot;Our stay with Right Stay Africa was absolutely perfect. The property exceeded our expectations, and the team was incredibly responsive. We can&apos;t wait to return!&quot;
          </p>

          <div className="flex animate-on-scroll mt-6 gap-x-3 gap-y-3 items-center justify-center" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.3s both' }}>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
              <User className="h-4.5 w-4.5 text-white/80" strokeWidth={2} />
            </span>
            <div className="text-left">
              <div className="text-sm font-medium text-white/90">Sarah Johnson</div>
              <div className="text-xs text-white/60">Cape Town, South Africa</div>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_60%_at_50%_40%,rgba(0,0,0,0.05),rgba(0,0,0,0.7)),linear-gradient(to_top,rgba(0,0,0,0.85),rgba(0,0,0,0.35))]"></div>

      <div className="absolute inset-x-0 bottom-8 z-10">
        <div className="flex flex-wrap animate-on-scroll text-white/55 max-w-5xl mr-auto ml-auto gap-x-10 gap-y-4 items-center justify-center" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.4s both' }}>
          <span className="text-sm text-white/70">Trusted by travelers from</span>
          {[
            { name: 'Cape Town' },
            { name: 'Johannesburg' },
            { name: 'Durban' },
            { name: 'Pretoria' }
          ].map((city) => (
            <span key={city.name} className="inline-flex items-center gap-2 text-sm">
              {city.name}
            </span>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
}

