"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Quote, User, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Review {
  id: string;
  guest_name: string;
  location: string;
  rating: number;
  testimonial: string;
  featured: boolean;
}

export default function TestimonialSection() {
  useScrollAnimation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // Fetch all reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch all active reviews
        const response = await fetch('/api/reviews?limit=100');
        const data = await response.json();

        if (data.reviews && data.reviews.length > 0) {
          // Prioritize featured reviews first, then others
          const featured = data.reviews.filter((r: Review) => r.featured);
          const others = data.reviews.filter((r: Review) => !r.featured);
          const sortedReviews = [...featured, ...others];
          setReviews(sortedReviews);
          setCurrentIndex(0);
        } else {
          // Fallback to default review if no reviews in database
          setReviews([{
            id: 'default',
            guest_name: 'Sarah Johnson',
            location: 'Cape Town, South Africa',
            rating: 5,
            testimonial: "Our stay with Right Stay Africa was absolutely perfect. The property exceeded our expectations, and the team was incredibly responsive. We can't wait to return!",
            featured: true,
          }]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Fallback to default review if API fails
        setReviews([{
          id: 'default',
          guest_name: 'Sarah Johnson',
          location: 'Cape Town, South Africa',
          rating: 5,
          testimonial: "Our stay with Right Stay Africa was absolutely perfect. The property exceeded our expectations, and the team was incredibly responsive. We can't wait to return!",
          featured: true,
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Auto-cycle through reviews
  useEffect(() => {
    if (!isAutoPlaying || userInteracted || reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000); // Change review every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, userInteracted, reviews.length]);

  const goToNext = useCallback(() => {
    setUserInteracted(true);
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const goToPrevious = useCallback(() => {
    setUserInteracted(true);
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  const currentReview = reviews[currentIndex];

  return (
    <section className="isolate overflow-hidden h-screen relative">
      <Image
        src="/images/6b428a64-0de1-4837-bab2-9729ce2e28c2_3840w_1.jpg"
        alt="Atmospheric mountain landscape"
        fill
        sizes="100vw"
        className="pointer-events-none object-cover"
      />
      <div className="z-10 flex h-full relative items-center">
        {/* Navigation Arrows */}
        {reviews.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 md:left-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 md:right-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all hover:scale-110"
              aria-label="Next review"
            >
              <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
            </button>
          </>
        )}

        <div className="md:px-8 text-center max-w-4xl mr-auto ml-auto pr-6 pl-6 relative z-10">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase ring-white/10 ring-1 animate-on-scroll text-white/70 tracking-[0.18em] bg-white/5 rounded-full pt-1 pr-3 pb-1 pl-3" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.1s both' }}>
            <Quote className="h-3.5 w-3.5" strokeWidth={2} />
            {currentReview ? `${currentReview.rating}/5 Guest Review` : 'Guest Review'}
            {reviews.length > 1 && (
              <span className="ml-2 text-white/50">
                ({currentIndex + 1} of {reviews.length})
              </span>
            )}
          </span>

          {loading ? (
            <div className="flex items-center justify-center mt-6">
              <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
            </div>
          ) : currentReview ? (
            <div key={`${currentReview.id}-${currentIndex}`} className="animate-fade-in">
              <p className="sm:text-4xl md:text-5xl text-3xl font-medium text-white tracking-tight mt-6 drop-shadow-xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
                &quot;{currentReview.testimonial}&quot;
              </p>

              <div className="flex mt-6 gap-x-3 gap-y-3 items-center justify-center">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <User className="h-4.5 w-4.5 text-white/80" strokeWidth={2} />
                </span>
                <div className="text-left">
                  <div className="text-sm font-medium text-white/90">{currentReview.guest_name}</div>
                  <div className="text-xs text-white/60">{currentReview.location}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="sm:text-4xl md:text-5xl text-3xl font-medium text-white tracking-tight mt-6 drop-shadow-xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              &quot;Our stay with Right Stay Africa was absolutely perfect. The property exceeded our expectations, and the team was incredibly responsive. We can&apos;t wait to return!&quot;
            </p>
          )}

          {/* Review Indicators */}
          {reviews.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setUserInteracted(true);
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_60%_at_50%_40%,rgba(0,0,0,0.05),rgba(0,0,0,0.7)),linear-gradient(to_top,rgba(0,0,0,0.85),rgba(0,0,0,0.35))]"></div>

      <div className="absolute inset-x-0 bottom-8 z-10">
        <div className="flex flex-wrap animate-on-scroll text-white/55 max-w-5xl mr-auto ml-auto gap-x-10 gap-y-4 items-center justify-center" style={{ animation: 'fadeSlideIn 1.0s ease-out 0.4s both' }}>
          <span className="text-sm text-white/70">Trusted by travelers from</span>
          {[
            { name: 'Cape Town' },
            { name: 'Johannesburg' },
            { name: 'Durban' },
            { name: 'Pretoria' }
          ].map((city) => (
            <span key={city.name} className="inline-flex items-center gap-2 text-sm">
              {city.name}
            </span>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  );
}

