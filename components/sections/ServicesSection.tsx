"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Home, Compass, TrendingUp, ArrowRight } from 'lucide-react';

export default function ServicesSection() {
  useScrollAnimation();

  const services = [
    {
      icon: Home,
      title: "Luxury Accommodations",
      description: "Experience premium short-term rentals across Africa's most vibrant cities. Each property is carefully curated to ensure comfort, style, and authentic local experiences.",
      link: "/accommodations",
      linkText: "Browse Properties",
      image: "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg"
    },
    {
      icon: Compass,
      title: "Curated Tours",
      description: "Discover Africa's hidden gems with our expertly designed tours. From cultural experiences to adventure excursions, we create unforgettable journeys tailored to your interests.",
      link: "/tours",
      linkText: "Explore Tours",
      image: "/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_3840w_1.jpg"
    },
    {
      icon: TrendingUp,
      title: "Asset Management",
      description: "Comprehensive property management services for owners. We handle everything from bookings and cleaning to maintenance and financial reporting with complete transparency.",
      link: "/asset-management",
      linkText: "Learn More",
      image: "/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg"
    }
  ];

  return (
    <section className="isolate overflow-hidden py-24 relative bg-gray-50">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 text-xs uppercase ring-gray-200 ring-1 animate-on-scroll text-gray-600 tracking-[0.18em] bg-white rounded-full pt-1 pr-3 pb-1 pl-3 mb-6" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.1s both' }}>
            What We Offer
          </span>
          <h2 
            className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.2s both', fontFamily: 'Manrope, sans-serif' }}
          >
            Our Premium Services
          </h2>
          <p 
            className="sm:text-xl text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto mt-6 animate-on-scroll"
            style={{ animation: 'fadeSlideIn 1s ease-out 0.3s both' }}
          >
            From luxurious stays to expertly curated experiences, we provide end-to-end solutions for unforgettable African adventures
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-on-scroll"
              style={{ animation: `fadeSlideIn 1s ease-out ${0.5 + index * 0.1}s both` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm">
                    <service.icon className="h-6 w-6 text-gray-900" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-base mb-6 leading-relaxed">
                  {service.description}
                </p>
                <Link
                  href={service.link}
                  className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all duration-200"
                >
                  {service.linkText}
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 animate-on-scroll" style={{ animation: 'fadeSlideIn 1s ease-out 1.0s both' }}>
          <p className="text-gray-600 text-lg">
            Can&apos;t find what you&apos;re looking for? We&apos;re here to help create your perfect experience.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 mt-6 bg-gray-900 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-gray-800 transition-colors duration-200"
          >
            Get in Touch
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

