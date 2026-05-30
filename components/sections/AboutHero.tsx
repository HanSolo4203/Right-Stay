"use client";

import { useRef } from "react";
import GreenParticleBackground from "@/components/ui/GreenParticleBackground";

export default function AboutHero() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={heroRef} className="absolute inset-0">
      <div className="hero-bg-fade absolute inset-0 bg-[#121816]">
        <GreenParticleBackground
          interactionRef={heroRef}
          className="pointer-events-none z-0"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 65% 55% at 50% 38%, rgba(51, 126, 47, 0.18), transparent 68%),
              radial-gradient(55% 55% at 50% 55%, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.28))
            `,
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl flex-col justify-center px-6 pb-20 pt-16 md:px-8 md:pb-28 md:pt-20 lg:min-h-[720px]">
          <p
            className="animate-on-scroll text-xs font-medium uppercase tracking-[0.32em] text-right-stay-400/90"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.1s both" }}
          >
            About Right Stay Africa
          </p>

          <h1
            className="animate-on-scroll mt-5 max-w-4xl font-display text-4xl font-medium leading-[1.08] tracking-tight text-white drop-shadow-xl sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ animation: "fadeSlideIn 1s ease-out 0.2s both" }}
          >
            Built From Experience.
            <br />
            <span className="text-white/90">Driven By Standards.</span>
          </h1>

          <p
            className="animate-on-scroll mt-7 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg lg:text-xl"
            style={{ animation: "fadeSlideIn 1s ease-out 0.35s both" }}
          >
            Right Stay Africa was founded by property owners who believed hospitality, transparency
            and asset management could be done better.
          </p>
        </div>
      </div>
    </div>
  );
}
