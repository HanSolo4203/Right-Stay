"use client";

import HeroBackgroundImage from '@/components/ui/HeroBackgroundImage';
import HeroPremiumFadeOverlay from '@/components/ui/HeroPremiumFadeOverlay';
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
    <>
      <div className="absolute inset-0">
        <HeroBackgroundImage
          src={MARKETING_IMAGES.contactHero}
          priority
          className="brightness-[1.12]"
        />
      </div>

      <div className="z-10 relative">
        <div className="flex flex-col min-h-[calc(100svh-96px)] max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 pb-28 sm:pb-32 justify-center items-center text-center">
          <div className="relative w-full">
            <div aria-hidden className="hero-copy-scrim" />
            <div style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}>
              <h1 className="hero-copy-readable font-display sm:text-6xl lg:text-7xl text-4xl sm:text-5xl font-medium text-white tracking-tight max-w-4xl mx-auto">
                Get in Touch
              </h1>

              <p
                className="hero-copy-readable leading-relaxed text-base sm:text-lg text-white max-w-2xl mt-6 mx-auto px-2"
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
                    className="hero-copy-readable inline-flex items-center justify-center gap-2 text-sm text-white/90 hover:text-white transition min-h-11"
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
      </div>

      <HeroPremiumFadeOverlay />
    </>
  );
}
