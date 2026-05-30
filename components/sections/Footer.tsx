'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PublicSiteContact } from '@/lib/public-site-settings';
import {
  getPublicSiteContactEmail,
  SITE_LOCATION,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
} from '@/lib/site-contact';

const FOOTER_NAV_LINKS = [
  { name: 'Stay With Us', href: '/stay-with-us' },
  { name: 'Tours', href: '/tours' },
  { name: 'Property Management', href: '/host-with-us' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
] as const;

function getClientContactFallback(): PublicSiteContact {
  return {
    email: getPublicSiteContactEmail(),
    phone: SITE_PHONE_DISPLAY,
    phoneTel: SITE_PHONE_TEL,
    address: SITE_LOCATION,
  };
}

type FooterProps = {
  contact?: PublicSiteContact;
};

export default function Footer({ contact: contactProp }: FooterProps) {
  const [contact, setContact] = useState<PublicSiteContact>(contactProp ?? getClientContactFallback());

  useEffect(() => {
    if (contactProp) {
      setContact(contactProp);
      return;
    }

    let cancelled = false;

    fetch('/api/site-contact')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: PublicSiteContact | null) => {
        if (!cancelled && data) {
          setContact(data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [contactProp]);

  return (
    <footer className="isolate overflow-hidden bg-black border-white/10 border-t relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,255,255,0.02),transparent_60%)]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="col-span-5">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-semibold tracking-tight text-white/95">RIGHT STAY AFRICA</span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Your premier destination for exceptional short-term rentals across Africa. We deliver unforgettable experiences where comfort meets culture.
            </p>
          </div>

          <div className="col-span-7 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-white/90">Quick Links</h4>
              <ul className="mt-4 space-y-3">
                {FOOTER_NAV_LINKS.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-white/70 hover:text-white/90">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white/90">Contact Us</h4>
              <ul className="mt-4 space-y-3">
                {contact.address ? (
                  <li className="text-sm text-white/70 whitespace-pre-line">{contact.address}</li>
                ) : null}
                {contact.phone ? (
                  <li>
                    <Link href={`tel:${contact.phoneTel}`} className="text-sm text-white/70 hover:text-white/90">
                      {contact.phone}
                    </Link>
                  </li>
                ) : null}
                {contact.email ? (
                  <li>
                    <Link href={`mailto:${contact.email}`} className="text-sm text-white/70 hover:text-white/90">
                      {contact.email}
                    </Link>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/50">© 2026 Right Stay Africa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
