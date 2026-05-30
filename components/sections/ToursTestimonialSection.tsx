"use client";

import { useState, useEffect, useCallback } from "react";
import HeroBackgroundImage from "@/components/ui/HeroBackgroundImage";
import { glassFrostPanel } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { TOUR_TESTIMONIALS } from "@/lib/tours-content";

const PREMIUM_EDGE_TOP = "#121816";
const PREMIUM_EDGE_BOTTOM = "#0c1a14";

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
  "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)";

export default function ToursTestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  const reviews = TOUR_TESTIMONIALS;

  useEffect(() => {
    if (!isAutoPlaying || userInteracted || reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);

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
              "radial-gradient(ellipse 85% 65% at 50% 52%, rgba(35, 80, 32, 0.35), transparent 72%)",
          }}
        />

        <div className="testimonial-atmosphere">
          <div className="testimonial-atmosphere__fog testimonial-atmosphere__fog--primary" />
          <div className="testimonial-atmosphere__fog testimonial-atmosphere__fog--secondary testimonial-atmosphere__fog--deep" />
          <div className="testimonial-atmosphere__particles" />
          <div className="testimonial-atmosphere__vignette" />
        </div>

        <div className="absolute inset-0" style={{ background: testimonialEdgeBlend }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-10 text-center md:mb-12">
          <p
            className="animate-on-scroll text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
          >
            Guest Stories
          </p>
          <h2
            className="animate-on-scroll mt-3 font-display text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-5xl"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.12s both" }}
          >
            Travellers Who Experienced Africa Properly
          </h2>
        </div>
      </div>

      <div className="relative z-10 flex min-h-[400px] items-center overflow-hidden md:min-h-[440px]">
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
              "rounded-3xl px-6 py-8 sm:px-10 sm:py-10 ring-1 ring-white/10 bg-black/55 max-md:bg-black/85 max-md:backdrop-blur-none",
              glassFrostPanel,
            )}
          >
            <span
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/15"
              style={{ animation: "fadeSlideIn 1.0s ease-out 0.1s both" }}
            >
              <Quote className="h-3.5 w-3.5" strokeWidth={2} />
              Travel Review
              {reviews.length > 1 && (
                <span className="ml-2 text-white/60">
                  ({currentIndex + 1} of {reviews.length})
                </span>
              )}
            </span>

            {currentReview && (
              <div
                key={`${currentReview.id}-${currentIndex}`}
                className="animate-fade-in mt-6 flex max-w-full flex-col"
              >
                <div className="mb-5 flex items-center gap-1">
                  {Array.from({ length: currentReview.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-right-stay-400 text-right-stay-400"
                      strokeWidth={0}
                    />
                  ))}
                </div>

                <p className="max-h-[320px] overflow-y-auto break-words px-1 text-base font-medium leading-relaxed tracking-tight text-white sm:text-lg md:text-xl">
                  &quot;{currentReview.review}&quot;
                </p>

                <div className="mt-6 flex flex-shrink-0 items-center gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-right-stay-500/30 to-right-stay-600/20 text-sm font-semibold text-white ring-1 ring-white/20">
                    {currentReview.initials}
                  </span>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">{currentReview.guestName}</div>
                    <div className="mt-0.5 text-xs text-right-stay-400/90">
                      {currentReview.locationVisited}
                    </div>
                  </div>
                </div>
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
                        ? "w-8 bg-right-stay-400"
                        : "w-2 bg-white/40 hover:bg-white/60"
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
