"use client";

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ShieldCheck, Star, Headphones, MapPin, DollarSign, Zap } from 'lucide-react';

export default function WhyChooseSection() {
  useScrollAnimation();

  const features = [
    {
      icon: ShieldCheck,
      title: "Verified & Secure",
      description: "Every property is personally inspected and verified. Your safety and security are our top priorities."
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "Handpicked accommodations that meet our high standards for comfort, cleanliness, and style."
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Round-the-clock guest support in multiple languages. We're here whenever you need us."
    },
    {
      icon: MapPin,
      title: "Prime Locations",
      description: "Properties strategically located in the heart of Africa's most vibrant and sought-after destinations."
    },
    {
      icon: DollarSign,
      title: "Best Value",
      description: "Competitive pricing with transparent fees. No hidden charges, just exceptional value for money."
    },
    {
      icon: Zap,
      title: "Instant Booking",
      description: "Seamless booking process with instant confirmation. Start planning your African adventure today."
    }
  ];

  return (
    <section className="isolate overflow-hidden py-24 relative bg-white">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 
            className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both', fontFamily: 'Manrope, sans-serif' }}
          >
            Why Choose Right Stay Africa?
          </h2>
          <p 
            className="sm:text-xl text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto mt-6 animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}
          >
            We&apos;re not just another accommodation provider. We&apos;re your trusted partner for exceptional African experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-8 hover:bg-white hover:shadow-lg transition-all duration-300 animate-on-scroll"
              style={{ animation: `fadeSlideIn 1s ease-out ${0.3 + index * 0.1}s both` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-5">
                <feature.icon className="h-6 w-6 text-blue-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

