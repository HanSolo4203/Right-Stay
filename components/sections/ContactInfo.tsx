"use client";

import Image from 'next/image';
import { Clock, MapPin, Globe, Users } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function ContactInfo() {
  useScrollAnimation();

  return (
    <section className="isolate overflow-hidden py-24 relative">
      <Image
        src="/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover opacity-30"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-12 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both' }}>
          <h2 
            className="sm:text-4xl text-3xl font-medium text-white tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Our Offices
          </h2>
          <p className="mt-4 text-base text-white/75 max-w-2xl mx-auto">
            Visit us at any of our global locations or connect with us virtually.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: MapPin,
              title: 'Headquarters',
              content: '123 Innovation Drive\nSan Francisco, CA 94105\nUnited States',
              color: 'from-sky-400 to-blue-500'
            },
            {
              icon: Clock,
              title: 'Business Hours',
              content: 'Monday - Friday\n9:00 AM - 6:00 PM PST\nWeekends: By appointment',
              color: 'from-emerald-400 to-emerald-500'
            },
            {
              icon: Globe,
              title: 'Global Presence',
              content: 'San Francisco • New York\nLondon • Singapore\nTokyo • Sydney',
              color: 'from-amber-300 to-amber-400'
            },
            {
              icon: Users,
              title: 'Support',
              content: '24/7 Support Available\nEnterprise customers\nPriority assistance',
              color: 'from-purple-400 to-purple-500'
            }
          ].map((item, index) => (
            <div
              key={index}
              className="animate-on-scroll rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl"
              style={{ animation: `fadeSlideIn 1s ease-out ${0.2 + index * 0.1}s both` }}
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${item.color} mb-4`}>
                <item.icon className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-base font-medium text-white/90 mb-2">{item.title}</h3>
              <p className="text-sm text-white/70 whitespace-pre-line leading-relaxed">
                {item.content}
              </p>
            </div>
          ))}
        </div>

        {/* Map placeholder */}
        <div className="mt-12 animate-on-scroll rounded-3xl overflow-hidden border border-white/10" style={{ animation: 'fadeSlideIn 1s ease-out 0.7s both' }}>
          <div className="relative h-96 bg-white/5">
            <Image
              src="/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg"
              alt="Office location"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-white/80 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-lg font-medium text-white/90">Visit Our Headquarters</p>
                <p className="text-sm text-white/70 mt-2">123 Innovation Drive, San Francisco, CA 94105</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
                >
                  <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  Open in Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

