"use client";

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { CheckCircle } from 'lucide-react';

export default function HostBenefitsSection() {
  useScrollAnimation();

  const benefits = [
    "Higher occupancy rates through multi-channel distribution",
    "Optimized pricing that maximizes revenue while remaining competitive",
    "Professional property listings with high-quality photography",
    "Automated guest communication and check-in/check-out processes",
    "24/7 guest support handling inquiries and issues",
    "Transparent financial reporting and timely payouts",
    "Property maintenance coordination and quality assurance",
    "Marketing and promotion across all booking channels"
  ];

  const steps = [
    {
      number: "01",
      title: "List Your Property",
      description: "Submit your property details and photos. Our team will create professional listings across all booking platforms."
    },
    {
      number: "02",
      title: "Set Your Preferences",
      description: "Configure your pricing preferences, availability, house rules, and guest requirements. We'll optimize everything for maximum bookings."
    },
    {
      number: "03",
      title: "Start Earning",
      description: "Once live, your property will appear on all major booking platforms. Dynamic pricing and our marketing efforts drive bookings automatically."
    },
    {
      number: "04",
      title: "Track Performance",
      description: "Monitor your property's performance through our dashboard. Receive regular reports on occupancy, revenue, and guest feedback."
    }
  ];

  return (
    <section className="isolate overflow-hidden py-24 relative bg-white">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        {/* What You Get */}
        <div className="mb-20 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}>
          <h2 
            className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight mb-8 text-center"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            What You Get as a Host
          </h2>
          <div className="max-w-4xl mx-auto">
            <ul className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 animate-on-scroll"
                  style={{ animation: `fadeSlideIn 1s ease-out ${0.3 + index * 0.1}s both` }}
                >
                  <CheckCircle className="h-6 w-6 text-right-stay-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <span className="text-gray-700 text-base leading-relaxed">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How It Works */}
        <div className="animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.4s both' }}>
          <h2 
            className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight mb-12 text-center"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative animate-on-scroll"
                style={{ animation: `fadeSlideIn 1s ease-out ${0.5 + index * 0.2}s both` }}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-right-stay-100 border-2 border-right-stay-200">
                      <span className="text-xl font-bold text-right-stay-500">{step.number}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
