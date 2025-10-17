"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Star, MapPin, Users, Calendar, Wifi, Car, Coffee, Shield } from 'lucide-react';

interface PropertyData {
  id?: string;
  type?: string;
  attributes?: {
    name?: string;
    nickname?: string;
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    beds?: number;
    maximum_capacity?: number;
    currency?: string;
    description?: string;
    check_in_time?: number;
    check_out_time?: number;
    property_slug?: string;
    time_zone?: string;
    created_at?: string;
  };
  relationships?: {
    photos?: {
      data?: Array<{ id: string; type: string }>;
    };
    amenities?: {
      data?: Array<{ id: string; type: string }>;
    };
  };
}

interface PropertyPhoto {
  id: string;
  property_id: string;
  photo_id: string;
  url: string;
  caption: string | null;
  position: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
}

interface CachedProperty {
  id: string;
  uplisting_id: string;
  data: PropertyData;
  last_synced: string;
  created_at: string;
  updated_at: string;
  photos?: PropertyPhoto[];
}

export default function AccommodationCards() {
  useScrollAnimation();
  const [properties, setProperties] = useState<CachedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties');
        const result = await response.json();
        
        console.log('API Response:', result);
        
        if (result.properties) {
          console.log('Properties found:', result.properties.length);
          setProperties(result.properties);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  // Fallback accommodations if no data from DB
  const fallbackAccommodations = [
    {
      id: 1,
      title: "Cape Town Luxury Villa",
      location: "Camps Bay, Cape Town",
      price: "R2,500",
      priceUnit: "per night",
      rating: 4.9,
      reviews: 127,
      guests: 6,
      bedrooms: 3,
      bathrooms: 2,
      image: "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg",
      amenities: ["WiFi", "Parking", "Pool", "Ocean View"],
      description: "Stunning oceanfront villa with panoramic views of the Atlantic Ocean. Perfect for families and groups seeking luxury and comfort."
    },
    {
      id: 2,
      title: "Safari Lodge Retreat",
      location: "Kruger National Park",
      price: "R4,200",
      priceUnit: "per night",
      rating: 4.8,
      reviews: 89,
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      image: "/images/6d30fe29-43aa-4fc2-a513-6aa41d38a7d0_3840w_1.jpg",
      amenities: ["WiFi", "Parking", "Safari", "Game Drives"],
      description: "Authentic safari experience with luxury accommodations. Wake up to the sounds of the African bush and spot the Big Five."
    },
    {
      id: 3,
      title: "Wine Estate Villa",
      location: "Stellenbosch, Western Cape",
      price: "R3,800",
      priceUnit: "per night",
      rating: 4.9,
      reviews: 156,
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      image: "/images/d953ad7f-2dd7-42f7-8f74-593d55181036_3840w_1.jpg",
      amenities: ["WiFi", "Parking", "Wine Tasting", "Vineyard Views"],
      description: "Elegant villa on a working wine estate. Enjoy wine tastings, vineyard tours, and breathtaking mountain views."
    }
  ];

  // Transform Supabase data to accommodation format
  const accommodations = properties.length > 0 
    ? properties.map((property) => {
        const data = property.data;
        const attributes = data.attributes || {};
        
        // Use real photos from database, fallback to placeholder if none available
        const photos = property.photos || [];
        const primaryPhoto = photos.find(p => p.is_primary) || photos[0];
        const firstImage = primaryPhoto?.url || "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg";
        
        // Generate a price range since base price isn't directly available
        const price = attributes.currency === 'USD' ? 'From $85' : 'From R1,500';
        
        return {
          id: property.uplisting_id,
          title: attributes.name || attributes.nickname || "Luxury Property",
          location: "Cape Town, South Africa", // Most properties are in Cape Town based on the data
          price: price,
          priceUnit: "per night",
          rating: 4.8,
          reviews: Math.floor(Math.random() * 100) + 50,
          guests: attributes.maximum_capacity || 2,
          bedrooms: attributes.bedrooms || 1,
          bathrooms: attributes.bathrooms || 1,
          image: firstImage,
          amenities: ["WiFi", "Parking", "Air Conditioning", "Kitchen"],
          description: attributes.description?.substring(0, 150) + "..." || `${attributes.type || 'Beautiful property'} in Cape Town. Perfect for your African getaway.`
        };
      })
    : fallbackAccommodations;

  if (loading) {
    return (
      <section className="isolate py-24 relative bg-gray-50">
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg w-3/4 mx-auto mb-6"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-1/2 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8 mt-16">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-3xl mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  console.log('Rendering AccommodationCards with:', { 
    properties: properties.length, 
    loading, 
    accommodations: accommodations.length,
    accommodationsData: accommodations
  });

  return (
    <section className="isolate py-24 relative bg-gray-50">
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 
            className="sm:text-5xl lg:text-6xl text-4xl font-medium text-gray-900 tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Premium Accommodations
          </h2>
          <p 
            className="sm:text-xl text-lg leading-relaxed text-gray-600 max-w-3xl mx-auto mt-6"
          >
            {properties.length > 0 
              ? `Browse our ${properties.length} curated properties from our Uplisting collection.` 
              : "Discover our curated collection of luxury properties across South Africa. From coastal villas to safari lodges, each accommodation offers an unforgettable experience."}
          </p>
        </div>


        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
          {accommodations.map((accommodation, index) => (
            <div
              key={accommodation.id}
              className="group rounded-3xl border border-gray-200 bg-white shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] hover:shadow-[0_4px_6px_rgba(0,_0,_0,_0.1),_0_10px_15px_rgba(0,_0,_0,_0.1)] transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={accommodation.image}
                  alt={accommodation.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">{accommodation.rating}</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{accommodation.guests} guests</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {accommodation.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{accommodation.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{accommodation.price}</div>
                    <div className="text-sm text-gray-600">{accommodation.priceUnit}</div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {accommodation.description}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {accommodation.amenities.map((amenity, amenityIndex) => (
                    <span
                      key={amenityIndex}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
                    >
                      {amenity === "WiFi" && <Wifi className="h-3 w-3" />}
                      {amenity === "Parking" && <Car className="h-3 w-3" />}
                      {amenity === "Pool" && <Shield className="h-3 w-3" />}
                      {amenity === "Ocean View" && <MapPin className="h-3 w-3" />}
                      {amenity === "Safari" && <Shield className="h-3 w-3" />}
                      {amenity === "Game Drives" && <Car className="h-3 w-3" />}
                      {amenity === "Wine Tasting" && <Coffee className="h-3 w-3" />}
                      {amenity === "Vineyard Views" && <MapPin className="h-3 w-3" />}
                      {amenity === "Beach Access" && <MapPin className="h-3 w-3" />}
                      {amenity === "Whale Watching" && <Shield className="h-3 w-3" />}
                      {amenity === "Hiking" && <MapPin className="h-3 w-3" />}
                      {amenity === "Mountain Views" && <MapPin className="h-3 w-3" />}
                      {amenity === "Gym" && <Shield className="h-3 w-3" />}
                      {amenity === "City Views" && <MapPin className="h-3 w-3" />}
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Reviews */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{accommodation.rating}</span>
                    <span className="text-sm text-gray-600">({accommodation.reviews} reviews)</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {accommodation.bedrooms} bed • {accommodation.bathrooms} bath
                  </div>
                </div>

                {/* Book Button */}
                <Link
                  href={`/accommodations/${accommodation.id}/book`}
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-2xl hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/accommodations"
            className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-gray-800 transition-colors duration-200"
          >
            View All Accommodations
            <Calendar className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
