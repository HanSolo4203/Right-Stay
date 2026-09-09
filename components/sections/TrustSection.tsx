"use client";

import Image from "next/image";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { MARKETING_IMAGES } from "@/lib/marketing-images";
import { DollarSign, MessageSquare, Users, Shield } from "lucide-react";
import PremiumContentBlock from "@/components/premium/PremiumContentBlock";
import PremiumFeatureCard from "@/components/premium/PremiumFeatureCard";

const trustFeatures = [
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "No hidden fees, no surprises. What you see is what you pay.",
  },
  {
    icon: MessageSquare,
    title: "Verified Reviews",
    description: "Real experiences from real guests. Every review is authentic and verified.",
  },
  {
    icon: Users,
    title: "Owner Partnership",
    description:
      "We treat property owners as partners, with complete financial transparency and regular reporting.",
  },
  {
    icon: Shield,
    title: "Client Protection",
    description: "Comprehensive insurance and support to ensure your peace of mind.",
  },
];

export default function TrustSection() {
  return (
    <PremiumContentBlock
      eyebrow="Trust & Transparency"
      title="Built on Trust & Transparency"
      subtitle="At Right Stay Africa, exceptional hospitality starts with honesty and integrity. Every interaction is transparent, fair and mutually beneficial."
      variant="darker"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-lg shadow-black/30 animate-on-scroll"
        style={{ animation: "fadeSlideIn 1s ease-out 0.2s both" }}
      >
        <div className="relative min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]">
          <div className="absolute inset-0 bg-[#0b140f]" />

          <div
            className="absolute inset-0"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, transparent 6%, rgba(0,0,0,0.18) 22%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.88) 56%, black 72%)",
              maskImage:
                "linear-gradient(to right, transparent 0%, transparent 6%, rgba(0,0,0,0.18) 22%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.88) 56%, black 72%)",
            }}
          >
            <Image
              src={MARKETING_IMAGES.premiumAccommodationTile}
              alt="Premium accommodation interior"
              fill
              sizes={IMAGE_SIZES.hero}
              className="object-cover object-[68%_center]"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0b140f] from-0% via-[#0b140f]/70 via-[28%] to-transparent to-[58%]" />

          <div className="relative z-10 flex min-h-[280px] w-full max-w-[20rem] flex-col justify-between gap-6 px-6 py-8 sm:min-h-[320px] sm:max-w-md sm:gap-8 sm:px-10 sm:py-10 lg:min-h-[360px] lg:px-12 lg:py-12">
            <Image
              src="/rsa-logo-white.png"
              alt="Right Stay Africa"
              width={552}
              height={166}
              className="h-auto w-[148px] opacity-90 sm:w-[180px] lg:w-[210px]"
            />

            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-right-stay-400/90 sm:text-xs">
                Average Guest Rating
              </p>
              <div className="mt-4 flex items-center gap-4 sm:mt-5 sm:gap-5">
                <span className="font-display text-6xl font-medium leading-none tracking-tight text-white sm:text-7xl lg:text-[5.5rem]">
                  4.9
                </span>
                <span
                  className="h-12 w-px shrink-0 bg-right-stay-500 sm:h-16"
                  aria-hidden
                />
                <span className="font-display text-3xl font-medium leading-none text-white sm:text-4xl lg:text-5xl">
                  /5
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
              Trusted by our guests.
              <br />
              Committed to excellence.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 lg:gap-6">
        {trustFeatures.map((feature, index) => (
          <PremiumFeatureCard key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </PremiumContentBlock>
  );
}
