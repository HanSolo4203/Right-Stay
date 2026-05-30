"use client";

import Image from 'next/image';
import HeroBackgroundImage from '@/components/ui/HeroBackgroundImage';
import { IMAGE_SIZES } from '@/lib/image-sizes';
import { Clock, MapPin, Globe, Users } from 'lucide-react';

const OFFICE_CARDS = [
  {
    icon: MapPin,
    title: 'Cape Town Office',
    content: 'Cape Town\nWestern Cape\nSouth Africa',
    color: 'from-right-stay-400 to-right-stay-600',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    content: 'Monday – Friday\n9:00 AM – 5:00 PM SAST\nWeekends: By appointment',
    color: 'from-emerald-400 to-emerald-500',
  },
  {
    icon: Globe,
    title: 'Service Areas',
    content: 'Cape Town • Stellenbosch\nJohannesburg • Durban\nGarden Route',
    color: 'from-amber-300 to-amber-400',
  },
  {
    icon: Users,
    title: 'Guest Support',
    content: 'Dedicated support for guests\nand property owners\nPriority assistance',
    color: 'from-sky-400 to-blue-500',
  },
] as const;

export default function ContactInfo() {
  return (
    <section id="offices" className="isolate overflow-hidden py-16 sm:py-24 relative scroll-mt-24">
      <div className="absolute inset-0">
        <HeroBackgroundImage
          src="/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg"
          className="pointer-events-none object-cover opacity-30"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="text-center mb-10 sm:mb-12 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both' }}>
          <h2 className="font-display sm:text-4xl text-3xl font-medium text-white tracking-tight">
            Our Presence
          </h2>
          <p className="mt-4 text-base text-white/75 max-w-2xl mx-auto px-2">
            Based in Cape Town with premium properties and partners across South Africa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {OFFICE_CARDS.map((item, index) => (
            <div
              key={item.title}
              className="animate-on-scroll rounded-3xl border border-white/10 bg-black/60 p-5 sm:p-6 backdrop-blur-xl"
              style={{ animation: `fadeSlideIn 1s ease-out ${0.2 + index * 0.1}s both` }}
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${item.color} mb-4`}>
                <item.icon className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-base font-medium text-white/90 mb-2">{item.title}</h3>
              <p className="text-sm text-white/70 whitespace-pre-line leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-10 sm:mt-12 animate-on-scroll rounded-3xl overflow-hidden border border-white/10"
          style={{ animation: 'fadeSlideIn 1s ease-out 0.7s both' }}
        >
          <div className="relative h-64 sm:h-96 bg-white/5">
            <Image
              src="/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg"
              alt="Cape Town coastline near Right Stay Africa properties"
              fill
              sizes={IMAGE_SIZES.half}
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-white/80 mx-auto mb-4" strokeWidth={1.5} />
                <p className="text-lg font-medium text-white/90">Cape Town, South Africa</p>
                <p className="text-sm text-white/70 mt-2">Premium stays across the Western Cape</p>
                <a
                  href="https://maps.google.com/?q=Cape+Town+South+Africa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-white/90 min-h-11"
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
