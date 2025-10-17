"use client";

import Image from 'next/image';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { DollarSign, MessageSquare, Users, Shield } from 'lucide-react';

export default function TrustSection() {
  useScrollAnimation();

  const trustFeatures = [
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "No hidden fees, no surprises. What you see is what you pay."
    },
    {
      icon: MessageSquare,
      title: "Verified Reviews",
      description: "Real experiences from real guests. Every review is authentic and verified."
    },
    {
      icon: Users,
      title: "Owner Partnership",
      description: "We treat property owners as partners, with complete financial transparency and regular reporting."
    },
    {
      icon: Shield,
      title: "Guest Protection",
      description: "Comprehensive insurance and support to ensure your peace of mind."
    }
  ];

  return (
    <section className="isolate overflow-hidden py-24 relative bg-white">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <div className="animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both' }}>
            <h2 
              className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Built on Trust & Transparency
            </h2>
            <p className="sm:text-lg text-base leading-relaxed text-gray-600 mt-6 mb-10">
              At Right Stay Africa, we believe that exceptional hospitality starts with honesty and integrity. We&apos;ve built our reputation by putting our guests and property owners first, ensuring every interaction is transparent, fair, and mutually beneficial.
            </p>

            <div className="space-y-6">
              {trustFeatures.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex gap-4 animate-on-scroll"
                  style={{ animation: `fadeSlideIn 1s ease-out ${0.4 + index * 0.1}s both` }}
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <feature.icon className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 0.3s both' }}>
            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg"
                alt="Modern African luxury accommodation"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Floating rating card */}
              <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-5xl font-bold text-gray-900">4.9/5</div>
                    <div className="text-sm text-gray-600 mt-1">Average Rating</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-6 w-6 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-yellow-400 fill-current opacity-50'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

