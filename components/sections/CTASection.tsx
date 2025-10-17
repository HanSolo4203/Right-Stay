"use client";

import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ArrowRight, ShieldCheck, CheckCircle, Headphones } from 'lucide-react';

export default function CTASection() {
  useScrollAnimation();

  return (
    <section className="isolate overflow-hidden py-24 relative bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(255,255,255,0.1),transparent)]"></div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 
            className="sm:text-5xl lg:text-6xl text-4xl font-medium text-white tracking-tight animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both', fontFamily: 'Manrope, sans-serif' }}
          >
            Ready to Experience Africa Your Way?
          </h2>
          <p 
            className="sm:text-xl text-lg leading-relaxed text-white/90 max-w-3xl mx-auto mt-6 animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}
          >
            Join thousands of travelers who have discovered the Right Stay Africa difference. Your perfect African adventure awaits.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.3s both' }}>
            <Link
              href="/accommodations"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-colors duration-200 shadow-xl"
            >
              Browse Properties
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/20 transition-colors duration-200 border border-white/20"
            >
              Contact Us
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}>
            {[
              { icon: ShieldCheck, label: "Secure Booking" },
              { icon: CheckCircle, label: "Verified Properties" },
              { icon: Headphones, label: "24/7 Support" }
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

