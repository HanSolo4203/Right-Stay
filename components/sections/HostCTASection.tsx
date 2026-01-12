"use client";

import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ArrowRight, Calendar, CheckCircle, Headphones } from 'lucide-react';

export default function HostCTASection() {
  useScrollAnimation();

  return (
    <section id="consultation" className="isolate overflow-hidden py-24 relative bg-gradient-to-br from-right-stay-500 to-right-stay-600">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,255,255,0.1),transparent)]"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 
            className="sm:text-5xl lg:text-6xl text-4xl font-medium text-white tracking-tight animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both', fontFamily: 'Manrope, sans-serif' }}
          >
            Ready to Maximize Your Property&apos;s Potential?
          </h2>
          <p 
            className="sm:text-xl text-lg leading-relaxed text-white/90 max-w-3xl mx-auto mt-6 animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}
          >
            Join property owners across Africa who trust Right Stay Africa to handle their short-term rental business. Start earning more today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.3s both' }}>
            <Link
              href="#earnings-estimator"
              className="inline-flex items-center justify-center gap-2 bg-white text-right-stay-500 font-semibold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-colors duration-200 shadow-xl"
            >
              List My Property
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/20 transition-colors duration-200 border border-white/20"
            >
              <Calendar className="h-5 w-5" />
              Book a Consultation
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}>
            {[
              { icon: CheckCircle, label: "Transparent Reporting" },
              { icon: Headphones, label: "24/7 Support" },
              { icon: ArrowRight, label: "Easy Setup" }
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-white/90">
                <badge.icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
