"use client";

import Link from 'next/link';
import { Asterisk, Twitter, Linkedin, Github, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="isolate overflow-hidden bg-black border-white/10 border-t relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,255,255,0.02),transparent_60%)]"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Logo and description */}
          <div className="col-span-5">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-semibold tracking-tight text-white/95">RIGHT STAY AFRICA</span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Your premier destination for exceptional short-term rentals across Africa. We deliver unforgettable experiences where comfort meets culture.
            </p>

            <div className="mt-6 flex items-center gap-4">
              {[
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Github, href: '#' }
              ].map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/10 hover:text-white/90"
                >
                  <social.icon className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="col-span-7 grid grid-cols-2 gap-8 md:grid-cols-3">
            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-medium text-white/90">Quick Links</h4>
              <ul className="mt-4 space-y-3">
                {[
                  { name: 'Accommodations', href: '/accommodations' },
                  { name: 'Tours', href: '/tours' },
                  { name: 'Asset Management', href: '/asset-management' },
                  { name: 'About Us', href: '/about' },
                  { name: 'Contact', href: '/contact' },
                  { name: 'Privacy Policy', href: '/privacy' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-sm text-white/70 hover:text-white/90">{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="text-sm font-medium text-white/90">Contact Us</h4>
              <ul className="mt-4 space-y-3">
                <li className="text-sm text-white/70">123 Main Street<br />City, Country</li>
                <li>
                  <Link href="tel:+15551234567" className="text-sm text-white/70 hover:text-white/90">+1 (555) 123-4567</Link>
                </li>
                <li>
                  <Link href="mailto:info@rightstayafrica.com" className="text-sm text-white/70 hover:text-white/90">info@rightstayafrica.com</Link>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="text-sm font-medium text-white/90">Follow Us</h4>
              <p className="mt-4 text-sm text-white/70 mb-4">Stay connected with us on social media for updates and offers.</p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Twitter, href: '#' },
                  { icon: Linkedin, href: '#' },
                  { icon: Github, href: '#' }
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/10 hover:text-white/90"
                  >
                    <social.icon className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Bottom section */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-white/50">© 2025 Right Stay Africa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

