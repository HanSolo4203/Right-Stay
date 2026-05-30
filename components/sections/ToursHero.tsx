"use client";

import HeroBackgroundImage from "@/components/ui/HeroBackgroundImage";
import HeroPremiumFadeOverlay from "@/components/ui/HeroPremiumFadeOverlay";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { MARKETING_IMAGES } from "@/lib/marketing-images";

export default function ToursHero() {
  return (
    <>
      <div className="absolute inset-0">
        <HeroBackgroundImage
          src={MARKETING_IMAGES.safariLodge}
          className="pointer-events-none object-cover animate-[heroKenBurns_20s_ease-in-out_infinite_alternate]"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 42%, rgba(0,0,0,0.85) 62%, rgba(0,0,0,0.35) 82%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 42%, rgba(0,0,0,0.85) 62%, rgba(0,0,0,0.35) 82%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 60% at 50% 40%, rgba(51, 126, 47, 0.15), transparent 65%),
              linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 50%, rgba(12,26,20,0.85) 100%)
            `,
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl flex-col justify-center px-6 pb-24 pt-16 md:px-8 md:pb-32 md:pt-20 lg:min-h-[720px]">
          <p
            className="animate-on-scroll text-xs font-medium uppercase tracking-[0.32em] text-right-stay-400/90"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.1s both" }}
          >
            Curated African Experiences
          </p>

          <h1
            className="animate-on-scroll mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.06] tracking-tight text-white drop-shadow-xl sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ animation: "fadeSlideIn 1s ease-out 0.2s both" }}
          >
            Experience Africa
            <br />
            <span className="text-white/90">Properly</span>
          </h1>

          <p
            className="animate-on-scroll mt-7 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg lg:text-xl"
            style={{ animation: "fadeSlideIn 1s ease-out 0.35s both" }}
          >
            From vibrant cities and cultural encounters to wildlife adventures and hidden gems,
            discover Africa through carefully curated experiences designed to create unforgettable
            memories.
          </p>

          <div
            className="animate-on-scroll mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            style={{ animation: "fadeSlideIn 1s ease-out 0.5s both" }}
          >
            <Link
              href="#experiences"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-right-stay-500 px-8 py-4 text-sm font-semibold text-white shadow-[0_0_40px_rgba(51,126,47,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-right-stay-400 hover:shadow-[0_0_50px_rgba(51,126,47,0.45)]"
            >
              Explore Experiences
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10"
            >
              <Compass className="h-4 w-4" />
              Plan My Trip
            </Link>
          </div>
        </div>
      </div>

      <HeroPremiumFadeOverlay />
    </>
  );
}
