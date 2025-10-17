"use client";

import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Heart, Target, Award, Users } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Passion for Excellence",
      description: "We're passionate about delivering exceptional experiences. Every property, every guest interaction, and every detail matters to us."
    },
    {
      icon: Target,
      title: "Integrity & Transparency",
      description: "Honesty is at the core of everything we do. We believe in transparent communication with both guests and property owners."
    },
    {
      icon: Award,
      title: "Quality First",
      description: "We maintain the highest standards across all our properties and services. Quality is never compromised."
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "We're committed to supporting local communities and showcasing the authentic culture of Africa."
    }
  ];

  const team = [
    {
      name: "Thabo Mbeki",
      role: "Founder & CEO",
      description: "20+ years in hospitality and property management across Africa."
    },
    {
      name: "Lindiwe Nkosi",
      role: "Head of Operations",
      description: "Expert in guest services and operational excellence."
    },
    {
      name: "David van der Merwe",
      role: "Property Manager",
      description: "Specialist in asset management and property optimization."
    }
  ];

  return (
    <>
      <section className="isolate min-h-[500px] overflow-hidden relative">
        <Image
          src="/cpt-lions-head-1.jpg"
          alt="About Right Stay Africa"
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
            About Right Stay Africa
          </h1>
          <p className="sm:text-xl text-lg leading-relaxed text-white/90 max-w-3xl mt-6">
            Your trusted partner for exceptional African experiences. We&apos;re redefining hospitality across the continent.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="isolate overflow-hidden py-24 relative bg-white">
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 
              className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight mb-8"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Our Story
            </h2>
            <div className="prose prose-lg text-gray-600">
              <p className="text-xl leading-relaxed mb-6">
                Right Stay Africa was born from a simple belief: that exceptional hospitality should be accessible, transparent, and authentically African.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Founded in 2020, we started with a single property in Cape Town and a vision to showcase the best of what Africa has to offer. Today, we manage a diverse portfolio of premium accommodations across South Africa, each one carefully selected to provide guests with unforgettable experiences.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                We&apos;re more than just a property management company. We&apos;re storytellers, cultural ambassadors, and passionate advocates for African tourism. Every property in our portfolio tells a story, and every guest becomes part of our extended family.
              </p>
              <p className="text-lg leading-relaxed">
                Our commitment to excellence, transparency, and authentic experiences has earned us the trust of hundreds of guests and property owners across the continent. We&apos;re proud to be setting new standards in African hospitality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="isolate overflow-hidden py-24 relative bg-gray-50">
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 
              className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Our Values
            </h2>
            <p className="sm:text-xl text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto mt-6">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 mb-6">
                  <value.icon className="h-7 w-7 text-blue-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="isolate overflow-hidden py-24 relative bg-white">
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 
              className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Meet Our Team
            </h2>
            <p className="sm:text-xl text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto mt-6">
              The passionate people behind Right Stay Africa
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
            {team.map((member) => (
              <div
                key={member.name}
                className="text-center"
              >
                <div className="relative h-64 w-64 mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Users className="h-24 w-24 text-blue-400" strokeWidth={1} />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-base">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="isolate overflow-hidden py-24 relative bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 text-center">
          <h2 
            className="sm:text-5xl lg:text-6xl text-4xl font-medium text-white tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Ready to Experience the Difference?
          </h2>
          <p className="sm:text-xl text-lg leading-relaxed text-white/90 max-w-3xl mx-auto mt-6 mb-10">
            Whether you&apos;re looking for your next African adventure or want to partner with us, we&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/accommodations"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-colors duration-200"
            >
              Browse Properties
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/20 transition-colors duration-200 border border-white/20"
            >
              Contact Us
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

