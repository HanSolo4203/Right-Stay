"use client";

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Search, CheckCircle, Star } from 'lucide-react';

export default function HowItWorksSection() {
  useScrollAnimation();

  const steps = [
    {
      number: "01",
      icon: Search,
      emoji: "🔍",
      title: "Search & Discover",
      description: "Browse our curated collection of premium properties across Africa. Filter by location, amenities, and price to find your perfect match."
    },
    {
      number: "02",
      icon: CheckCircle,
      emoji: "✓",
      title: "Book with Confidence",
      description: "Secure your dates with instant confirmation. Our transparent pricing and flexible policies ensure a worry-free booking experience."
    },
    {
      number: "03",
      icon: Star,
      emoji: "⭐",
      title: "Experience Excellence",
      description: "Arrive to a spotlessly clean, fully equipped property. Enjoy 24/7 support throughout your stay and create lasting memories."
    }
  ];

  return (
    <section className="isolate overflow-hidden py-24 relative bg-gray-50">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 
            className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.1s both', fontFamily: 'Manrope, sans-serif' }}
          >
            How It Works
          </h2>
          <p 
            className="sm:text-xl text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto mt-6 animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}
          >
            Your journey to an unforgettable African stay is just three simple steps away
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative text-center animate-on-scroll"
              style={{ animation: `fadeSlideIn 1s ease-out ${0.3 + index * 0.2}s both` }}
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-transparent"></div>
              )}
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white border-2 border-blue-200 shadow-lg">
                    <span className="text-6xl">{step.emoji}</span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-blue-600 tracking-wider mb-3">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

