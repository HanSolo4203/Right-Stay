"use client";

import HeroBackgroundImage from '@/components/ui/HeroBackgroundImage';
import { MARKETING_IMAGES } from '@/lib/marketing-images';
import type { PublicSiteContact } from '@/lib/public-site-settings';
import { Mail, MapPin, Phone } from 'lucide-react';

type ContactHeroProps = {
  contact: PublicSiteContact;
};

export default function ContactHero({ contact }: ContactHeroProps) {
  const contactItems = [
    ...(contact.email
      ? [{ icon: Mail, label: contact.email, href: `mailto:${contact.email}` as const }]
      : []),
    ...(contact.phone
      ? [{ icon: Phone, label: contact.phone, href: `tel:${contact.phoneTel}` as const }]
      : []),
    ...(contact.address
      ? [{ icon: MapPin, label: contact.address.replace(/\n/g, ', '), href: '#offices' as const }]
      : []),
  ];
  return (
    <section className="isolate min-h-[500px] sm:min-h-[600px] overflow-hidden relative">
      <div className="absolute inset-0">
        <HeroBackgroundImage
          src={MARKETING_IMAGES.heroCapeTown}
          className="pointer-events-none object-cover"
          style={{
            maskImage:
              'linear-gradient(to bottom, black 48%, rgba(0,0,0,0.75) 68%, rgba(0,0,0,0.25) 86%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 48%, rgba(0,0,0,0.75) 68%, rgba(0,0,0,0.25) 86%, transparent 100%)',
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(0,0,0,0.3),rgba(0,0,0,0.7)),linear-gradient(to_top,rgba(0,0,0,0.85),rgba(0,0,0,0.35))]" />

      <div className="z-10 relative">
        <div className="flex flex-col h-full min-h-[420px] sm:min-h-[500px] max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 pb-12 sm:pb-16 justify-center items-center text-center">
          <div style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}>
            <h1 className="font-display sm:text-6xl lg:text-7xl text-4xl sm:text-5xl font-medium text-white tracking-tight drop-shadow-xl max-w-4xl">
              Get in Touch
            </h1>

            <p
              className="leading-relaxed text-base sm:text-lg text-white/85 max-w-2xl mt-6 mx-auto px-2"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}
            >
              Questions about a stay, listing your property, or planning a tour? Our team is here to help you experience
              the best of Africa with Right Stay.
            </p>

            <div
              className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 mt-10 px-2"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.6s both' }}
            >
              {contactItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center justify-center gap-2 text-sm text-white/80 hover:text-white transition min-h-11"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <span className="break-all sm:break-normal">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
