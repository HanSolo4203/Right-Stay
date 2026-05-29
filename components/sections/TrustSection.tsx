"use client";

import Image from "next/image";
import { IMAGE_SIZES } from "@/lib/image-sizes";
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
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {trustFeatures.map((feature, index) => (
            <PremiumFeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>

        <div
          className="relative h-[480px] sm:h-[560px] animate-on-scroll"
          style={{ animation: "fadeSlideIn 1s ease-out 0.3s both" }}
        >
          <div className="absolute -inset-3 rounded-3xl bg-right-stay-500/15 blur-2xl" />
          <div className="relative h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src="/images/993d5154-c104-4507-8c0a-55364d2a948c_800w_1.jpg"
              alt="Modern African luxury accommodation"
              fill
              sizes={IMAGE_SIZES.half}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/15 bg-black/55 p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="font-display text-4xl font-bold text-white sm:text-5xl">4.9/5</div>
                  <div className="mt-1 text-sm text-white/60">Average Guest Rating</div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${star <= 4 ? "text-amber-400 fill-current" : "text-amber-400 fill-current opacity-50"}`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PremiumContentBlock>
  );
}
