"use client";

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Building2, Users, MapPin, Star } from 'lucide-react';

export default function StatsSection() {
  useScrollAnimation();

  const stats = [
    {
      icon: Building2,
      value: "14+",
      label: "Premium Properties"
    },
    {
      icon: Users,
      value: "500+",
      label: "Happy Guests"
    },
    {
      icon: MapPin,
      value: "8+",
      label: "African Cities"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Guest Rating"
    }
  ];

  return (
    <section className="isolate overflow-hidden py-16 relative bg-white border-b border-gray-200">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-on-scroll"
              style={{ animation: `fadeSlideIn 1s ease-out ${0.2 + index * 0.1}s both` }}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 ring-1 ring-gray-200">
                  <stat.icon className="h-6 w-6 text-gray-700" strokeWidth={1.5} />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

