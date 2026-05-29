"use client";

import { CheckCircle } from "lucide-react";
import PremiumContentBlock from "@/components/premium/PremiumContentBlock";

const channelBenefits = [
  "Multi-channel distribution across Airbnb, Booking.com, Expedia, and Right Stay Direct",
  "Automated calendar synchronization prevents double bookings",
  "Unified inbox for guest communications across all platforms",
  "Consistent branding and professional listings on every channel",
  "Real-time availability updates across all booking platforms",
  "Comprehensive performance reporting by channel",
];

const pricingBenefits = [
  "AI-powered dynamic pricing adjusts rates based on demand patterns",
  "Seasonal optimization maximises revenue during peak periods",
  "Competitive market analysis ensures optimal pricing",
  "Last-minute booking discounts and long-stay incentives",
  "Event-based pricing adjustments for local happenings",
  "Automated rate updates across all channels in real-time",
];

function BenefitList({ items, startDelay }: { items: string[]; startDelay: number }) {
  return (
    <ul className="space-y-3">
      {items.map((benefit, index) => (
        <li
          key={benefit}
          className="flex items-start gap-3 rounded-lg border border-transparent p-2 transition-colors duration-300 hover:border-white/10 hover:bg-white/[0.03] animate-on-scroll"
          style={{ animation: `fadeSlideIn 0.8s ease-out ${startDelay + index * 0.06}s both` }}
        >
          <CheckCircle
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-right-stay-400"
            strokeWidth={1.5}
          />
          <span className="text-sm leading-relaxed text-white/70 sm:text-base">{benefit}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ChannelPartnersSection() {
  return (
    <PremiumContentBlock
      eyebrow="Distribution & Pricing"
      title="Reach More Guests. Earn More Per Night."
      subtitle="World-class channel partners and intelligent pricing — working together to maximise your property's performance."
      variant="darker"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-sm animate-on-scroll"
          style={{ animation: "fadeSlideIn 0.9s ease-out 0.2s both" }}
        >
          <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            Our Channel Partners
          </h3>
          <p className="mt-3 text-white/60 leading-relaxed">
            Expand your reach and maximise bookings by listing on the world&apos;s leading booking
            platforms simultaneously.
          </p>
          <div className="mt-6">
            <BenefitList items={channelBenefits} startDelay={0.3} />
          </div>
        </div>

        <div
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-sm animate-on-scroll"
          style={{ animation: "fadeSlideIn 0.9s ease-out 0.28s both" }}
        >
          <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            Dynamic Pricing Engine
          </h3>
          <p className="mt-3 text-white/60 leading-relaxed">
            Powered by PriceLabs, our intelligent pricing system ensures you always get the best rate
            for your property.
          </p>
          <div className="mt-6">
            <BenefitList items={pricingBenefits} startDelay={0.35} />
          </div>
        </div>
      </div>
    </PremiumContentBlock>
  );
}
