"use client";

import Image from "next/image";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import PremiumSectionBackground from "@/components/premium/PremiumSectionBackground";
import PremiumFeatureCardGrid from "@/components/premium/PremiumFeatureCardGrid";
import { TOUR_WHY_COLLAGE, TOUR_WHY_FEATURES } from "@/lib/tours-content";

export default function ToursWhySection() {
  return (
    <PremiumSectionBackground>
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="lg:pr-4">
            <p
              className="animate-on-scroll text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
              style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
            >
              Why Travel With Us
            </p>
            <h2
              className="animate-on-scroll mt-4 font-display text-3xl font-medium leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-[3.25rem]"
              style={{ animation: "fadeSlideIn 0.9s ease-out 0.12s both" }}
            >
              More Than A Tour.
              <br />
              <span className="text-white/85">An Experience.</span>
            </h2>
            <p
              className="animate-on-scroll mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg"
              style={{ animation: "fadeSlideIn 0.9s ease-out 0.2s both" }}
            >
              At Right Stay Africa, we don&apos;t believe in one-size-fits-all travel. Every
              experience is thoughtfully curated to connect you with the people, places and stories
              that make Africa extraordinary.
            </p>
          </div>

          <div
            className="relative h-[380px] sm:h-[440px] lg:h-[520px] animate-on-scroll"
            style={{ animation: "fadeSlideIn 1s ease-out 0.35s both" }}
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-right-stay-500/15 to-transparent md:blur-xl" />
            <div className="relative grid h-full grid-cols-2 grid-rows-2 gap-3 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
              {TOUR_WHY_COLLAGE.map((img) => (
                <div key={img.src} className={`relative overflow-hidden ${img.className}`}>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={IMAGE_SIZES.half}
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              ))}
            </div>
            <div
              className="absolute -bottom-4 -left-4 right-8 rounded-xl border border-white/15 bg-black/75 p-4 shadow-lg sm:right-12 sm:p-5 md:bg-black/60 md:backdrop-blur-xl"
              style={{ animation: "fadeSlideIn 0.6s ease-out 0.2s both" }}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Experiences Curated</p>
              <p className="font-display mt-1 text-xl font-semibold text-white sm:text-2xl">50+ Destinations</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-right-stay-500 to-right-stay-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <p
            className="animate-on-scroll mb-8 text-center text-xs font-medium uppercase tracking-[0.22em] text-white/40"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.1s both" }}
          >
            What sets us apart
          </p>
          <PremiumFeatureCardGrid features={TOUR_WHY_FEATURES} />
        </div>
      </div>
    </PremiumSectionBackground>
  );
}
