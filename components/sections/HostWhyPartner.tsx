"use client";

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { TrendingUp, Zap, ShieldCheck, BarChart3, Headphones, Clock } from 'lucide-react';

export default function HostWhyPartner() {
  useScrollAnimation();

  const features = [
    {
      icon: TrendingUp,
      title: "Maximize Revenue",
      description: "Access to multiple booking channels increases your property's visibility and booking potential, driving higher occupancy rates and revenue."
    },
    {
      icon: Zap,
      title: "Dynamic Pricing",
      description: "AI-powered pricing optimization adjusts rates in real-time based on demand, seasonality, and market conditions to maximize your earnings."
    },
    {
      icon: ShieldCheck,
      title: "Trusted Platform",
      description: "We handle all the complexities of multi-channel distribution, payment processing, and guest communication with complete transparency."
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Comprehensive reporting and analytics give you insights into your property's performance, occupancy trends, and revenue optimization opportunities."
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      description: "Our team provides 24/7 guest support, handles inquiries, manages bookings, and ensures smooth operations so you can focus on what matters."
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Automated calendar synchronization, pricing updates, and guest communication save you hours every week while increasing your bookings."
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
            Why Partner With Right Stay Africa?
          </h2>
          <p 
            className="sm:text-xl text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto mt-6 animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}
          >
            Join property owners across Africa who trust us to maximize their rental income while providing exceptional guest experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-8 hover:bg-white hover:shadow-lg transition-all duration-300 animate-on-scroll"
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
