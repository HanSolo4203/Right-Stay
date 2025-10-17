"use client";

import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, TrendingUp, DollarSign, Shield, BarChart3, Calendar, Users } from 'lucide-react';

export default function AssetManagementPage() {
  const services = [
    {
      icon: Calendar,
      title: "Booking Management",
      description: "Full calendar management across multiple platforms including Airbnb, Booking.com, and direct bookings. Optimized pricing strategies to maximize your revenue."
    },
    {
      icon: Users,
      title: "Guest Services",
      description: "Professional guest communication, check-in coordination, and 24/7 support. We handle all guest inquiries and ensure exceptional experiences."
    },
    {
      icon: Shield,
      title: "Property Maintenance",
      description: "Regular inspections, preventative maintenance, and emergency repairs. We keep your property in pristine condition at all times."
    },
    {
      icon: DollarSign,
      title: "Financial Management",
      description: "Detailed financial reporting, expense tracking, and transparent accounting. Always know exactly how your property is performing."
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Data-driven insights on occupancy rates, revenue trends, and market positioning. Make informed decisions about your investment."
    },
    {
      icon: TrendingUp,
      title: "Revenue Optimization",
      description: "Dynamic pricing strategies, seasonal adjustments, and promotional campaigns to maximize your returns throughout the year."
    }
  ];

  const benefits = [
    "Comprehensive property management with zero hassle",
    "Transparent monthly reporting and financial statements",
    "Professional cleaning and maintenance coordination",
    "Marketing across major booking platforms",
    "Legal compliance and guest vetting",
    "Insurance and risk management"
  ];

  return (
    <>
      <section className="isolate min-h-[500px] overflow-hidden relative">
        <Image
          src="/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg"
          alt="Asset Management"
          fill
          sizes="100vw"
          className="pointer-events-none object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/70 to-black/50"></div>
        
        <Header />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <h1
            className="sm:text-6xl lg:text-7xl text-5xl font-medium text-white tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Asset Management
          </h1>
          <p className="sm:text-xl text-lg leading-relaxed text-white/90 max-w-3xl mt-6">
            Comprehensive property management services for owners. We handle everything from bookings and cleaning to maintenance and financial reporting with complete transparency.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="isolate overflow-hidden py-24 relative bg-white">
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 
              className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              White-Glove Property Management
            </h2>
            <p className="sm:text-xl text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto mt-6">
              Let us handle the complexities of property management while you enjoy the returns
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-8 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-5">
                  <service.icon className="h-6 w-6 text-blue-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="isolate overflow-hidden py-24 relative bg-gray-50">
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg"
                  alt="Property Management"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 
                className="sm:text-5xl lg:text-5xl text-4xl font-medium text-gray-900 tracking-tight mb-6"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Why Partner With Us?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We treat your property as if it were our own, ensuring maximum returns while maintaining the highest standards of care.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-gray-700 text-base">{benefit}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-10 bg-blue-600 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-blue-700 transition-colors duration-200"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="isolate overflow-hidden py-24 relative bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 text-center">
          <h2 
            className="sm:text-5xl lg:text-5xl text-4xl font-medium text-white tracking-tight mb-16"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Our Track Record
          </h2>
          
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {[
              { value: "R18.5M+", label: "Portfolio Value" },
              { value: "98%", label: "Occupancy Rate" },
              { value: "14+", label: "Properties Managed" },
              { value: "4.9/5", label: "Owner Satisfaction" }
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-5xl font-bold text-white tracking-tight mb-2">
                  {stat.value}
                </div>
                <div className="text-white/80 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

