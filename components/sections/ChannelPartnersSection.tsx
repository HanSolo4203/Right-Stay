"use client";

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { CheckCircle } from 'lucide-react';

export default function ChannelPartnersSection() {
  useScrollAnimation();

  const channelBenefits = [
    "Multi-channel distribution across Airbnb, Booking.com, VRBO, Expedia, and Right Stay Direct",
    "Automated calendar synchronization prevents double bookings",
    "Unified inbox for guest communications across all platforms",
    "Consistent branding and professional listings on every channel",
    "Real-time availability updates across all booking platforms",
    "Comprehensive performance reporting by channel"
  ];

  const pricingBenefits = [
    "AI-powered dynamic pricing adjusts rates based on demand patterns",
    "Seasonal optimization maximizes revenue during peak periods",
    "Competitive market analysis ensures optimal pricing",
    "Last-minute booking discounts and long-stay incentives",
    "Event-based pricing adjustments for local happenings",
    "Automated rate updates across all channels in real-time"
  ];

  return (
    <section className="isolate overflow-hidden py-24 relative bg-gray-50">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Channel Partners */}
          <div className="animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}>
            <h2 
              className="sm:text-4xl text-3xl font-medium text-gray-900 tracking-tight mb-6"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Our Channel Partners
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Expand your reach and maximize bookings by listing on the world&apos;s leading booking platforms simultaneously.
            </p>
            <ul className="space-y-4">
              {channelBenefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 animate-on-scroll"
                  style={{ animation: `fadeSlideIn 1s ease-out ${0.4 + index * 0.1}s both` }}
                >
                  <CheckCircle className="h-6 w-6 text-right-stay-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="text-gray-700 text-base leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Pricing Engine */}
          <div className="animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.3s both' }}>
            <h2 
              className="sm:text-4xl text-3xl font-medium text-gray-900 tracking-tight mb-6"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Dynamic Pricing Engine
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Powered by PriceLabs, our intelligent pricing system ensures you always get the best rate for your property.
            </p>
            <ul className="space-y-4">
              {pricingBenefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 animate-on-scroll"
                  style={{ animation: `fadeSlideIn 1s ease-out ${0.5 + index * 0.1}s both` }}
                >
                  <CheckCircle className="h-6 w-6 text-right-stay-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="text-gray-700 text-base leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
