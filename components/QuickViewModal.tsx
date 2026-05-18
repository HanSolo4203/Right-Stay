"use client";

import { useState, useEffect, useMemo } from 'react';
import ListingImage from '@/components/ui/ListingImage';
import { X, ChevronLeft, ChevronRight, Grid, Wifi, Car, Coffee, Shield, MapPin, Star, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { listingImageSrc } from '@/lib/listing-image';

interface PropertyPhoto {
  id: string;
  property_id?: string;
  photo_id?: string;
  url: string;
  caption?: string | null;
  position?: number;
  is_primary?: boolean;
}

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    location: string;
    rating: number;
    reviews: number;
    guests: number;
    bedrooms: number;
    bathrooms: number;
    price: string;
    priceUnit?: string;
    description: string;
    amenities?: string[];
    photos?: PropertyPhoto[];
  };
}

export default function QuickViewModal({ isOpen, onClose, property }: QuickViewModalProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [lightboxMainLoaded, setLightboxMainLoaded] = useState(false);

  // Get photos array - handle both array format and single image
  // Use useMemo to prevent dependency changes on every render
  const photos = useMemo(() => property.photos || [], [property.photos]);
  const hasMultiplePhotos = photos.length > 1;
  
  // Get first 5 photos for the gallery grid
  const galleryPhotos = photos.slice(0, 5);
  const hasMorePhotos = photos.length > 5;
  const mainPhoto = photos[selectedPhotoIndex] || photos[0];

  // Find primary photo or use first photo on mount
  useEffect(() => {
    if (photos.length > 0 && isOpen) {
      const primaryIndex = photos.findIndex(p => p.is_primary);
      if (primaryIndex !== -1) {
        setSelectedPhotoIndex(primaryIndex);
      } else {
        setSelectedPhotoIndex(0);
      }
    }
  }, [photos, isOpen]);

  // Handle keyboard navigation for full-screen modal
  useEffect(() => {
    if (!showPhotoModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPhotoModal(false);
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        setSelectedPhotoIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPhotoModal, photos.length]);

  // Reset full-screen viewer loading state when the slide or viewer opens
  useEffect(() => {
    setLightboxMainLoaded(false);
  }, [selectedPhotoIndex, showPhotoModal]);

  // Warm browser cache for current and neighbour slides (full-size URLs)
  useEffect(() => {
    if (!showPhotoModal || photos.length === 0) return;
    const preload = (idx: number) => {
      if (idx < 0 || idx >= photos.length) return;
      const href = listingImageSrc(photos[idx].url, 'lightbox');
      if (!href) return;
      const img = new window.Image();
      img.src = href;
    };
    preload(selectedPhotoIndex);
    preload(selectedPhotoIndex - 1);
    preload(selectedPhotoIndex + 1);
  }, [showPhotoModal, selectedPhotoIndex, photos]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const amenities = property.amenities || [];
  const primaryPhoto = photos.find(p => p.is_primary) || photos[0];
  const propertyImage = primaryPhoto?.url || photos[0]?.url || "/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div className="relative z-10 w-full max-w-6xl max-h-[90vh] mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors pointer-events-auto"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-900" />
            </button>
          </div>

          {/* Photo Gallery Section - Same layout as booking page */}
          {photos.length > 0 ? (
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[300px] md:h-[400px]">
                {/* Main Large Photo */}
                <div 
                  className="col-span-4 md:col-span-2 relative group cursor-pointer rounded-lg overflow-hidden" 
                  onClick={() => setShowPhotoModal(true)}
                >
                  <ListingImage
                    key={mainPhoto?.id ?? `main-${selectedPhotoIndex}`}
                    src={mainPhoto?.url || propertyImage}
                    alt={property.title}
                    variant="modalMain"
                    fill
                    className="object-cover"
                  />
                  {hasMultiplePhotos && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                        aria-label="Previous photo"
                      >
                        <ChevronLeft className="h-5 w-5 text-gray-900" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhotoIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                        aria-label="Next photo"
                      >
                        <ChevronRight className="h-5 w-5 text-gray-900" />
                      </button>
                    </>
                  )}
                </div>

                {/* Photo Grid (Right Side) */}
                {hasMultiplePhotos && (
                  <div className="col-span-4 md:col-span-2 grid grid-cols-2 gap-2">
                    {galleryPhotos.slice(1, 5).map((photo, index) => {
                      const actualIndex = index + 1;
                      const isLastVisible = index === galleryPhotos.slice(1, 5).length - 1;
                      const showAllButton = isLastVisible && hasMorePhotos;
                      
                      return (
                        <div
                          key={photo.id || index}
                          className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                            index === 0 && galleryPhotos.length > 2 ? 'row-span-2 hidden md:block' : ''
                          }`}
                          onClick={() => {
                            setSelectedPhotoIndex(actualIndex);
                            setShowPhotoModal(true);
                          }}
                        >
                          <ListingImage
                            src={photo.url}
                            alt={`${property.title} - Photo ${actualIndex + 1}`}
                            variant="modalTile"
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                          {/* Show All Photos Overlay */}
                          {showAllButton && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowPhotoModal(true);
                                }}
                                className="px-4 py-2 bg-white rounded-xl font-medium text-gray-900 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                              >
                                <Grid className="h-4 w-4" />
                                Show all {photos.length} photos
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {/* Show all photos button for mobile when we have more than 5 photos */}
                    {hasMorePhotos && photos.length > 5 && (
                      <div className="col-span-2 md:hidden relative aspect-square rounded-lg overflow-hidden">
                        <button
                          onClick={() => setShowPhotoModal(true)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center"
                        >
                          <div className="px-4 py-2 bg-white rounded-xl font-medium text-gray-900 flex items-center gap-2">
                            <Grid className="h-4 w-4" />
                            Show all {photos.length} photos
                          </div>
                        </button>
                        {galleryPhotos[4] && (
                          <ListingImage
                            src={galleryPhotos[4].url}
                            alt={`${property.title} - Photo 5`}
                            variant="modalTile"
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-gray-200">
                <ListingImage
                  src={propertyImage}
                  alt={property.title}
                  variant="modalMain"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {/* Property Info */}
          <div className="p-6 border-t border-gray-200 overflow-y-auto flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {property.title}
                </h2>
                <div className="flex items-center gap-1 text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{property.location}</span>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-gray-900">{property.price}</div>
                <div className="text-sm text-gray-600">{property.priceUnit || 'per night'}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-medium text-gray-900">{property.rating}</span>
                <span>({property.reviews} reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{property.guests} guests</span>
              </div>
              <span>•</span>
              <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
              <span>•</span>
              <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
            </div>

            {/* Full Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this property</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700"
                    >
                      {amenity === "WiFi" && <Wifi className="h-4 w-4" />}
                      {amenity === "Parking" && <Car className="h-4 w-4" />}
                      {amenity === "Pool" && <Shield className="h-4 w-4" />}
                      {amenity === "Ocean View" && <MapPin className="h-4 w-4" />}
                      {amenity === "Safari" && <Shield className="h-4 w-4" />}
                      {amenity === "Game Drives" && <Car className="h-4 w-4" />}
                      {amenity === "Wine Tasting" && <Coffee className="h-4 w-4" />}
                      {amenity === "Vineyard Views" && <MapPin className="h-4 w-4" />}
                      {amenity === "Beach Access" && <MapPin className="h-4 w-4" />}
                      {amenity === "Whale Watching" && <Shield className="h-4 w-4" />}
                      {amenity === "Hiking" && <MapPin className="h-4 w-4" />}
                      {amenity === "Mountain Views" && <MapPin className="h-4 w-4" />}
                      {amenity === "Gym" && <Shield className="h-4 w-4" />}
                      {amenity === "City Views" && <MapPin className="h-4 w-4" />}
                      {amenity === "Air Conditioning" && <Shield className="h-4 w-4" />}
                      {amenity === "Kitchen" && <Shield className="h-4 w-4" />}
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Close
              </button>
              <Link
                href={`/accommodations/${property.id}/book`}
                onClick={onClose}
                className="flex-1 bg-right-stay-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-right-stay-600 transition-colors duration-200 text-center"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Photo Modal */}
      {showPhotoModal && photos.length > 0 && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90" 
          onClick={() => setShowPhotoModal(false)}
        >
          <div 
            className="relative w-full max-w-7xl max-h-[90vh] mx-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
              aria-label="Close modal"
            >
              <X className="h-6 w-6 text-gray-900" />
            </button>
            
            {/* Main Photo Display */}
            <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-4">
              {photos[selectedPhotoIndex] && (
                <>
                  {/* Instant preview from cached thumbnail while the main image decodes */}
                  <img
                    src={listingImageSrc(photos[selectedPhotoIndex].url, 'thumbnail')}
                    alt=""
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
                      lightboxMainLoaded ? 'opacity-0' : 'opacity-100'
                    } blur-sm scale-[1.02]`}
                  />
                  {!lightboxMainLoaded && (
                    <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-white/80" aria-hidden />
                    </div>
                  )}
                  <ListingImage
                    key={`lb-${photos[selectedPhotoIndex].id ?? selectedPhotoIndex}`}
                    src={photos[selectedPhotoIndex].url}
                    alt={`${property.title} - Photo ${selectedPhotoIndex + 1}`}
                    variant="lightbox"
                    fill
                    className={`object-contain transition-opacity duration-300 ${
                      lightboxMainLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    priority
                    onLoad={() => setLightboxMainLoaded(true)}
                    onError={() => setLightboxMainLoaded(true)}
                  />
                </>
              )}
              
              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedPhotoIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-900" />
                  </button>
                  <button
                    onClick={() => setSelectedPhotoIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white transition-colors shadow-lg"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-900" />
                  </button>
                </>
              )}

              {/* Photo Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
                {selectedPhotoIndex + 1} / {photos.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map((photo, index) => (
                <button
                  key={photo.id || index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedPhotoIndex
                      ? 'border-white ring-2 ring-white'
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  <ListingImage
                    src={photo.url}
                    alt={`Thumbnail ${index + 1}`}
                    variant="thumbnail"
                    sizes="96px"
                    fill
                    className="object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
