"use client";

import PremiumFeatureCard from "./PremiumFeatureCard";
import type { PremiumFeature } from "./PremiumWhySection";

type PremiumFeatureCardGridProps = {
  features: PremiumFeature[];
};

export default function PremiumFeatureCardGrid({ features }: PremiumFeatureCardGridProps) {
  return (
    <>
      {/* Mobile: horizontal scroll carousel */}
      <div
        className="flex gap-4 overflow-x-auto overscroll-x-contain pb-4 -mx-6 px-6 snap-x snap-mandatory scroll-pl-6 scroll-pr-6 scrollbar-hide touch-pan-x sm:hidden"
        aria-label="Features"
      >
        {features.map((feature, index) => (
          <PremiumFeatureCard
            key={feature.title}
            {...feature}
            index={index}
            variant="carousel"
          />
        ))}
      </div>

      {/* Tablet: 2-column grid */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-5 lg:hidden">
        {features.map((feature, index) => (
          <PremiumFeatureCard key={feature.title} {...feature} index={index} variant="grid" />
        ))}
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
        {features.map((feature, index) => (
          <PremiumFeatureCard key={feature.title} {...feature} index={index} variant="grid" />
        ))}
      </div>
    </>
  );
}
