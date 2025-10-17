"use client";

import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, MapPin, Clock, Users, Star } from 'lucide-react';

export default function ToursPage() {
  const tours = [
    {
      id: 1,
      title: "Cape Town City & Table Mountain Tour",
      location: "Cape Town, Western Cape",
      duration: "Full Day (8 hours)",
      groupSize: "2-12 people",
      price: "R1,200",
      rating: 4.9,
      reviews: 234,
      image: "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg",
      description: "Experience the best of Cape Town with visits to Table Mountain, V&A Waterfront, and scenic coastal drives. Includes cable car tickets and lunch."
    },
    {
      id: 2,
      title: "Kruger Safari Experience",
      location: "Kruger National Park",
      duration: "3 Days / 2 Nights",
      groupSize: "2-8 people",
      price: "R8,500",
      rating: 5.0,
      reviews: 189,
      image: "/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_3840w_1.jpg",
      description: "Immersive Big Five safari experience with expert guides. Includes accommodations, all meals, and multiple game drives."
    },
    {
      id: 3,
      title: "Wine Route & Vineyard Tour",
      location: "Stellenbosch & Franschhoek",
      duration: "Full Day (7 hours)",
      groupSize: "2-10 people",
      price: "R1,800",
      rating: 4.8,
      reviews: 167,
      image: "/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg",
      description: "Visit renowned wine estates, enjoy tastings, and experience gourmet food pairings in the scenic Cape Winelands."
    },
    {
      id: 4,
      title: "Garden Route Adventure",
      location: "Eastern & Western Cape",
      duration: "5 Days / 4 Nights",
      groupSize: "2-6 people",
      price: "R15,000",
      rating: 4.9,
      reviews: 98,
      image: "/images/6b428a64-0de1-4837-bab2-9729ce2e28c2_3840w_1.jpg",
      description: "Explore South Africa's stunning Garden Route with stops at Knysna, Plettenberg Bay, and Tsitsikamma National Park."
    },
    {
      id: 5,
      title: "Soweto Cultural Experience",
      location: "Johannesburg, Gauteng",
      duration: "Half Day (4 hours)",
      groupSize: "2-15 people",
      price: "R850",
      rating: 4.7,
      reviews: 145,
      image: "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg",
      description: "Discover the rich history and vibrant culture of Soweto, including visits to Mandela House and the Apartheid Museum."
    },
    {
      id: 6,
      title: "Whale Watching Experience",
      location: "Hermanus, Western Cape",
      duration: "Half Day (5 hours)",
      groupSize: "2-20 people",
      price: "R950",
      rating: 4.8,
      reviews: 203,
      image: "/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg",
      description: "Witness the majestic Southern Right Whales during season (June-November) with expert marine guides."
    }
  ];

  return (
    <>
      <section className="isolate min-h-[400px] overflow-hidden relative bg-gradient-to-br from-emerald-600 to-teal-700">
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
            Curated African Tours
          </h1>
          <p className="sm:text-xl text-lg leading-relaxed text-white/90 max-w-3xl mt-6">
            Discover Africa&apos;s hidden gems with our expertly designed tours. From cultural experiences to adventure excursions, we create unforgettable journeys.
          </p>
        </div>
      </section>

      <section className="isolate overflow-hidden py-24 relative bg-gray-50">
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="group rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={tour.image}
                    alt={tour.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-gray-900">{tour.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {tour.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{tour.location}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tour.description}
                  </p>

                  {/* Tour details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{tour.groupSize}</span>
                    </div>
                  </div>

                  {/* Price and reviews */}
                  <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{tour.price}</div>
                      <div className="text-sm text-gray-600">per person</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {tour.reviews} reviews
                    </div>
                  </div>

                  {/* Book Button */}
                  <Link
                    href={`/tours/${tour.id}`}
                    className="w-full bg-emerald-600 text-white font-semibold py-3 px-4 rounded-2xl hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-16 bg-white rounded-3xl p-12 border border-gray-200">
            <h3 className="text-3xl font-semibold text-gray-900 mb-4">
              Looking for a Custom Experience?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              We can design a personalized tour tailored to your interests and schedule.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-gray-800 transition-colors duration-200"
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

