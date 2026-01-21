"use client";

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ShieldCheck, Star, MapPin, DollarSign, Zap } from 'lucide-react';

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

        <div className="flex flex-wrap justify-center gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] rounded-2xl border border-gray-200 bg-gray-50 p-8 hover:bg-white hover:shadow-lg transition-all duration-300 animate-on-scroll"
              style={{ animation: `fadeSlideIn 1s ease-out ${0.3 + index * 0.1}s both` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-right-stay-100 mb-5">
                <feature.icon className="h-6 w-6 text-right-stay-500" strokeWidth={1.5} />
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

