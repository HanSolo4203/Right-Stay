"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import PremiumSectionBackground from "@/components/premium/PremiumSectionBackground";
import PremiumStatsStrip from "@/components/premium/PremiumStatsStrip";

const INTRO_STATS = [
  { value: "R58M+", label: "Assets Under Management", note: "Portfolio value" },
  { value: "500+", label: "Happy Guests", note: "Across our stays" },
  { value: "4.9/5", label: "Guest Rating", note: "Verified reviews" },
  { value: "~75%", label: "Avg. Occupancy", note: "Consistent performance" },
  { value: "100%", label: "Verified Properties", note: "Personally inspected" },
  { value: "24/7", label: "Guest Support", note: "Always available" },
];

export default function SecondHero() {
  useScrollAnimation();

  return (
    <PremiumSectionBackground
      variant="darker"
      className="!pt-[calc(var(--premium-hero-overlap)+2.5rem)] !pb-12 sm:!pt-[calc(var(--premium-hero-overlap)+3rem)] sm:!pb-16"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <p
            className="animate-on-scroll text-xs font-medium uppercase tracking-[0.28em] text-right-stay-400/90"
            style={{ animation: "fadeSlideIn 0.8s ease-out 0.05s both" }}
          >
            Right Stay Africa
          </p>
          <h2
            className="animate-on-scroll mt-4 font-display text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-7xl"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.12s both" }}
          >
            Come Right.
          </h2>

          <p
            className="animate-on-scroll mt-8 text-xl font-medium leading-relaxed text-white/80 sm:text-2xl max-w-3xl mx-auto"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.22s both" }}
          >
            End-to-end asset management, premium stays and destination experiences
            engineered for performance and guest satisfaction.
          </p>

          <p
            className="animate-on-scroll mt-6 text-lg font-semibold tracking-wide text-right-stay-300 sm:text-xl"
            style={{ animation: "fadeSlideIn 0.9s ease-out 0.32s both" }}
          >
            Built right. Managed right. Experienced right.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <PremiumStatsStrip stats={INTRO_STATS} className="!mt-12 sm:!mt-14" />
        </div>
      </div>
    </PremiumSectionBackground>
  );
}
