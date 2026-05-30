"use client";

import { CheckCircle } from "lucide-react";
import PremiumContentBlock from "@/components/premium/PremiumContentBlock";

const benefits = [
  "Higher occupancy through multi-channel distribution",
  "Optimised pricing that maximises revenue while staying competitive",
  "Professional listings with high-quality photography",
  "Automated guest communication and seamless check-in",
  "24/7 guest support for inquiries and issues",
  "Transparent financial reporting and timely payouts",
  "Maintenance coordination and quality assurance",
  "Marketing across all major booking channels",
];

export default function HostBenefitsSection() {
  return (
    <PremiumContentBlock
      eyebrow="For Property Owners"
      title="What You Get as an Owner"
      subtitle="Everything you need to run a premium short-term rental — without running it yourself."
      centered
    >
      <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-2 sm:gap-4">
        {benefits.map((benefit, index) => (
          <li
            key={benefit}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition-[border-color,background-color] duration-300 hover:border-right-stay-400/25 hover:bg-white/[0.07] animate-on-scroll"
            style={{ animation: `fadeSlideIn 0.5s ease-out ${0.08 + index * 0.03}s both` }}
          >
            <CheckCircle
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-right-stay-400"
              strokeWidth={1.5}
            />
            <span className="text-sm leading-relaxed text-white/75 sm:text-base">{benefit}</span>
          </li>
        ))}
      </ul>
    </PremiumContentBlock>
  );
}
