"use client";

import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactHero() {
  return (
    <section className="isolate min-h-[600px] overflow-hidden relative">
      <Image
        src="/images/6b428a64-0de1-4837-bab2-9729ce2e28c2_3840w_1.jpg"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover"
        style={{ 
          maskImage: 'linear-gradient(to bottom, black 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent)'
        }}
        priority
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(0,0,0,0.3),rgba(0,0,0,0.7)),linear-gradient(to_top,rgba(0,0,0,0.85),rgba(0,0,0,0.35))]"></div>

      <div className="z-10 relative">
        <div className="flex flex-col md:px-8 h-full min-h-[500px] max-w-7xl mr-auto ml-auto pt-16 pr-6 pb-16 pl-6 justify-center items-center text-center">
          <div style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}>
            <h1 
              className="sm:text-6xl lg:text-7xl text-5xl font-medium text-white tracking-tight drop-shadow-xl max-w-4xl"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Get in Touch
            </h1>
            
            <p 
              className="leading-relaxed text-lg text-white/85 max-w-2xl mt-6 mx-auto"
              style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}
            >
              Have questions about Axiom? Our team is here to help you build intelligent systems that scale. Reach out and let&apos;s discuss your AI needs.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mt-10" style={{ animation: 'fadeSlideIn 1s ease-out 0.6s both' }}>
              {[
                { icon: Mail, label: 'contact@axiom.ai', href: 'mailto:contact@axiom.ai' },
                { icon: Phone, label: '+1 (555) 123-4567', href: 'tel:+15551234567' },
                { icon: MapPin, label: 'San Francisco, CA', href: '#location' }
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white/100 transition"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                    <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
}

