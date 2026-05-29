"use client";

import { Search, CheckCircle, Star } from "lucide-react";
import PremiumContentBlock from "@/components/premium/PremiumContentBlock";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search & Discover",
    description:
      "Browse our curated collection of premium properties across Africa. Filter by location, amenities, and price to find your perfect match.",
  },
  {
    number: "02",
    icon: CheckCircle,
    title: "Book with Confidence",
    description:
      "Secure your dates with instant confirmation. Transparent pricing and flexible policies ensure a worry-free booking experience.",
  },
  {
    number: "03",
    icon: Star,
    title: "Experience Excellence",
    description:
      "Arrive to a spotlessly clean, fully equipped property. Enjoy 24/7 support throughout your stay and create lasting memories.",
  },
];

export default function HowItWorksSection() {
  return (
    <PremiumContentBlock
      eyebrow="Simple Process"
      title="How It Works"
      subtitle="Your journey to an unforgettable African stay is just three simple steps away"
      centered
      variant="darker"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        {steps.map((step, index) => (
          <article
            key={step.number}
            className="relative text-center animate-on-scroll"
            style={{ animation: `fadeSlideIn 0.9s ease-out ${0.2 + index * 0.12}s both` }}
          >
            {index < steps.length - 1 && (
              <div className="pointer-events-none absolute top-14 left-[calc(50%+4rem)] hidden h-px w-[calc(100%-8rem)] bg-gradient-to-r from-right-stay-500/50 to-transparent lg:block" />
            )}

            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-lg backdrop-blur-xl transition-all duration-500 hover:border-right-stay-400/30 hover:shadow-[0_0_30px_rgba(51,126,47,0.2)]">
              <step.icon className="h-10 w-10 text-right-stay-300" strokeWidth={1.25} />
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-right-stay-400 mb-3">
              Step {step.number}
            </div>
            <h3 className="font-display text-xl font-semibold text-white sm:text-2xl mb-3">
              {step.title}
            </h3>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/60 sm:text-base">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </PremiumContentBlock>
  );
}
