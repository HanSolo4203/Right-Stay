"use client";

import { useState, useEffect, useCallback } from 'react';
import HeroBackgroundImage from '@/components/ui/HeroBackgroundImage';
import { glassFrostPanel } from '@/lib/glass-styles';
import { cn } from '@/lib/utils';
import { Quote, User, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: string;
  guest_name: string;
  location: string;
  rating: number;
  testimonial: string;
  featured: boolean;
}

/** Matches --premium-surface-gradient stops for seamless section stacking */
const PREMIUM_EDGE_TOP = '#121816';
const PREMIUM_EDGE_BOTTOM = '#0c1a14';

const testimonialEdgeBlend = `linear-gradient(
  to bottom,
  ${PREMIUM_EDGE_TOP} 0%,
  ${PREMIUM_EDGE_TOP} 10%,
  rgba(18, 24, 22, 0.98) 16%,
  rgba(18, 24, 22, 0.75) 24%,
  transparent 38%,
  transparent 62%,
  rgba(12, 26, 20, 0.75) 76%,
  rgba(12, 26, 20, 0.98) 84%,
  ${PREMIUM_EDGE_BOTTOM} 90%,
  ${PREMIUM_EDGE_BOTTOM} 100%
)`;

const testimonialRibbonMask =
  'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)';

export default function TestimonialSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews?limit=100');
        const data = await response.json();

        if (data.reviews && data.reviews.length > 0) {
          const featured = data.reviews.filter((r: Review) => r.featured);
          const others = data.reviews.filter((r: Review) => !r.featured);
          setReviews([...featured, ...others]);
          setCurrentIndex(0);
        } else {
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

  useEffect(() => {
    if (!isAutoPlaying || userInteracted || reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

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
    <section
      className="isolate relative scroll-contain-section overflow-hidden py-14 md:py-20 min-h-[560px] md:min-h-[600px]"
      style={{ backgroundColor: PREMIUM_EDGE_TOP }}
    >
      {/* Continuous premium surface + subtle animated ribbon */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${PREMIUM_EDGE_TOP} 0%, #0a100e 42%, #080d0b 58%, ${PREMIUM_EDGE_BOTTOM} 100%)`,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.28] saturate-[0.5] brightness-[0.55] contrast-[1.08]"
          style={{
            WebkitMaskImage: testimonialRibbonMask,
            maskImage: testimonialRibbonMask,
          }}
        >
          <div className="absolute -inset-[12%] testimonial-ribbon-drift">
            <HeroBackgroundImage
              src="/images/testimonial-ribbon-flow-brand.png"
              alt=""
              className="pointer-events-none object-cover object-center"
            />
          </div>
        </div>

        <div
          className="absolute inset-0 testimonial-ribbon-glow mix-blend-soft-light"
          style={{
            background:
              'radial-gradient(ellipse 85% 65% at 50% 52%, rgba(35, 80, 32, 0.35), transparent 72%)',
          }}
        />

        <div className="testimonial-atmosphere">
          <div className="testimonial-atmosphere__fog testimonial-atmosphere__fog--primary" />
          <div className="testimonial-atmosphere__fog testimonial-atmosphere__fog--secondary testimonial-atmosphere__fog--deep" />
          <div className="testimonial-atmosphere__particles" />
          <div className="testimonial-atmosphere__particles-alt" />
          <div className="testimonial-atmosphere__dust" />
          <div className="testimonial-atmosphere__vignette" />
        </div>

        <div
          className="absolute inset-0"
          style={{ background: testimonialEdgeBlend }}
        />
      </div>

      <div className="relative z-10 flex min-h-[520px] md:min-h-[560px] items-center overflow-hidden">
        {reviews.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 md:left-8 z-20 rounded-full border border-white/20 bg-black/50 p-3 transition-[transform,background-color] hover:scale-105 hover:bg-black/65"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-6 w-6 text-white" strokeWidth={2.5} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 md:right-8 z-20 rounded-full border border-white/20 bg-black/50 p-3 transition-[transform,background-color] hover:scale-105 hover:bg-black/65"
              aria-label="Next review"
            >
              <ChevronRight className="h-6 w-6 text-white" strokeWidth={2.5} />
            </button>
          </>
        )}

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col justify-center px-6 py-8 md:px-8">
          <div
            className={cn(
              'rounded-3xl px-6 py-8 sm:px-10 sm:py-10 ring-1 ring-white/10 bg-black/55 max-md:bg-black/85 max-md:backdrop-blur-none',
              glassFrostPanel,
            )}
          >
            <span
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15"
              style={{ animation: 'fadeSlideIn 1.0s ease-out 0.1s both' }}
            >
              <Quote className="h-3.5 w-3.5" strokeWidth={2} />
              {currentReview ? `${currentReview.rating}/5 Guest Review` : 'Guest Review'}
              {reviews.length > 1 && (
                <span className="ml-2 text-white/60">
                  ({currentIndex + 1} of {reviews.length})
                </span>
              )}
            </span>

            {loading ? (
              <div className="mt-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/60" />
              </div>
            ) : currentReview ? (
              <div
                key={`${currentReview.id}-${currentIndex}`}
                className="animate-fade-in mt-6 flex max-w-full flex-col"
              >
                <p
                  className="max-h-[400px] overflow-y-auto break-words px-1 text-base font-medium leading-relaxed tracking-tight text-white sm:text-lg md:text-xl"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    scrollbarWidth: 'thin',
                    textShadow: '0 1px 2px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.65)',
                  }}
                >
                  &quot;{currentReview.testimonial}&quot;
                </p>

                <div className="mt-6 flex flex-shrink-0 items-center justify-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                    <User className="h-4.5 w-4.5 text-white" strokeWidth={2} />
                  </span>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">{currentReview.guest_name}</div>
                    <div className="text-xs text-white/75">{currentReview.location}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex max-w-full flex-col">
                <p
                  className="text-base font-medium leading-relaxed text-white sm:text-lg md:text-xl"
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    textShadow: '0 1px 2px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.65)',
                  }}
                >
                  &quot;Our stay with Right Stay Africa was absolutely perfect. The property exceeded our expectations, and the team was incredibly responsive. We can&apos;t wait to return!&quot;
                </p>
              </div>
            )}

            {reviews.length > 1 && (
              <div className="mt-6 flex flex-shrink-0 items-center justify-center gap-2">
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
                        : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
